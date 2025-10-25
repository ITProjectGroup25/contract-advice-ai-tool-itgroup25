// @ts-ignore
import { Question, FormSection } from "../_components/AdminInterface";

export const defaultSections: FormSection[] = [
  {
    id: "basic-info",
    title: "Basic Information",
    description: "Please provide your contact details",
    order: 1,
    queryType: "both",
  },
  {
    id: "grants-team",
    title: "Grants Team",
    description: "Select the relevant grants team(s) for your query",
    order: 2,
    queryType: "both",
  },
  {
    id: "stage-query",
    title: "Stage of Query",
    description: "What stage is your query related to?",
    order: 3,
    queryType: "both",
  },
  {
    id: "query-type",
    title: "Query Type",
    description: "Is this a simple query or complex referral?",
    order: 4,
    queryType: "both",
  },
  {
    id: "simple-grants",
    title: "Grants Scheme (Simple)",
    description: "Which grants scheme is your query related to?",
    order: 5,
    queryType: "simple",
  },
  {
    id: "simple-mri",
    title: "MRI Involvement (Simple)",
    description: "Does this involve an MRI?",
    order: 6,
    queryType: "simple",
  },
  {
    id: "simple-type",
    title: "Type of Query (Simple)",
    description: "Select all that apply for your query type",
    order: 7,
    queryType: "simple",
  },
  {
    id: "simple-explanation",
    title: "Request Details (Simple)",
    description: "Please provide details about your request",
    order: 8,
    queryType: "simple",
  },
  {
    id: "complex-grants",
    title: "Grants Scheme (Complex)",
    description: "Which grants scheme is your query related to?",
    order: 9,
    queryType: "complex",
  },
  {
    id: "complex-mri",
    title: "MRI Involvement (Complex)",
    description: "Does this involve an MRI?",
    order: 10,
    queryType: "complex",
  },
  {
    id: "complex-project",
    title: "Project Details",
    description: "Information about your project",
    order: 11,
    queryType: "complex",
  },
  {
    id: "complex-parties",
    title: "Project Parties",
    description: "Information about parties involved in the project",
    order: 12,
    queryType: "complex",
  },
  {
    id: "complex-agreements",
    title: "Agreement Information",
    description: "Details about agreements for review",
    order: 13,
    queryType: "complex",
  },
  {
    id: "complex-support",
    title: "Support Required",
    description: "How we can help and additional information",
    order: 14,
    queryType: "complex",
  },
];

export const defaultQuestions: Question[] = [
  // Basic Information
  {
    id: "name",
    title: "Your Name",
    type: "text",
    required: true,
    section: "basic-info",
    order: 1,
    visible: true,
    placeholder: "Enter your full name",
  },
  {
    id: "email",
    title: "Your Email",
    type: "email",
    required: true,
    section: "basic-info",
    order: 2,
    visible: true,
    placeholder: "your.email@example.com",
  },

  // Grants Team
  {
    id: "grants-team",
    title: "Grants Team",
    type: "checkbox-group",
    required: true,
    section: "grants-team",
    order: 3,
    visible: true,
    options: [
      { id: "health-medical", label: "Health and Medical" },
      { id: "international", label: "International" },
      { id: "arc-d", label: "ARC-D" },
      { id: "rds", label: "RDS" },
      { id: "research-infrastructure", label: "Research Infrastructure" },
    ],
  },

  // Stage of Query
  {
    id: "stage-of-query",
    title: "Stage of Query",
    type: "radio-group",
    required: true,
    section: "stage-query",
    order: 4,
    visible: true,
    options: [
      { id: "pre-award", label: "Pre-Award" },
      { id: "post-award", label: "Post-Award" },
      { id: "other", label: "Other", hasOtherField: true },
    ],
  },

  // Query Type
  {
    id: "query-type",
    title: "Query Type",
    type: "radio-group",
    required: true,
    section: "query-type",
    order: 5,
    visible: true,
    options: [
      { id: "simple", label: "Simple" },
      { id: "complex", label: "Complex" },
    ],
  },

  // Simple Query - Grants Scheme
  {
    id: "simple-grants-scheme",
    title: "Grants Scheme",
    type: "checkbox-group",
    required: true,
    section: "simple-grants",
    order: 6,
    visible: true,
    conditional: {
      dependsOn: "query-type",
      showWhen: ["simple"],
    },
    options: [
      { id: "nhmrc", label: "NHMRC" },
      { id: "mrff", label: "MRFF" },
      { id: "arc", label: "ARC" },
      { id: "ecr", label: "ECR" },
      { id: "nih", label: "NIH" },
      { id: "other", label: "Other", hasOtherField: true },
    ],
  },

  // Simple Query - MRI Involvement
  {
    id: "simple-mri-involvement",
    title: "MRI Involvement",
    type: "radio-group",
    required: true,
    section: "simple-mri",
    order: 7,
    visible: true,
    conditional: {
      dependsOn: "query-type",
      showWhen: ["simple"],
    },
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" },
      { id: "other", label: "Other", hasOtherField: true },
    ],
  },

  // Simple Query - Type of Query
  {
    id: "simple-type-of-query",
    title: "Type of Query",
    type: "checkbox-group",
    required: true,
    section: "simple-type",
    order: 8,
    visible: true,
    conditional: {
      dependsOn: "query-type",
      showWhen: ["simple"],
    },
    options: [
      { id: "contractual", label: "Review of a contractual clause" },
      { id: "support-negotiations", label: "Support with negotiations" },
      { id: "advice-agreement", label: "Advice on appropriate agreement" },
      { id: "compliance-advice", label: "Advice on compliance with grant obligations" },
      { id: "other", label: "Other", hasOtherField: true },
    ],
  },

  // Simple Query - Request Explanation
  {
    id: "simple-request-explanation",
    title: "Request Explanation",
    type: "textarea",
    required: true,
    section: "simple-explanation",
    order: 9,
    visible: true,
    conditional: {
      dependsOn: "query-type",
      showWhen: ["simple"],
    },
    placeholder: "Please explain your request in detail...",
  },

  // Simple Query - Clause Type (appears when contractual is selected)
  {
    id: "simple-clause-type",
    title: "What type of clause requires review?",
    type: "checkbox-group",
    required: true,
    section: "simple-explanation",
    order: 9.5,
    visible: true,
    conditional: {
      dependsOn: "simple-type-of-query",
      showWhen: ["contractual"],
    },
    options: [
      { id: "background-ip", label: "Background IP" },
      { id: "project-ip", label: "Project IP" },
      { id: "liability", label: "Liability" },
      { id: "indemnity", label: "Indemnity" },
      { id: "warranty", label: "Warranty" },
      { id: "insurance", label: "Insurance" },
      { id: "publication", label: "Publication" },
      { id: "moral-rights", label: "Moral Rights" },
      { id: "other", label: "Other", hasOtherField: true },
    ],
  },

  // Simple Query - Guide Check (appears when clause type is selected)
  {
    id: "simple-guide-check",
    title: "Have you checked the guide?",
    description:
      "Please refer to the EAAC Grants Training Guide (PDF): /EAAC%20Grants%20Training%20Guide%28May2024%29.pdf",
    type: "radio-group",
    required: true,
    section: "simple-explanation",
    order: 9.7,
    visible: true,
    conditional: {
      dependsOn: "simple-clause-type",
      showWhen: [
        "background-ip",
        "project-ip",
        "liability",
        "indemnity",
        "warranty",
        "insurance",
        "publication",
        "moral-rights",
      ],
    },
    options: [
      { id: "yes", label: "Yes - I have checked the guide" },
      { id: "no", label: "No - Please direct me to the guide" },
    ],
  },

  // Simple Query - Urgency
  {
    id: "simple-urgency",
    title: "Is there urgency on this request?",
    type: "radio-group",
    required: true,
    section: "simple-explanation",
    order: 10,
    visible: true,
    conditional: {
      dependsOn: "query-type",
      showWhen: ["simple"],
    },
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" },
    ],
  },

  // Simple Query - Urgency Date
  {
    id: "simple-urgency-date",
    title: "Please provide the date by which you need this completed",
    type: "date",
    required: false,
    section: "simple-explanation",
    order: 11,
    visible: true,
    conditional: {
      dependsOn: "simple-urgency",
      showWhen: ["yes"],
    },
  },

  // Complex Query - Grants Scheme
  {
    id: "complex-grants-scheme",
    title: "Grants Scheme",
    type: "checkbox-group",
    required: true,
    section: "complex-grants",
    order: 12,
    visible: true,
    conditional: {
      dependsOn: "query-type",
      showWhen: ["complex"],
    },
    options: [
      { id: "nhmrc", label: "NHMRC" },
      { id: "mrff", label: "MRFF" },
      { id: "arc", label: "ARC" },
      { id: "ecr", label: "ECR" },
      { id: "nih", label: "NIH" },
      { id: "other", label: "Other", hasOtherField: true },
    ],
  },

  // Complex Query - MRI Involvement
  {
    id: "complex-mri-involvement",
    title: "Does this involve an MRI?",
    type: "checkbox-group",
    required: true,
    section: "complex-mri",
    order: 13,
    visible: true,
    conditional: {
      dependsOn: "query-type",
      showWhen: ["complex"],
    },
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" },
      { id: "other", label: "Other", hasOtherField: true },
    ],
  },

  // Complex Query - Project Details
  {
    id: "complex-chief-investigator",
    title: "Chief Investigator",
    type: "text",
    required: true,
    section: "complex-project",
    order: 14,
    visible: true,
    conditional: {
      dependsOn: "query-type",
      showWhen: ["complex"],
    },
    placeholder: "Enter Chief Investigator name",
  },
  {
    id: "complex-faculty-department",
    title: "Faculty and Department",
    type: "text",
    required: true,
    section: "complex-project",
    order: 15,
    visible: true,
    conditional: {
      dependsOn: "query-type",
      showWhen: ["complex"],
    },
    placeholder: "Enter faculty and department",
  },
  {
    id: "complex-project-title",
    title: "Project Title",
    type: "text",
    required: true,
    section: "complex-project",
    order: 16,
    visible: true,
    conditional: {
      dependsOn: "query-type",
      showWhen: ["complex"],
    },
    placeholder: "Enter project title",
  },
  {
    id: "complex-uom-lead",
    title: "Is UOM the lead?",
    type: "checkbox-group",
    required: true,
    section: "complex-project",
    order: 17,
    visible: true,
    conditional: {
      dependsOn: "query-type",
      showWhen: ["complex"],
    },
    options: [
      { id: "lead", label: "Lead" },
      { id: "non-lead", label: "Non-Lead" },
    ],
  },

  // Complex Query - Other Parties
  {
    id: "complex-other-parties",
    title: "Are there other parties involved in the Project?",
    type: "radio-group",
    required: true,
    section: "complex-parties",
    order: 18,
    visible: true,
    conditional: {
      dependsOn: "query-type",
      showWhen: ["complex"],
    },
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" },
    ],
  },

  // Project Partners - Party 1 Name
  {
    id: "complex-party1-name",
    title: "Other Party 1 - Name",
    type: "text",
    required: true,
    section: "complex-parties",
    order: 19,
    visible: true,
    conditional: {
      dependsOn: "complex-other-parties",
      showWhen: ["yes"],
    },
    placeholder: "Enter name of other party",
  },

  // Project Partners - Party 1 Role
  {
    id: "complex-party1-role",
    title: "Other Party 1 - Role in the project",
    type: "radio-group",
    required: true,
    section: "complex-parties",
    order: 20,
    visible: true,
    conditional: {
      dependsOn: "complex-other-parties",
      showWhen: ["yes"],
    },
    options: [
      { id: "funder", label: "Funder" },
      { id: "administering-organisation", label: "Administering Organisation" },
      { id: "collaborator", label: "Collaborator" },
      { id: "incoming-party", label: "Incoming party" },
      { id: "outgoing-party", label: "Outgoing party" },
      { id: "other", label: "Other", hasOtherField: true },
    ],
  },

  // Project Partners - Additional Parties Check
  {
    id: "complex-additional-parties",
    title: "Are there other parties involved?",
    type: "radio-group",
    required: true,
    section: "complex-parties",
    order: 21,
    visible: true,
    conditional: {
      dependsOn: "complex-other-parties",
      showWhen: ["yes"],
    },
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" },
    ],
  },

  // Project Partners - Party 2 Name
  {
    id: "complex-party2-name",
    title: "Other Party 2 - Name",
    type: "text",
    required: true,
    section: "complex-parties",
    order: 22,
    visible: true,
    conditional: {
      dependsOn: "complex-additional-parties",
      showWhen: ["yes"],
    },
    placeholder: "Enter name of other party",
  },

  // Project Partners - Party 2 Role
  {
    id: "complex-party2-role",
    title: "Other Party 2 - Role in the project",
    type: "radio-group",
    required: true,
    section: "complex-parties",
    order: 23,
    visible: true,
    conditional: {
      dependsOn: "complex-additional-parties",
      showWhen: ["yes"],
    },
    options: [
      { id: "funder", label: "Funder" },
      { id: "administering-organisation", label: "Administering Organisation" },
      { id: "collaborator", label: "Collaborator" },
      { id: "incoming-party", label: "Incoming party" },
      { id: "outgoing-party", label: "Outgoing party" },
      { id: "other", label: "Other", hasOtherField: true },
    ],
  },

  // Project Partners - Additional Parties Check 2
  {
    id: "complex-additional-parties-2",
    title: "Are there other parties involved?",
    type: "radio-group",
    required: true,
    section: "complex-parties",
    order: 24,
    visible: true,
    conditional: {
      dependsOn: "complex-additional-parties",
      showWhen: ["yes"],
    },
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" },
    ],
  },

  // Project Partners - Party 3 Name
  {
    id: "complex-party3-name",
    title: "Other Party 3 - Name",
    type: "text",
    required: true,
    section: "complex-parties",
    order: 25,
    visible: true,
    conditional: {
      dependsOn: "complex-additional-parties-2",
      showWhen: ["yes"],
    },
    placeholder: "Enter name of other party",
  },

  // Project Partners - Party 3 Role
  {
    id: "complex-party3-role",
    title: "Other Party 3 - Role in the project",
    type: "radio-group",
    required: true,
    section: "complex-parties",
    order: 26,
    visible: true,
    conditional: {
      dependsOn: "complex-additional-parties-2",
      showWhen: ["yes"],
    },
    options: [
      { id: "funder", label: "Funder" },
      { id: "administering-organisation", label: "Administering Organisation" },
      { id: "collaborator", label: "Collaborator" },
      { id: "incoming-party", label: "Incoming party" },
      { id: "outgoing-party", label: "Outgoing party" },
      { id: "other", label: "Other", hasOtherField: true },
    ],
  },

  // Complex Query - Agreement Types
  {
    id: "complex-agreement-types",
    title: "Type of Agreement for review",
    type: "checkbox-group",
    required: true,
    section: "complex-agreements",
    order: 27,
    visible: true,
    conditional: {
      dependsOn: "query-type",
      showWhen: ["complex"],
    },
    options: [
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
      { id: "other", label: "Other", hasOtherField: true },
    ],
  },

  // Complex Query - Support Fields
  {
    id: "complex-hpecm-reference",
    title: "HPECM reference",
    type: "textarea",
    required: false,
    section: "complex-support",
    order: 28,
    visible: true,
    conditional: {
      dependsOn: "query-type",
      showWhen: ["complex"],
    },
    placeholder: "Enter HPECM reference",
  },
  {
    id: "complex-other-agreements",
    title: "Are there other agreements that relate to this project?",
    type: "textarea",
    required: false,
    section: "complex-support",
    order: 29,
    visible: true,
    conditional: {
      dependsOn: "query-type",
      showWhen: ["complex"],
    },
    placeholder: "Enter details of other related agreements",
  },
  {
    id: "complex-how-can-we-help",
    title: "How can we help?",
    type: "textarea",
    required: true,
    section: "complex-support",
    order: 30,
    visible: true,
    conditional: {
      dependsOn: "query-type",
      showWhen: ["complex"],
    },
    placeholder: "Enter details about how we can help",
  },
  {
    id: "complex-other-notes",
    title: "Other notes",
    type: "textarea",
    required: false,
    section: "complex-support",
    order: 31,
    visible: true,
    conditional: {
      dependsOn: "query-type",
      showWhen: ["complex"],
    },
    placeholder: "Enter any additional notes",
  },
  {
    id: "complex-documents-attached",
    title: "Attach all relevant documents",
    description:
      "Please attach the online drive link of agreement (such as Google Drive or OneDrive) for review, funding agreement, relevant correspondence, related agreements",
    type: "textarea",
    required: true,
    section: "complex-support",
    order: 32,
    visible: true,
    conditional: {
      dependsOn: "query-type",
      showWhen: ["complex"],
    },
  },
  {
    id: "complex-documents-list",
    title: "Document List",
    description: "Please list the documents you have attached or confirm attachment",
    type: "textarea",
    required: false,
    section: "complex-support",
    order: 32.5,
    visible: true,
    conditional: {
      dependsOn: "query-type",
      showWhen: ["complex"],
    },
    placeholder: "Please list the documents you have attached or confirm attachment",
  },
  {
    id: "complex-urgency",
    title: "Is there urgency on this request?",
    type: "radio-group",
    required: true,
    section: "complex-support",
    order: 33,
    visible: true,
    conditional: {
      dependsOn: "query-type",
      showWhen: ["complex"],
    },
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" },
    ],
  },
  {
    id: "complex-urgency-date",
    title: "Please provide the date by which you need this completed",
    type: "date",
    required: false,
    section: "complex-support",
    order: 34,
    visible: true,
    conditional: {
      dependsOn: "complex-urgency",
      showWhen: ["yes"],
    },
  },
];
