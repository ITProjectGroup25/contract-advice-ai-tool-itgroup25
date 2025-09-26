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
import { useState } from "react";

interface FormData {
  name: string;
  email: string;
  grantsTeam: string[];
  stageOfQuery: string[];
  stageOther?: string;
  queryType: string;
  // Simple query fields
  grantsScheme?: string[];
  grantsSchemeOther?: string;
  mriInvolvement?: string[];
  mriOther?: string;
  // Type of query questions
  typeOfQuery?: string[];
  contractualClauses?: string[];
  contractualOther?: string;
  supportNegotiationsOther?: string;
  adviceAgreementOther?: string;
  complianceAdviceOther?: string;
  typeOfQueryOther?: string;
  requestExplanation?: string;
  hasUrgency?: string;
  urgencyDate?: string;
  // Complex query fields
  complexGrantsScheme?: string[];
  complexGrantsSchemeOther?: string;
  complexMriInvolvement?: string[];
  complexMriOther?: string;
  chiefInvestigator?: string;
  facultyDepartment?: string;
  projectTitle?: string;
  isUomLead?: string[];
  otherPartiesInvolved?: string;
  parties?: Array<{
    name: string;
    role: string[];
    roleOther?: string;
  }>;
  morePartiesInvolved?: string;
  agreementTypes?: string[];
  agreementTypesOther?: string;
  hpecmReference?: string;
  otherAgreements?: string;
  howCanWeHelp?: string;
  otherNotes?: string;
  documentsAttached?: string;
  complexHasUrgency?: string;
  complexUrgencyDate?: string;
}

interface UserFormProps {
  onSimpleQuerySuccess?: () => void;
  onComplexQuerySuccess?: () => void;
}

export function UserForm({ onSimpleQuerySuccess, onComplexQuerySuccess }: UserFormProps) {
  const { register, handleSubmit, control, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: {
      grantsTeam: [],
      stageOfQuery: [],
      queryType: "",
      grantsScheme: [],
      mriInvolvement: [],
      typeOfQuery: [],
      contractualClauses: [],
      hasUrgency: "",
      complexGrantsScheme: [],
      complexMriInvolvement: [],
      isUomLead: [],
      parties: [],
      agreementTypes: [],
      complexHasUrgency: "",
    }
  });

  const [showOtherStage, setShowOtherStage] = useState(false);
  const [showOtherGrantsScheme, setShowOtherGrantsScheme] = useState(false);
  const [showOtherMRI, setShowOtherMRI] = useState(false);
  const [showContractualDropdown, setShowContractualDropdown] = useState(false);
  const [showOtherContractual, setShowOtherContractual] = useState(false);
  const [showSupportNegotiationsOther, setShowSupportNegotiationsOther] = useState(false);
  const [showAdviceAgreementOther, setShowAdviceAgreementOther] = useState(false);
  const [showComplianceAdviceOther, setShowComplianceAdviceOther] = useState(false);
  const [showTypeOfQueryOther, setShowTypeOfQueryOther] = useState(false);
  const [showUrgencyDate, setShowUrgencyDate] = useState(false);
  // Complex query state
  const [showComplexOtherGrantsScheme, setShowComplexOtherGrantsScheme] = useState(false);
  const [showComplexOtherMRI, setShowComplexOtherMRI] = useState(false);
  const [showPartiesSection, setShowPartiesSection] = useState(false);
  const [showMorePartiesQuestion, setShowMorePartiesQuestion] = useState(false);
  const [showAgreementTypesOther, setShowAgreementTypesOther] = useState(false);
  const [showComplexUrgencyDate, setShowComplexUrgencyDate] = useState(false);

  const queryType = watch("queryType") || "";
  const typeOfQuery = watch("typeOfQuery") || [];
  const hasUrgency = watch("hasUrgency") || "";
  const otherPartiesInvolved = watch("otherPartiesInvolved") || "";
  const morePartiesInvolved = watch("morePartiesInvolved") || "";
  const complexHasUrgency = watch("complexHasUrgency") || "";
  const parties = watch("parties") || [];
  
  const isSimpleQuery = queryType === "simple";
  const isComplexQuery = queryType === "complex";

  const onSubmit = async (data: FormData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Form submitted:", data);
      
      if (isSimpleQuery) {
        toast.success("Simple query submitted successfully!");
        // Navigate to chatbot for simple queries
        setTimeout(() => {
          onSimpleQuerySuccess?.();
        }, 1000);
      } else {
        toast.success("Complex referral submitted successfully!");
        // Navigate to success page for complex queries
        setTimeout(() => {
          onComplexQuerySuccess?.();
        }, 1000);
      }
    } catch (error) {
      toast.error("Failed to submit referral request. Please try again.");
    }
  };

  const handleCheckboxChange = (
    field: keyof FormData,
    value: string,
    currentValues: string[]
  ) => {
    const updatedValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    setValue(field, updatedValues);

    // Handle conditional field visibility
    if (field === "stageOfQuery") {
      setShowOtherStage(updatedValues.includes("other"));
    }
    if (field === "grantsScheme") {
      setShowOtherGrantsScheme(updatedValues.includes("other"));
    }
    if (field === "mriInvolvement") {
      setShowOtherMRI(updatedValues.includes("other"));
    }
    if (field === "typeOfQuery") {
      setShowContractualDropdown(updatedValues.includes("contractual"));
      setShowSupportNegotiationsOther(updatedValues.includes("support-negotiations"));
      setShowAdviceAgreementOther(updatedValues.includes("advice-agreement"));
      setShowComplianceAdviceOther(updatedValues.includes("compliance-advice"));
      setShowTypeOfQueryOther(updatedValues.includes("other"));
      if (!updatedValues.includes("contractual")) {
        setValue("contractualClauses", []);
        setShowOtherContractual(false);
      }
    }
    if (field === "complexGrantsScheme") {
      setShowComplexOtherGrantsScheme(updatedValues.includes("other"));
    }
    if (field === "complexMriInvolvement") {
      setShowComplexOtherMRI(updatedValues.includes("other"));
    }
    if (field === "agreementTypes") {
      setShowAgreementTypesOther(updatedValues.includes("other"));
    }
  };

  const handleContractualChange = (value: string, currentValues: string[]) => {
    const updatedValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    setValue("contractualClauses", updatedValues);
    setShowOtherContractual(updatedValues.includes("other"));
  };

  const handleUrgencyChange = (value: string) => {
    setValue("hasUrgency", value);
    setShowUrgencyDate(value === "yes");
    if (value === "no") {
      setValue("urgencyDate", "");
    }
  };

  const handleComplexUrgencyChange = (value: string) => {
    setValue("complexHasUrgency", value);
    setShowComplexUrgencyDate(value === "yes");
    if (value === "no") {
      setValue("complexUrgencyDate", "");
    }
  };

  const handleOtherPartiesChange = (value: string) => {
    setValue("otherPartiesInvolved", value);
    setShowPartiesSection(value === "yes");
    if (value === "no") {
      setValue("parties", []);
      setShowMorePartiesQuestion(false);
    }
  };

  const handleMorePartiesChange = (value: string) => {
    setValue("morePartiesInvolved", value);
    if (value === "yes") {
      const currentParties = parties || [];
      setValue("parties", [...currentParties, { name: "", role: [], roleOther: "" }]);
    }
  };

  const addParty = () => {
    const currentParties = parties || [];
    setValue("parties", [...currentParties, { name: "", role: [], roleOther: "" }]);
  };

  const removeParty = (index: number) => {
    const currentParties = parties || [];
    const updatedParties = currentParties.filter((_, i) => i !== index);
    setValue("parties", updatedParties);
    if (updatedParties.length === 0) {
      setShowMorePartiesQuestion(false);
    }
  };

  const updatePartyName = (index: number, name: string) => {
    const currentParties = parties || [];
    const updatedParties = [...currentParties];
    updatedParties[index] = { ...updatedParties[index], name };
    setValue("parties", updatedParties);
  };

  const updatePartyRole = (index: number, roleValue: string, currentRoles: string[]) => {
    const updatedRoles = currentRoles.includes(roleValue)
      ? currentRoles.filter(r => r !== roleValue)
      : [...currentRoles, roleValue];
    
    const currentParties = parties || [];
    const updatedParties = [...currentParties];
    updatedParties[index] = { ...updatedParties[index], role: updatedRoles };
    setValue("parties", updatedParties);
  };

  const updatePartyRoleOther = (index: number, roleOther: string) => {
    const currentParties = parties || [];
    const updatedParties = [...currentParties];
    updatedParties[index] = { ...updatedParties[index], roleOther };
    setValue("parties", updatedParties);
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
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Please provide your contact details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name *</Label>
              <Input
                id="name"
                {...register("name", { required: "Name is required" })}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Your Email *</Label>
              <Input
                id="email"
                type="email"
                {...register("email", { 
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
                placeholder="your.email@example.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Grants Team */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Grants Team *
            </CardTitle>
            <CardDescription>
              Select the relevant grants team(s) for your query
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Controller
              name="grantsTeam"
              control={control}
              rules={{ 
                validate: (value) => value && value.length > 0 ? true : "Please select at least one grants team"
              }}
              render={({ field: { value } }) => (
                <div className="space-y-3">
                  {[
                    { id: "health-medical", label: "Health and Medical" },
                    { id: "international", label: "International" },
                    { id: "arc-d", label: "ARC-D" },
                    { id: "rds", label: "RDS" },
                    { id: "research-infrastructure", label: "Research Infrastructure" }
                  ].map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.id}
                        checked={value?.includes(option.id) || false}
                        onCheckedChange={() => 
                          handleCheckboxChange("grantsTeam", option.id, value || [])
                        }
                      />
                      <Label htmlFor={option.id}>{option.label}</Label>
                    </div>
                  ))}
                </div>
              )}
            />

            {errors.grantsTeam && (
              <p className="text-sm text-destructive mt-2">{errors.grantsTeam.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Stage of Query */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Stage of Query *
            </CardTitle>
            <CardDescription>
              What stage is your query related to?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Controller
              name="stageOfQuery"
              control={control}
              rules={{ 
                validate: (value) => value && value.length > 0 ? true : "Please select at least one stage"
              }}
              render={({ field: { value } }) => (
                <div className="space-y-3">
                  {[
                    { id: "pre-award", label: "Pre-Award" },
                    { id: "post-award", label: "Post-Award" },
                    { id: "other", label: "Other" }
                  ].map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.id}
                        checked={value?.includes(option.id) || false}
                        onCheckedChange={() => 
                          handleCheckboxChange("stageOfQuery", option.id, value || [])
                        }
                      />
                      <Label htmlFor={option.id}>{option.label}</Label>
                    </div>
                  ))}
                </div>
              )}
            />
            {showOtherStage && (
              <div className="space-y-2">
                <Label htmlFor="stageOther">Please specify other stage</Label>
                <Input
                  id="stageOther"
                  {...register("stageOther")}
                  placeholder="Enter other stage details"
                />
              </div>
            )}
            {errors.stageOfQuery && (
              <p className="text-sm text-destructive">{errors.stageOfQuery.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Query Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Query Type *
            </CardTitle>
            <CardDescription>
              Is this a simple query or complex referral?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Controller
              name="queryType"
              control={control}
              rules={{ 
                required: "Please select query type"
              }}
              render={({ field: { value, onChange } }) => (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="simple"
                      checked={value === "simple"}
                      onCheckedChange={(checked: any) => {
                        if (checked) {
                          onChange("simple");
                        }
                      }}
                    />
                    <Label htmlFor="simple">Simple</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="complex"
                      checked={value === "complex"}
                      onCheckedChange={(checked: any) => {
                        if (checked) {
                          onChange("complex");
                        }
                      }}
                    />
                    <Label htmlFor="complex">Complex</Label>
                  </div>

                </div>
              )}
            />

            {errors.queryType && (
              <p className="text-sm text-destructive">{errors.queryType.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Simple Query Additional Fields */}
        {isSimpleQuery && (
          <>
            {/* Grants Scheme */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Grants Scheme *
                </CardTitle>
                <CardDescription>
                  Which grants scheme is your query related to?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Controller
                  name="grantsScheme"
                  control={control}
                  rules={{ 
                    validate: (value) => value && value.length > 0 ? true : "Please select at least one grants scheme"
                  }}
                  render={({ field: { value } }) => (
                    <div className="space-y-3">
                      {[
                        { id: "nhmrc", label: "NHMRC" },
                        { id: "mrff", label: "MRFF" },
                        { id: "arc", label: "ARC" },
                        { id: "ecr", label: "ECR" },
                        { id: "nih", label: "NIH" },
                        { id: "other", label: "Other" }
                      ].map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`scheme-${option.id}`}
                            checked={value?.includes(option.id) || false}
                            onCheckedChange={() => 
                              handleCheckboxChange("grantsScheme", option.id, value || [])
                            }
                          />
                          <Label htmlFor={`scheme-${option.id}`}>{option.label}</Label>
                        </div>
                      ))}
                    </div>
                  )}
                />
                {showOtherGrantsScheme && (
                  <div className="space-y-2">
                    <Label htmlFor="grantsSchemeOther">Please specify other grants scheme</Label>
                    <Input
                      id="grantsSchemeOther"
                      {...register("grantsSchemeOther")}
                      placeholder="Enter other grants scheme"
                    />
                  </div>
                )}
                {errors.grantsScheme && (
                  <p className="text-sm text-destructive">{errors.grantsScheme.message}</p>
                )}
              </CardContent>
            </Card>

            {/* MRI Involvement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  MRI Involvement *
                </CardTitle>
                <CardDescription>
                  Does this involve an MRI?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Controller
                  name="mriInvolvement"
                  control={control}
                  rules={{ 
                    validate: (value) => value && value.length > 0 ? true : "Please select MRI involvement"
                  }}
                  render={({ field: { value } }) => (
                    <div className="space-y-3">
                      {[
                        { id: "yes", label: "Yes" },
                        { id: "no", label: "No" },
                        { id: "other", label: "Other" }
                      ].map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`mri-${option.id}`}
                            checked={value?.includes(option.id) || false}
                            onCheckedChange={() => 
                              handleCheckboxChange("mriInvolvement", option.id, value || [])
                            }
                          />
                          <Label htmlFor={`mri-${option.id}`}>{option.label}</Label>
                        </div>
                      ))}
                    </div>
                  )}
                />
                {showOtherMRI && (
                  <div className="space-y-2">
                    <Label htmlFor="mriOther">Please specify</Label>
                    <Textarea
                      id="mriOther"
                      {...register("mriOther")}
                      placeholder="Please provide details about MRI involvement"
                      rows={3}
                    />
                  </div>
                )}
                {errors.mriInvolvement && (
                  <p className="text-sm text-destructive">{errors.mriInvolvement.message}</p>
                )}
              </CardContent>
            </Card>

            {/* Type of Query */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Type of Query *
                </CardTitle>
                <CardDescription>
                  Select all that apply for your query type
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Controller
                  name="typeOfQuery"
                  control={control}
                  rules={{ 
                    validate: (value) => value && value.length > 0 ? true : "Please select at least one type of query"
                  }}
                  render={({ field: { value } }) => (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="contractual"
                          checked={value?.includes("contractual") || false}
                          onCheckedChange={() => 
                            handleCheckboxChange("typeOfQuery", "contractual", value || [])
                          }
                        />
                        <Label htmlFor="contractual">Review of a contractual clause</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="support-negotiations"
                          checked={value?.includes("support-negotiations") || false}
                          onCheckedChange={() => 
                            handleCheckboxChange("typeOfQuery", "support-negotiations", value || [])
                          }
                        />
                        <Label htmlFor="support-negotiations">Support with negotiations</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="advice-agreement"
                          checked={value?.includes("advice-agreement") || false}
                          onCheckedChange={() => 
                            handleCheckboxChange("typeOfQuery", "advice-agreement", value || [])
                          }
                        />
                        <Label htmlFor="advice-agreement">Advice on appropriate agreement</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="compliance-advice"
                          checked={value?.includes("compliance-advice") || false}
                          onCheckedChange={() => 
                            handleCheckboxChange("typeOfQuery", "compliance-advice", value || [])
                          }
                        />
                        <Label htmlFor="compliance-advice">Advice on compliance with grant obligations</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="other"
                          checked={value?.includes("other") || false}
                          onCheckedChange={() => 
                            handleCheckboxChange("typeOfQuery", "other", value || [])
                          }
                        />
                        <Label htmlFor="other">Other</Label>
                      </div>
                    </div>
                  )}
                />

                {errors.typeOfQuery && (
                  <p className="text-sm text-destructive">{errors.typeOfQuery.message}</p>
                )}

                {/* Contractual Clauses Dropdown */}
                {showContractualDropdown && (
                  <div className="space-y-3 pl-6 border-l-2 border-muted">
                    <Label>Select contractual clause types (select all that apply):</Label>
                    <Controller
                      name="contractualClauses"
                      control={control}
                      render={({ field: { value } }) => (
                        <div className="space-y-2">
                          {[
                            { id: "background-ip", label: "Background IP" },
                            { id: "project-ip", label: "Project IP" },
                            { id: "liability", label: "Liability" },
                            { id: "indemnity", label: "Indemnity" },
                            { id: "warranty", label: "Warranty" },
                            { id: "insurance", label: "Insurance" },
                            { id: "publication", label: "Publication" },
                            { id: "moral-rights", label: "Moral Rights" },
                            { id: "other", label: "Other" }
                          ].map((option) => (
                            <div key={option.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`contractual-${option.id}`}
                                checked={value?.includes(option.id) || false}
                                onCheckedChange={() => 
                                  handleContractualChange(option.id, value || [])
                                }
                              />
                              <Label htmlFor={`contractual-${option.id}`}>{option.label}</Label>
                            </div>
                          ))}
                        </div>
                      )}
                    />
                    {showOtherContractual && (
                      <div className="space-y-2">
                        <Label htmlFor="contractualOther">Please specify other contractual clause</Label>
                        <Textarea
                          id="contractualOther"
                          {...register("contractualOther")}
                          placeholder="Enter other contractual clause details"
                          rows={3}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Other type options with text fields */}
                {showSupportNegotiationsOther && (
                  <div className="space-y-2 pl-6 border-l-2 border-muted">
                    <Label htmlFor="supportNegotiationsOther">Please provide details about support with negotiations</Label>
                    <Textarea
                      id="supportNegotiationsOther"
                      {...register("supportNegotiationsOther")}
                      placeholder="Enter details about negotiations support needed"
                      rows={3}
                    />
                  </div>
                )}

                {showAdviceAgreementOther && (
                  <div className="space-y-2 pl-6 border-l-2 border-muted">
                    <Label htmlFor="adviceAgreementOther">Please provide details about advice on appropriate agreement</Label>
                    <Textarea
                      id="adviceAgreementOther"
                      {...register("adviceAgreementOther")}
                      placeholder="Enter details about agreement advice needed"
                      rows={3}
                    />
                  </div>
                )}

                {showComplianceAdviceOther && (
                  <div className="space-y-2 pl-6 border-l-2 border-muted">
                    <Label htmlFor="complianceAdviceOther">Please provide details about compliance advice needed</Label>
                    <Textarea
                      id="complianceAdviceOther"
                      {...register("complianceAdviceOther")}
                      placeholder="Enter details about compliance advice needed"
                      rows={3}
                    />
                  </div>
                )}

                {showTypeOfQueryOther && (
                  <div className="space-y-2 pl-6 border-l-2 border-muted">
                    <Label htmlFor="typeOfQueryOther">Please specify other type of query</Label>
                    <Textarea
                      id="typeOfQueryOther"
                      {...register("typeOfQueryOther")}
                      placeholder="Enter other type of query details"
                      rows={3}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Request Explanation - Only for Simple queries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Request Explanation *
                </CardTitle>
                <CardDescription>
                  Please provide a detailed explanation of your request
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  {...register("requestExplanation", { 
                    required: isSimpleQuery ? "Please provide an explanation of your request" : false
                  })}
                  placeholder="Please explain your request in detail..."
                  rows={5}
                />
                {errors.requestExplanation && (
                  <p className="text-sm text-destructive mt-2">{errors.requestExplanation.message}</p>
                )}
              </CardContent>
            </Card>

            {/* Urgency Question - Only for Simple queries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Is there urgency on this request? *
                </CardTitle>
                <CardDescription>
                  Please indicate if this request is urgent
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Controller
                  name="hasUrgency"
                  control={control}
                  rules={{ 
                    required: isSimpleQuery ? "Please indicate if this request is urgent" : false
                  }}
                  render={({ field: { value } }) => (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="urgency-yes"
                          checked={value === "yes"}
                          onCheckedChange={(checked: any) => {
                            if (checked) {
                              handleUrgencyChange("yes");
                            }
                          }}
                        />
                        <Label htmlFor="urgency-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="urgency-no"
                          checked={value === "no"}
                          onCheckedChange={(checked: any) => {
                            if (checked) {
                              handleUrgencyChange("no");
                            }
                          }}
                        />
                        <Label htmlFor="urgency-no">No</Label>
                      </div>
                    </div>
                  )}
                />

                {showUrgencyDate && (
                  <div className="space-y-2 pl-6 border-l-2 border-muted">
                    <Label htmlFor="urgencyDate">Please provide the date by which you need this completed</Label>
                    <Input
                      id="urgencyDate"
                      type="date"
                      {...register("urgencyDate", {
                        required: hasUrgency === "yes" && isSimpleQuery ? "Please provide an urgency date" : false
                      })}
                    />
                    {errors.urgencyDate && (
                      <p className="text-sm text-destructive">{errors.urgencyDate.message}</p>
                    )}
                  </div>
                )}

                {errors.hasUrgency && (
                  <p className="text-sm text-destructive">{errors.hasUrgency.message}</p>
                )}
              </CardContent>
            </Card>

          </>
        )}

        {/* Complex Query Additional Fields */}
        {isComplexQuery && (
          <>
            {/* Complex Grants Scheme */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Grants Scheme *
                </CardTitle>
                <CardDescription>
                  Which grants scheme is your query related to?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Controller
                  name="complexGrantsScheme"
                  control={control}
                  rules={{ 
                    validate: (value) => value && value.length > 0 ? true : "Please select at least one grants scheme"
                  }}
                  render={({ field: { value } }) => (
                    <div className="space-y-3">
                      {[
                        { id: "nhmrc", label: "NHMRC" },
                        { id: "mrff", label: "MRFF" },
                        { id: "arc", label: "ARC" },
                        { id: "ecr", label: "ECR" },
                        { id: "nih", label: "NIH" },
                        { id: "other", label: "Other" }
                      ].map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`complex-scheme-${option.id}`}
                            checked={value?.includes(option.id) || false}
                            onCheckedChange={() => 
                              handleCheckboxChange("complexGrantsScheme", option.id, value || [])
                            }
                          />
                          <Label htmlFor={`complex-scheme-${option.id}`}>{option.label}</Label>
                        </div>
                      ))}
                    </div>
                  )}
                />
                {showComplexOtherGrantsScheme && (
                  <div className="space-y-2">
                    <Label htmlFor="complexGrantsSchemeOther">Please specify other grants scheme</Label>
                    <Input
                      id="complexGrantsSchemeOther"
                      {...register("complexGrantsSchemeOther")}
                      placeholder="Enter other grants scheme"
                    />
                  </div>
                )}
                {errors.complexGrantsScheme && (
                  <p className="text-sm text-destructive">{errors.complexGrantsScheme.message}</p>
                )}
              </CardContent>
            </Card>

            {/* Complex MRI Involvement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Does this involve an MRI? *
                </CardTitle>
                <CardDescription>
                  Please indicate MRI involvement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Controller
                  name="complexMriInvolvement"
                  control={control}
                  rules={{ 
                    validate: (value) => value && value.length > 0 ? true : "Please select MRI involvement"
                  }}
                  render={({ field: { value } }) => (
                    <div className="space-y-3">
                      {[
                        { id: "yes", label: "Yes" },
                        { id: "no", label: "No" },
                        { id: "other", label: "Other" }
                      ].map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`complex-mri-${option.id}`}
                            checked={value?.includes(option.id) || false}
                            onCheckedChange={() => 
                              handleCheckboxChange("complexMriInvolvement", option.id, value || [])
                            }
                          />
                          <Label htmlFor={`complex-mri-${option.id}`}>{option.label}</Label>
                        </div>
                      ))}
                    </div>
                  )}
                />
                {showComplexOtherMRI && (
                  <div className="space-y-2">
                    <Label htmlFor="complexMriOther">Please specify</Label>
                    <Textarea
                      id="complexMriOther"
                      {...register("complexMriOther")}
                      placeholder="Please provide details about MRI involvement"
                      rows={3}
                    />
                  </div>
                )}
                {errors.complexMriInvolvement && (
                  <p className="text-sm text-destructive">{errors.complexMriInvolvement.message}</p>
                )}
              </CardContent>
            </Card>

            {/* Chief Investigator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Chief Investigator *
                </CardTitle>
                <CardDescription>
                  Please provide the Chief Investigator name
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  {...register("chiefInvestigator", { 
                    required: isComplexQuery ? "Chief Investigator is required" : false
                  })}
                  placeholder="Enter Chief Investigator name"
                />
                {errors.chiefInvestigator && (
                  <p className="text-sm text-destructive mt-2">{errors.chiefInvestigator.message}</p>
                )}
              </CardContent>
            </Card>

            {/* Faculty and Department */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Faculty and Department *
                </CardTitle>
                <CardDescription>
                  Please provide the faculty and department
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  {...register("facultyDepartment", { 
                    required: isComplexQuery ? "Faculty and Department is required" : false
                  })}
                  placeholder="Enter faculty and department"
                />
                {errors.facultyDepartment && (
                  <p className="text-sm text-destructive mt-2">{errors.facultyDepartment.message}</p>
                )}
              </CardContent>
            </Card>

            {/* Project Title */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Project Title *
                </CardTitle>
                <CardDescription>
                  Please provide the project title
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  {...register("projectTitle", { 
                    required: isComplexQuery ? "Project title is required" : false
                  })}
                  placeholder="Enter project title"
                />
                {errors.projectTitle && (
                  <p className="text-sm text-destructive mt-2">{errors.projectTitle.message}</p>
                )}
              </CardContent>
            </Card>

            {/* Is UOM the lead */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Is UOM the lead? *
                </CardTitle>
                <CardDescription>
                  Please indicate if University of Melbourne is the lead
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Controller
                  name="isUomLead"
                  control={control}
                  rules={{ 
                    validate: (value) => value && value.length > 0 ? true : "Please select lead status"
                  }}
                  render={({ field: { value } }) => (
                    <div className="space-y-3">
                      {[
                        { id: "lead", label: "Lead" },
                        { id: "non-lead", label: "Non-Lead" }
                      ].map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`uom-${option.id}`}
                            checked={value?.includes(option.id) || false}
                            onCheckedChange={() => 
                              handleCheckboxChange("isUomLead", option.id, value || [])
                            }
                          />
                          <Label htmlFor={`uom-${option.id}`}>{option.label}</Label>
                        </div>
                      ))}
                    </div>
                  )}
                />
                {errors.isUomLead && (
                  <p className="text-sm text-destructive">{errors.isUomLead.message}</p>
                )}
              </CardContent>
            </Card>

            {/* Other Parties Involved */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Are there other parties involved in the Project? *
                </CardTitle>
                <CardDescription>
                  Please indicate if other parties are involved
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Controller
                  name="otherPartiesInvolved"
                  control={control}
                  rules={{ 
                    required: isComplexQuery ? "Please indicate if other parties are involved" : false
                  }}
                  render={({ field: { value } }) => (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="parties-yes"
                          checked={value === "yes"}
                          onCheckedChange={(checked: any) => {
                            if (checked) {
                              handleOtherPartiesChange("yes");
                              setValue("parties", [{ name: "", role: [], roleOther: "" }]);
                              setShowMorePartiesQuestion(true);
                            }
                          }}
                        />
                        <Label htmlFor="parties-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="parties-no"
                          checked={value === "no"}
                          onCheckedChange={(checked: any) => {
                            if (checked) {
                              handleOtherPartiesChange("no");
                            }
                          }}
                        />
                        <Label htmlFor="parties-no">No</Label>
                      </div>
                    </div>
                  )}
                />

                {showPartiesSection && parties && parties.map((party, index) => (
                  <div key={index} className="space-y-4 p-4 border border-muted rounded-lg">
                    <div className="flex justify-between items-center">
                      <h4>Other Party {index + 1}</h4>
                      {index > 0 && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeParty(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`party-name-${index}`}>Name *</Label>
                      <Input
                        id={`party-name-${index}`}
                        value={party.name}
                        onChange={(e) => updatePartyName(index, e.target.value)}
                        placeholder="Enter party name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Role in the project *</Label>
                      <div className="space-y-2">
                        {[
                          { id: "funder", label: "Funder" },
                          { id: "administering-organisation", label: "Administering Organisation" },
                          { id: "collaborator", label: "Collaborator" },
                          { id: "incoming-party", label: "Incoming party" },
                          { id: "outgoing-party", label: "Outgoing party" },
                          { id: "other", label: "Other" }
                        ].map((role) => (
                          <div key={role.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`party-${index}-role-${role.id}`}
                              checked={party.role?.includes(role.id) || false}
                              onCheckedChange={() => 
                                updatePartyRole(index, role.id, party.role || [])
                              }
                            />
                            <Label htmlFor={`party-${index}-role-${role.id}`}>{role.label}</Label>
                          </div>
                        ))}
                      </div>
                      {party.role?.includes("other") && (
                        <div className="space-y-2 ml-6">
                          <Label htmlFor={`party-role-other-${index}`}>Please specify other role</Label>
                          <Input
                            id={`party-role-other-${index}`}
                            value={party.roleOther || ""}
                            onChange={(e) => updatePartyRoleOther(index, e.target.value)}
                            placeholder="Enter other role"
                          />
                        </div>
                      )}
                    </div>

                    {index === parties.length - 1 && showMorePartiesQuestion && (
                      <div className="space-y-2">
                        <Label>Are there other parties involved?</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="more-parties-yes"
                              checked={morePartiesInvolved === "yes"}
                              onCheckedChange={(checked: any) => {
                                if (checked) {
                                  handleMorePartiesChange("yes");
                                }
                              }}
                            />
                            <Label htmlFor="more-parties-yes">Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="more-parties-no"
                              checked={morePartiesInvolved === "no"}
                              onCheckedChange={(checked: any) => {
                                if (checked) {
                                  setValue("morePartiesInvolved", "no");
                                }
                              }}
                            />
                            <Label htmlFor="more-parties-no">No</Label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {errors.otherPartiesInvolved && (
                  <p className="text-sm text-destructive">{errors.otherPartiesInvolved.message}</p>
                )}
              </CardContent>
            </Card>

            {/* Type of Agreement for review */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Type of Agreement for review *
                </CardTitle>
                <CardDescription>
                  Select all that apply (can choose multiple)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Controller
                  name="agreementTypes"
                  control={control}
                  rules={{ 
                    validate: (value) => value && value.length > 0 ? true : "Please select at least one agreement type"
                  }}
                  render={({ field: { value } }) => (
                    <div className="space-y-3">
                      {[
                        { id: "multi-institutional", label: "Multi-institutional agreement" },
                        { id: "collaboration", label: "Collaboration agreement" },
                        { id: "partner-organisation", label: "Partner organisation letter" },
                        { id: "acquisition-services", label: "Acquisition of services agreement" },
                        { id: "novation", label: "Novation agreement" },
                        { id: "accession", label: "Accession agreement" },
                        { id: "subaward", label: "Subaward agreement" },
                        { id: "subcontract", label: "Subcontract agreement" },
                        { id: "variation", label: "Variation agreement" },
                        { id: "funding", label: "Funding agreement" },
                        { id: "other", label: "Other" }
                      ].map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`agreement-${option.id}`}
                            checked={value?.includes(option.id) || false}
                            onCheckedChange={() => 
                              handleCheckboxChange("agreementTypes", option.id, value || [])
                            }
                          />
                          <Label htmlFor={`agreement-${option.id}`}>{option.label}</Label>
                        </div>
                      ))}
                    </div>
                  )}
                />
                {showAgreementTypesOther && (
                  <div className="space-y-2">
                    <Label htmlFor="agreementTypesOther">Please specify other agreement type</Label>
                    <Textarea
                      id="agreementTypesOther"
                      {...register("agreementTypesOther")}
                      placeholder="Enter other agreement type"
                      rows={3}
                    />
                  </div>
                )}
                {errors.agreementTypes && (
                  <p className="text-sm text-destructive">{errors.agreementTypes.message}</p>
                )}
              </CardContent>
            </Card>

            {/* HPECM reference */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  HPECM reference
                </CardTitle>
                <CardDescription>
                  Please provide HPECM reference if available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  {...register("hpecmReference")}
                  placeholder="Enter HPECM reference"
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Other agreements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Are there other agreements that relate to this project?
                </CardTitle>
                <CardDescription>
                  Please provide details of any related agreements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  {...register("otherAgreements")}
                  placeholder="Enter details of other related agreements"
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* How can we help */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  How can we help? *
                </CardTitle>
                <CardDescription>
                  Please describe how we can assist you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  {...register("howCanWeHelp", { 
                    required: isComplexQuery ? "Please describe how we can help" : false
                  })}
                  placeholder="Enter details about how we can help"
                  rows={4}
                />
                {errors.howCanWeHelp && (
                  <p className="text-sm text-destructive mt-2">{errors.howCanWeHelp.message}</p>
                )}
              </CardContent>
            </Card>

            {/* Other notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Other notes
                </CardTitle>
                <CardDescription>
                  Any additional notes or comments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  {...register("otherNotes")}
                  placeholder="Enter any additional notes"
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Attach documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Attach all relevant documents *
                </CardTitle>
                <CardDescription>
                  Please attach agreement for review, funding agreement, relevant correspondence, related agreements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  {...register("documentsAttached", { 
                    required: isComplexQuery ? "Please confirm documents are attached" : false
                  })}
                  placeholder="Please list the documents you have attached or confirm attachment"
                  rows={3}
                />
                {errors.documentsAttached && (
                  <p className="text-sm text-destructive mt-2">{errors.documentsAttached.message}</p>
                )}
              </CardContent>
            </Card>

            {/* Complex Urgency Question */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Is there urgency on this request? *
                </CardTitle>
                <CardDescription>
                  Please indicate if this request is urgent
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Controller
                  name="complexHasUrgency"
                  control={control}
                  rules={{ 
                    required: isComplexQuery ? "Please indicate if this request is urgent" : false
                  }}
                  render={({ field: { value } }) => (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="complex-urgency-yes"
                          checked={value === "yes"}
                          onCheckedChange={(checked: any) => {
                            if (checked) {
                              handleComplexUrgencyChange("yes");
                            }
                          }}
                        />
                        <Label htmlFor="complex-urgency-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="complex-urgency-no"
                          checked={value === "no"}
                          onCheckedChange={(checked: any) => {
                            if (checked) {
                              handleComplexUrgencyChange("no");
                            }
                          }}
                        />
                        <Label htmlFor="complex-urgency-no">No</Label>
                      </div>
                    </div>
                  )}
                />

                {showComplexUrgencyDate && (
                  <div className="space-y-2 pl-6 border-l-2 border-muted">
                    <Label htmlFor="complexUrgencyDate">Please provide the date by which you need this completed</Label>
                    <Input
                      id="complexUrgencyDate"
                      type="date"
                      {...register("complexUrgencyDate", {
                        required: complexHasUrgency === "yes" && isComplexQuery ? "Please provide an urgency date" : false
                      })}
                    />
                    {errors.complexUrgencyDate && (
                      <p className="text-sm text-destructive">{errors.complexUrgencyDate.message}</p>
                    )}
                  </div>
                )}

                {errors.complexHasUrgency && (
                  <p className="text-sm text-destructive">{errors.complexHasUrgency.message}</p>
                )}
              </CardContent>
            </Card>

          </>
        )}

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