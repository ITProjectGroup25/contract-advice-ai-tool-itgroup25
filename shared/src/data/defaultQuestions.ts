import { Question, FormSection } from "../types/dynamic-form";

export const defaultQuestions: Question[] = [
  // Basic Information
  {
    id: "name",
    type: "text",
    label: "Your Name",
    placeholder: "Enter your full name",
    required: true,
    visible: true,
    order: 1,
    sectionId: "basic-info",
  },
  {
    id: "email",
    type: "email",
    label: "Your Email",
    placeholder: "your.email@example.com",
    required: true,
    visible: true,
    order: 2,
    sectionId: "basic-info",
    validation: {
      pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
    },
  },

  // Grants Team Selection
  {
    id: "grants-team",
    type: "checkbox",
    label: "Grants Team",
    required: true,
    visible: true,
    order: 3,
    sectionId: "grants-team",
    options: [
      { value: "health-medical", label: "Health and Medical" },
      { value: "international", label: "International" },
      { value: "arc-d", label: "ARC-D" },
      { value: "rds", label: "RDS" },
      { value: "research-infrastructure", label: "Research Infrastructure" },
    ],
  },

  // Stage of Query
  {
    id: "stage-of-query",
    type: "checkbox",
    label: "Stage of Query",
    required: true,
    visible: true,
    order: 4,
    sectionId: "query-stage",
    options: [
      { value: "pre-award", label: "Pre-Award" },
      { value: "post-award", label: "Post-Award" },
      { value: "other", label: "Other" },
    ],
  },

  // Query Type
  {
    id: "query-type",
    type: "checkbox",
    label: "Query Type",
    required: true,
    visible: true,
    order: 5,
    sectionId: "query-type",
    options: [
      { value: "simple", label: "Simple" },
      { value: "complex", label: "Complex" },
    ],
  },

  // Simple Query Fields (Conditional)
  {
    id: "grants-scheme",
    type: "checkbox",
    label: "Grants Scheme",
    required: true,
    visible: true,
    order: 6,
    sectionId: "simple-query",
    conditional: {
      dependsOn: "query-type",
      showWhen: ["simple"],
    },
    options: [
      { value: "nhmrc", label: "NHMRC" },
      { value: "mrff", label: "MRFF" },
      { value: "arc", label: "ARC" },
      { value: "ecr", label: "ECR" },
      { value: "nih", label: "NIH" },
      { value: "other-scheme", label: "Other" },
    ],
  },

  {
    id: "mri-involvement",
    type: "radio",
    label: "MRI Involvement",
    required: true,
    visible: true,
    order: 7,
    sectionId: "simple-query",
    conditional: {
      dependsOn: "query-type",
      showWhen: ["simple"],
    },
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "other-mri", label: "Other" },
    ],
  },

  {
    id: "type-of-query",
    type: "checkbox",
    label: "Type of Query",
    required: true,
    visible: true,
    order: 8,
    sectionId: "simple-query",
    conditional: {
      dependsOn: "query-type",
      showWhen: ["simple"],
    },
    options: [
      { value: "contractual-clause", label: "Review of a contractual clause" },
      { value: "support-negotiations", label: "Support with negotiations" },
      { value: "advice-agreement", label: "Advice on appropriate agreement" },
      { value: "compliance-obligations", label: "Advice on compliance with grant obligations" },
      { value: "other-query", label: "Other" },
    ],
  },

  {
    id: "request-explanation",
    type: "textarea",
    label: "Request Explanation",
    placeholder: "Please explain your request in detail...",
    required: true,
    visible: true,
    order: 9,
    sectionId: "request-details",
    conditional: {
      dependsOn: "query-type",
      showWhen: ["simple"],
    },
    validation: {
      minLength: 10,
      maxLength: 2000,
    },
  },

  {
    id: "is-urgent",
    type: "radio",
    label: "Is there urgency on this request?",
    required: true,
    visible: true,
    order: 10,
    sectionId: "request-details",
    conditional: {
      dependsOn: "query-type",
      showWhen: ["simple"],
    },
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
];

export const defaultSections: FormSection[] = [
  {
    id: "basic-info",
    title: "Basic Information",
    description: "Please provide your contact details",
    order: 1,
    visible: true,
    icon: "User",
  },
  {
    id: "grants-team",
    title: "Grants Team",
    description: "Select the relevant grants team(s) for your query",
    order: 2,
    visible: true,
    icon: "Users",
  },
  {
    id: "query-stage",
    title: "Stage of Query",
    description: "What stage is your query related to?",
    order: 3,
    visible: true,
    icon: "Clock",
  },
  {
    id: "query-type",
    title: "Query Type",
    description: "Is this a simple query or complex referral?",
    order: 4,
    visible: true,
    icon: "HelpCircle",
  },
  {
    id: "simple-query",
    title: "Simple Query Details",
    description: "Additional details for simple queries",
    order: 5,
    visible: true,
    conditional: {
      dependsOn: "query-type",
      showWhen: ["simple"],
    },
    icon: "HelpCircle",
  },
  {
    id: "request-details",
    title: "Request Details",
    description: "Please provide details about your request",
    order: 6,
    visible: true,
    conditional: {
      dependsOn: "query-type",
      showWhen: ["simple"],
    },
    icon: "FileText",
  },
];
