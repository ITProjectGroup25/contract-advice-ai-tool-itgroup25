'use client';

import { useForm, Controller } from "react-hook-form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import { FileText, Users, Clock, HelpCircle, Search, Settings } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Question, FormSection } from "./AdminInterface";
import { exportFormSubmissionAsSQL } from "../_utils/sqlExport";
import { emailService, EmailData, GrantTeamEmailData } from "../_utils/emailService";
import { FileUpload } from "./FileUpload";

interface DynamicFormRendererProps {
  questions: Question[];
  sections: FormSection[];
  onSimpleQuerySuccess?: (submissionId?: string) => void;
  onComplexQuerySuccess?: () => void;
}

interface FormData {
  [key: string]: any;
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

  const getQueryType = useCallback(() => {
    const queryTypeQuestion = questions.find(q => q.id === "query-type");
    if (!queryTypeQuestion) return "";
    return formValues[queryTypeQuestion.id] || "";
  }, [formValues, questions]);

  const isQuestionVisible = useCallback((question: Question, checkingStack: Set<string> = new Set()): boolean => {
    if (checkingStack.has(question.id)) {
      return false;
    }

    const conditional = question.conditional;

    if (!conditional) {
      return true;
    }

    const queryType = getQueryType();
    if (conditional.dependsOn === "query-type") {
      return conditional.showWhen.includes(queryType);
    }

    const dependentValue = formValues[conditional.dependsOn];
    const dependentQuestion = questions.find(
      (candidate) => candidate.id === conditional.dependsOn,
    );

    if (dependentQuestion) {
      checkingStack.add(question.id);
      const isParentVisible = isQuestionVisible(dependentQuestion, checkingStack);
      checkingStack.delete(question.id);

      if (!isParentVisible) {
        return false;
      }
    }

    if (Array.isArray(dependentValue)) {
      return conditional.showWhen.some((value) => dependentValue.includes(value));
    }

    return conditional.showWhen.includes(dependentValue);
  }, [formValues, questions, getQueryType]);

  // Clear values for invisible questions
  useEffect(() => {
    const invisibleQuestions = visibleQuestions.filter(q => !isQuestionVisible(q));
    invisibleQuestions.forEach(q => {
      if (formValues[q.id] !== undefined && formValues[q.id] !== null && formValues[q.id] !== '') {
        setValue(q.id, undefined);
      }
    });
  }, [formValues, visibleQuestions, setValue, isQuestionVisible]);

  const isSectionVisible = (section: FormSection) => {
    const queryType = getQueryType();
    if (section.queryType === "both") return true;
    if (section.queryType === "simple" && queryType === "simple") return true;
    if (section.queryType === "complex" && queryType === "complex") return true;
    return false;
  };

  const handleCheckboxChange = (questionId: string, value: string, currentValues: string[] = []) => {
    const updatedValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    setValue(questionId, updatedValues);

    // Handle "other" field visibility
    const question = questions.find(q => q.id === questionId);
    if (question?.options) {
      const hasOtherSelected = question.options.some(opt => 
        opt.hasOtherField && updatedValues.includes(opt.id)
      );
      setOtherFields(prev => ({ ...prev, [`${questionId}_other`]: hasOtherSelected }));
    }
  };

  const handleRadioChange = (questionId: string, value: string) => {
    setValue(questionId, value);
    
    // Handle "other" field visibility
    const question = questions.find(q => q.id === questionId);
    if (question?.options) {
      const selectedOption = question.options.find(opt => opt.id === value);
      setOtherFields(prev => ({ 
        ...prev, 
        [`${questionId}_other`]: selectedOption?.hasOtherField || false 
      }));
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Form submitted:", data);
      
      // Export form submission as SQL and save to database
      const queryType = getQueryType() as 'simple' | 'complex';
      const submissionId = await exportFormSubmissionAsSQL(data, questions, queryType);
      
      // Send confirmation email to user
      const userEmail = data.email as string;
      const userName = data.name as string;
      
      if (userEmail && userName) {
        const emailData: EmailData = {
          userEmail,
          userName,
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
        toast.success("Simple query submitted successfully! Check your email for confirmation.");
        setTimeout(() => {
          onSimpleQuerySuccess?.(submissionId);
        }, 1000);
      } else if (queryType === "complex") {
        // Send notification email to grant team for complex queries
        if (userEmail && userName) {
          const grantTeamEmailData: GrantTeamEmailData = {
            submissionId,
            queryType: 'complex',
            userEmail,
            userName,
            timestamp: new Date().toISOString(),
            formData: data
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
        
        toast.success("Complex referral submitted successfully! Check your email for confirmation.");
        setTimeout(() => {
          onComplexQuerySuccess?.();
        }, 1000);
      } else {
        toast.success("Form submitted successfully! Check your email for confirmation.");
      }
    } catch (error) {
      toast.error("Failed to submit referral request. Please try again.");
    }
  };

  const renderQuestion = (question: Question) => {
    if (!isQuestionVisible(question)) return null;

    const fieldName = question.id;
    const currentValue = formValues[fieldName];

    const getValidationRules = () => {
      const rules: any = {};
      if (question.required) {
        if (question.type === 'checkbox-group') {
          rules.validate = (value: any) => 
            value && value.length > 0 ? true : `${question.title} is required`;
        } else if (question.type === 'file-upload') {
          rules.validate = (value: any) => 
            value && value.length > 0 ? true : `${question.title} is required`;
        } else {
          rules.required = `${question.title} is required`;
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

    const renderDescription = (description?: string) => {
      if (!description) return null;
      
      // Check if description contains a URL
      const urlPattern = /(https?:\/\/[^\s]+)/g;
      const parts = description.split(urlPattern);
      
      return (
        <div className="text-sm text-muted-foreground mb-2">
          {parts.map((part, index) => {
            if (urlPattern.test(part)) {
              return (
                <a 
                  key={index} 
                  href={part} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary underline hover:text-primary/80"
                >
                  {part}
                </a>
              );
            }
            return part;
          })}
        </div>
      );
    };

    switch (question.type) {
      case 'text':
      case 'email':
        return (
          <div key={question.id} className="space-y-2">
            <Label htmlFor={fieldName}>
              {question.title} {question.required && '*'}
            </Label>
            {renderDescription(question.description)}
            <Input
              id={fieldName}
              type={question.type}
              {...register(fieldName, getValidationRules())}
              placeholder={question.placeholder}
            />
            {errors[fieldName] && (
              <p className="text-sm text-destructive">
                {errors[fieldName]?.message as string}
              </p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={question.id} className="space-y-2">
            <Label htmlFor={fieldName}>
              {question.title} {question.required && '*'}
            </Label>
            {renderDescription(question.description)}
            <Textarea
              id={fieldName}
              {...register(fieldName, getValidationRules())}
              placeholder={question.placeholder}
              rows={4}
            />
            {errors[fieldName] && (
              <p className="text-sm text-destructive">
                {errors[fieldName]?.message as string}
              </p>
            )}
          </div>
        );

      case 'date':
        return (
          <div key={question.id} className="space-y-2">
            <Label htmlFor={fieldName}>
              {question.title} {question.required && '*'}
            </Label>
            {renderDescription(question.description)}
            <Input
              id={fieldName}
              type="date"
              {...register(fieldName, getValidationRules())}
            />
            {errors[fieldName] && (
              <p className="text-sm text-destructive">
                {errors[fieldName]?.message as string}
              </p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={question.id} className="space-y-2">
            <Label htmlFor={fieldName}>
              {question.title} {question.required && '*'}
            </Label>
            {renderDescription(question.description)}
            <Controller
              name={fieldName}
              control={control}
              rules={getValidationRules()}
              render={({ field: { value, onChange } }) => (
                <Select value={value} onValueChange={onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={question.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {question.options?.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors[fieldName] && (
              <p className="text-sm text-destructive">
                {errors[fieldName]?.message as string}
              </p>
            )}
          </div>
        );

      case 'checkbox-group':
        return (
          <div key={question.id} className="space-y-3">
            <Label>
              {question.title} {question.required && '*'}
            </Label>
            {renderDescription(question.description)}
            <Controller
              name={fieldName}
              control={control}
              rules={getValidationRules()}
              render={({ field: { value = [] } }) => (
                <div className="space-y-3">
                  {question.options?.map((option) => (
                    <div key={option.id} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${fieldName}-${option.id}`}
                          checked={value.includes(option.id)}
                          onCheckedChange={() => 
                            handleCheckboxChange(fieldName, option.id, value)
                          }
                        />
                        <Label htmlFor={`${fieldName}-${option.id}`}>
                          {option.label}
                        </Label>
                      </div>
                      {option.hasOtherField && value.includes(option.id) && (
                        <div className="ml-6 space-y-2">
                          <Label htmlFor={`${fieldName}_${option.id}_other`}>
                            Please specify
                          </Label>
                          <Input
                            id={`${fieldName}_${option.id}_other`}
                            {...register(`${fieldName}_${option.id}_other`)}
                            placeholder="Enter details"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            />
            {errors[fieldName] && (
              <p className="text-sm text-destructive">
                {errors[fieldName]?.message as string}
              </p>
            )}
          </div>
        );

      case 'radio-group':
        return (
          <div key={question.id} className="space-y-3">
            <Label>
              {question.title} {question.required && '*'}
            </Label>
            {renderDescription(question.description)}
            <Controller
              name={fieldName}
              control={control}
              rules={getValidationRules()}
              render={({ field: { value, onChange } }) => (
                <div className="space-y-3">
                  {question.options?.map((option) => (
                    <div key={option.id} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${fieldName}-${option.id}`}
                          checked={value === option.id}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleRadioChange(fieldName, option.id);
                            }
                          }}
                        />
                        <Label htmlFor={`${fieldName}-${option.id}`}>
                          {option.label}
                        </Label>
                      </div>
                      {option.hasOtherField && value === option.id && (
                        <div className="ml-6 space-y-2">
                          <Label htmlFor={`${fieldName}_${option.id}_other`}>
                            Please specify
                          </Label>
                          <Input
                            id={`${fieldName}_${option.id}_other`}
                            {...register(`${fieldName}_${option.id}_other`)}
                            placeholder="Enter details"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            />
            {errors[fieldName] && (
              <p className="text-sm text-destructive">
                {errors[fieldName]?.message as string}
              </p>
            )}
          </div>
        );

      case 'file-upload':
        return (
          <div key={question.id} className="space-y-2">
            <Controller
              name={fieldName}
              control={control}
              rules={getValidationRules()}
              render={({ field: { value = [], onChange } }) => (
                <FileUpload
                  id={fieldName}
                  title={question.title}
                  description={question.description}
                  required={question.required}
                  value={value}
                  onChange={onChange}
                  accept={question.fileUploadConfig?.accept || "*/*"}
                  maxSize={question.fileUploadConfig?.maxSize || 10}
                  maxFiles={question.fileUploadConfig?.maxFiles || 5}
                />
              )}
            />
            {errors[fieldName] && (
              <p className="text-sm text-destructive">
                {errors[fieldName]?.message as string}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const getIconForSection = (sectionId: string) => {
    const iconMap: {[key: string]: React.ComponentType<{className?: string}>} = {
      'basic-info': FileText,
      'grants-team': Users,
      'stage-query': Clock,
      'query-type': HelpCircle,
      'simple-grants': Search,
      'simple-mri': Settings,
      'simple-type': HelpCircle,
      'simple-explanation': FileText,
      'complex-grants': Search,
      'complex-mri': Settings,
      'complex-project': FileText,
      'complex-parties': Users,
      'complex-agreements': FileText,
      'complex-support': HelpCircle
    };
    return iconMap[sectionId] || FileText;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl">Referral Request Form</h1>
        <p className="text-muted-foreground">
          Please complete this form to submit your referral request
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {sortedSections.map((section) => {
          if (!isSectionVisible(section)) return null;

          const sectionQuestions = visibleQuestions
            .filter(q => q.section === section.id)
            .filter(q => isQuestionVisible(q))
            .sort((a, b) => a.order - b.order);

          if (sectionQuestions.length === 0) return null;

          const IconComponent = getIconForSection(section.id);

          return (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconComponent className="h-5 w-5" />
                  {section.title}
                </CardTitle>
                {section.description && (
                  <CardDescription>
                    {section.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {sectionQuestions.map(renderQuestion)}
              </CardContent>
            </Card>
          );
        })}

        <Separator />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Referral Request"}
          </Button>
        </div>
      </form>
    </div>
  );
}





