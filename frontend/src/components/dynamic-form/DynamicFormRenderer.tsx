"use client";

import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { FileText, Users, Clock, HelpCircle, Search, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { Question, FormSection, FormData } from "@shared";
import { emailService, EmailData, GrantTeamEmailData } from "@/lib/emailService";

interface DynamicFormRendererProps {
  questions: Question[];
  sections: FormSection[];
  onSimpleQuerySuccess?: (submissionId?: string) => void;
  onComplexQuerySuccess?: () => void;
}

export function DynamicFormRenderer({ 
  questions, 
  sections, 
  onSimpleQuerySuccess, 
  onComplexQuerySuccess 
}: DynamicFormRendererProps) {
  const { register, handleSubmit, control, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>();
  
  const [otherFields, setOtherFields] = useState<{[key: string]: boolean}>({});
  const formValues = watch();

  const visibleQuestions = questions.filter(q => q.visible);
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  const getQueryType = () => {
    const queryTypeQuestion = questions.find(q => q.id === "query-type");
    if (!queryTypeQuestion) return "";
    const value = formValues[queryTypeQuestion.id];
    return Array.isArray(value) ? value[0] || "" : value || "";
  };

  // Check question visibility with circular dependency protection
  const isQuestionVisible = (question: Question, checkingStack: Set<string> = new Set()): boolean => {
    // Prevent infinite recursion
    if (checkingStack.has(question.id)) {
      return false;
    }
    
    // Check query type visibility
    const queryType = getQueryType();
    if (question.conditional?.dependsOn === "query-type" && question.conditional.showWhen) {
      return question.conditional.showWhen.includes(queryType);
    }

    // Check other conditional dependencies
    if (question.conditional && question.conditional.dependsOn) {
      const dependentValue = formValues[question.conditional.dependsOn];
      
      // First check if the question we depend on is itself visible
      const dependentQuestion = questions.find(q => q.id === question.conditional?.dependsOn);
      if (dependentQuestion) {
        checkingStack.add(question.id);
        const isParentVisible = isQuestionVisible(dependentQuestion, checkingStack);
        checkingStack.delete(question.id);
        
        if (!isParentVisible) {
          return false;
        }
      }
      
      if (question.conditional?.showWhen) {
        if (Array.isArray(dependentValue)) {
          return question.conditional.showWhen.some((val: string) => dependentValue.includes(val));
        }
        return question.conditional.showWhen.includes(dependentValue);
      }
    }

    return true;
  };

  // Clear values for invisible questions
  useEffect(() => {
    const invisibleQuestions = visibleQuestions.filter(q => !isQuestionVisible(q));
    invisibleQuestions.forEach(q => {
      if (formValues[q.id] !== undefined && formValues[q.id] !== null && formValues[q.id] !== '') {
        setValue(q.id, undefined);
      }
    });
  }, [formValues, visibleQuestions, setValue]);

  const isSectionVisible = (section: FormSection) => {
    const queryType = getQueryType();
    
    // Check section conditional logic
    if (section.conditional) {
      const dependentValue = formValues[section.conditional.dependsOn];
      if (Array.isArray(dependentValue)) {
        return section.conditional.showWhen.some(val => dependentValue.includes(val));
      }
      return section.conditional.showWhen.includes(dependentValue);
    }
    
    return true;
  };

  const handleCheckboxChange = (questionId: string, value: string, currentValues: string[] = []) => {
    const updatedValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    setValue(questionId, updatedValues);
  };

  const onSubmit = async (data: FormData) => {
    try {
      console.log("Form submitted:", data);
      
      const queryType = getQueryType() as 'simple' | 'complex';
      const submissionId = `submission_${Date.now()}`;
      
      // Send confirmation email to user
      const userEmail = data.email as string;
      const userName = data.name as string;
      
      if (userEmail && userName && emailService.isConfigured()) {
        const emailData: EmailData = {
          to: userEmail,
          subject: "Contract Advice Request Confirmation",
          submitterName: userName,
          submitterEmail: userEmail,
          submissionId,
          queryType,
          timestamp: new Date().toISOString()
        };
        
        try {
          console.log('📧 FORM: Sending USER CONFIRMATION email to:', userEmail);
          const emailSent = await emailService.sendConfirmationEmail(emailData);
          if (emailSent) {
            console.log('✅ FORM: User confirmation email sent successfully to:', userEmail);
          } else {
            console.warn('⚠️ FORM: Failed to send user confirmation email');
          }
        } catch (emailError) {
          console.error('❌ FORM: User confirmation email service error:', emailError);
          // Don't fail the form submission if email fails
        }
      }
      
      if (queryType === "simple") {
        toast.success("Simple request submitted successfully! Check your email for confirmation.");
        setTimeout(() => {
          onSimpleQuerySuccess?.(submissionId);
        }, 1000);
      } else if (queryType === "complex") {
        // Send notification email to grant team for complex queries
        if (userEmail && userName && emailService.isConfigured()) {
          const grantTeamEmailData: GrantTeamEmailData = {
            to: "grants@example.com", // This should be configured
            subject: "New Complex Contract Advice Request",
            submissionId,
            queryType: 'complex',
            submitterName: userName,
            submitterEmail: userEmail,
            timestamp: new Date().toISOString(),
            formData: data,
            grantTeam: Array.isArray(data['grants-team']) ? data['grants-team'] : [],
            urgency: data['is-urgent'] === 'yes'
          };
          
          try {
            console.log('📧 FORM: Sending GRANT TEAM NOTIFICATION for complex query:', submissionId);
            const grantEmailSent = await emailService.sendGrantTeamNotification(grantTeamEmailData);
            if (grantEmailSent) {
              console.log('✅ FORM: Grant team notification sent successfully for complex query:', submissionId);
            } else {
              console.warn('⚠️ FORM: Failed to send grant team notification');
            }
          } catch (grantEmailError) {
            console.error('❌ FORM: Grant team notification error:', grantEmailError);
            // Don't fail the form submission if grant team email fails
          }
        }
        
        toast.success("Complex request submitted successfully! Check your email for confirmation.");
        setTimeout(() => {
          onComplexQuerySuccess?.();
        }, 1000);
      } else {
        toast.success("Form submitted successfully! Check your email for confirmation.");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to submit request. Please try again.");
    }
  };

  const renderQuestion = (question: Question) => {
    if (!isQuestionVisible(question)) return null;

    const fieldName = question.id;
    const currentValue = formValues[fieldName];

    const getValidationRules = () => {
      const rules: any = {};
      if (question.required) {
        if (question.type === 'checkbox') {
          rules.validate = (value: any) => 
            value && value.length > 0 ? true : `${question.label} is required`;
        } else {
          rules.required = `${question.label} is required`;
        }
      }

      if (question.type === 'email') {
        rules.pattern = {
          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
          message: "Invalid email address"
        };
      }

      if (question.validation) {
        if (question.validation.minLength) {
          rules.minLength = {
            value: question.validation.minLength,
            message: `Minimum length is ${question.validation.minLength} characters`
          };
        }
        if (question.validation.maxLength) {
          rules.maxLength = {
            value: question.validation.maxLength,
            message: `Maximum length is ${question.validation.maxLength} characters`
          };
        }
        if (question.validation.pattern) {
          rules.pattern = {
            value: new RegExp(question.validation.pattern),
            message: "Invalid format"
          };
        }
      }

      return rules;
    };

    switch (question.type) {
      case 'text':
      case 'email':
        return (
          <div key={question.id} className="space-y-2">
            <Label htmlFor={question.id} className="text-sm font-medium">
              {question.label}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {question.helpText && (
              <p className="text-sm text-muted-foreground">{question.helpText}</p>
            )}
            <Input
              id={question.id}
              type={question.type}
              placeholder={question.placeholder}
              {...register(question.id, getValidationRules())}
              className={errors[question.id] ? "border-red-500" : ""}
            />
            {errors[question.id] && (
              <p className="text-sm text-red-500">{String(errors[question.id]?.message || '')}</p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={question.id} className="space-y-2">
            <Label htmlFor={question.id} className="text-sm font-medium">
              {question.label}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {question.helpText && (
              <p className="text-sm text-muted-foreground">{question.helpText}</p>
            )}
            <Textarea
              id={question.id}
              placeholder={question.placeholder}
              {...register(question.id, getValidationRules())}
              className={`min-h-[100px] ${errors[question.id] ? "border-red-500" : ""}`}
            />
            {errors[question.id] && (
              <p className="text-sm text-red-500">{String(errors[question.id]?.message || '')}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={question.id} className="space-y-2">
            <Label className="text-sm font-medium">
              {question.label}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {question.helpText && (
              <p className="text-sm text-muted-foreground">{question.helpText}</p>
            )}
            <Controller
              name={question.id}
              control={control}
              rules={getValidationRules()}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className={errors[question.id] ? "border-red-500" : ""}>
                    <SelectValue placeholder={question.placeholder || "Select an option"} />
                  </SelectTrigger>
                  <SelectContent>
                    {question.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors[question.id] && (
              <p className="text-sm text-red-500">{String(errors[question.id]?.message || '')}</p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={question.id} className="space-y-3">
            <Label className="text-sm font-medium">
              {question.label}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {question.helpText && (
              <p className="text-sm text-muted-foreground">{question.helpText}</p>
            )}
            <div className="space-y-3">
              {question.options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-3">
                  <Controller
                    name={question.id}
                    control={control}
                    rules={getValidationRules()}
                    render={({ field }) => (
                      <Checkbox
                        id={`${question.id}-${option.value}`}
                        checked={Array.isArray(field.value) ? field.value.includes(option.value) : false}
                        onCheckedChange={(checked) => {
                          const currentValues = Array.isArray(field.value) ? field.value : [];
                          handleCheckboxChange(question.id, option.value, currentValues);
                        }}
                      />
                    )}
                  />
                  <Label
                    htmlFor={`${question.id}-${option.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
            {errors[question.id] && (
              <p className="text-sm text-red-500">{String(errors[question.id]?.message || '')}</p>
            )}
          </div>
        );

      case 'radio':
        return (
          <div key={question.id} className="space-y-3">
            <Label className="text-sm font-medium">
              {question.label}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {question.helpText && (
              <p className="text-sm text-muted-foreground">{question.helpText}</p>
            )}
            <Controller
              name={question.id}
              control={control}
              rules={getValidationRules()}
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="space-y-3"
                >
                  {question.options?.map((option) => (
                    <div key={option.value} className="flex items-center space-x-3">
                      <RadioGroupItem
                        value={option.value}
                        id={`${question.id}-${option.value}`}
                      />
                      <Label
                        htmlFor={`${question.id}-${option.value}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            />
            {errors[question.id] && (
              <p className="text-sm text-red-500">{String(errors[question.id]?.message || '')}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const getIconComponent = (iconName?: string) => {
    switch (iconName) {
      case 'User': return <Users className="w-5 h-5" />;
      case 'Users': return <Users className="w-5 h-5" />;
      case 'Clock': return <Clock className="w-5 h-5" />;
      case 'HelpCircle': return <HelpCircle className="w-5 h-5" />;
      case 'FileText': return <FileText className="w-5 h-5" />;
      case 'Search': return <Search className="w-5 h-5" />;
      case 'Settings': return <Settings className="w-5 h-5" />;
      default: return <HelpCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Contract Advice Request Form
          </h1>
          <p className="text-gray-600">
            Please complete this form to submit your contract advice request
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {sortedSections.map((section) => {
            if (!isSectionVisible(section)) return null;

            const sectionQuestions = visibleQuestions
              .filter(q => q.sectionId === section.id)
              .sort((a, b) => a.order - b.order);

            if (sectionQuestions.length === 0) return null;

            return (
              <Card key={section.id} className="border border-gray-200 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    {getIconComponent(section.icon)}
                    <h2 className="text-lg font-medium text-gray-900">
                      {section.title}
                    </h2>
                  </div>
                  {section.description && (
                    <p className="text-sm text-gray-600 mb-6">
                      {section.description}
                    </p>
                  )}

                  <div className="space-y-4">
                    {sectionQuestions.map(renderQuestion)}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-black hover:bg-gray-800 text-white px-8 py-2"
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
