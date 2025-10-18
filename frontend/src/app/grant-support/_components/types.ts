import { z } from "zod";

// Leaf type
export const FormSectionChildrenItemsSchema = z.object({
  id: z.number().or(z.string()),
  value: z.string(),
  label: z.string(),
});
export type FormSectionChildrenItemsType = z.infer<
  typeof FormSectionChildrenItemsSchema
>;

const ComponentToMakeVisibleSchema = z.object({
  containerToMakeVisible: z.string(),
  optionThatMakesVisible: z.string(),
});

export type ComponentToMakeVisibleSchemaType = z.infer<
  typeof ComponentToMakeVisibleSchema
>;

// Children type
export const FormSectionChildrenSchema = z.object({
  controlName: z.string(),
  displayText: z.string(),
  description: z.string(),
  labelName: z.string(),
  itemType: z.string(),
  icon: z.string(),
  required: z.boolean(),
  alwaysVisible: z.boolean().optional(),
  items: z.array(FormSectionChildrenItemsSchema).optional(),
  category: z.string(),
  index: z.number().optional(),
  id: z.string().or(z.number()),
  containerId: z.string(),
  placeholder: z.string().optional(),
  rows: z.number().optional(),
  dataType: z.string().optional(),
  position: z.number().optional(),
  containersToMakeVisible: z.array(ComponentToMakeVisibleSchema).optional(),
});
export type FormSectionChildrenType = z.infer<typeof FormSectionChildrenSchema>;

// Container type
export const FormSectionContainerSchema = z.object({
  controlName: z.string(),
  displayText: z.string(),
  itemType: z.string(),
  icon: z.string(),
  heading: z.string(),
  subHeading: z.string(),
  id: z.string(),
  alwaysVisible: z.boolean(),
  selectedControlOption: z.string().optional(),
  selectedControlHeading: z.string().optional(),
  desktopWidth: z.number().optional(),
});

export type FormSectionContainerType = z.infer<
  typeof FormSectionContainerSchema
>;

// Section type (formerly FormLayoutComponentsSchema)
export const FormSectionSchema = z.object({
  container: FormSectionContainerSchema,
  children: z.array(FormSectionChildrenSchema),
});
export type FormSectionType = z.infer<typeof FormSectionSchema>;

// Array of sections
export const FormSectionsSchema = z.array(FormSectionSchema);
export type FormSectionsType = z.infer<typeof FormSectionsSchema>;

// History type
export const FormLayoutHistorySchema = z.object({
  lastPublishedAt: z.number(),
  formLayoutComponents: FormSectionsSchema,
});
export type FormLayoutHistoryType = z.infer<typeof FormLayoutHistorySchema>;

// Template type
export const TemplateSchema = z.object({
  formName: z.string(),
  id: z.number(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  lastPublishedAt: z.date().optional(),
  publishStatus: z.string().optional(),
  formLayoutComponents: FormSectionsSchema,
  publishHistory: z.array(FormLayoutHistorySchema).optional(),
  creator: z.string().optional(),
  adminEmailToSendResultsTo: z.string().optional(),
});
export type TemplateType = z.infer<typeof TemplateSchema>;

// Schema for file upload data
const FileUploadSchema = z.object({
  fileName: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
  filePath: z.string(),
  fileUrl: z.string().url(),
});

// Updated container response item schema to include file uploads
const ContainerResponseItemSchema = z.record(
  z.string(), // Field label name
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.string()),
    FileUploadSchema, // Add file upload object
  ])
);

// Schema for responses grouped by container
const ResponsesByContainerSchema = z.record(
  z.string(), // Container name
  z.array(ContainerResponseItemSchema)
);

// Main form submission schema
export const FormSubmissionSchema = z.object({
  formId: z.number(),
  formName: z.string(),
  submittedAt: z.string().datetime(), // ISO 8601 datetime string
  responses: ResponsesByContainerSchema,
});

export type FormSubmissionType = z.infer<typeof FormSubmissionSchema>;
export const SingleResultSchema = z.record(
  z.string(), // Container name
  z.array(ContainerResponseItemSchema)
);

export type SingleResult = z.infer<typeof SingleResultSchema>;

export const FormResultSchema = z.object({
  id: z.number(),
  formId: z.number(),
  submittedAt: z.date(),
  results: SingleResultSchema,
});

export type FormResult = z.infer<typeof FormResultSchema>;

export const formStatusEnum = z.enum([
  "Active",
  "Draft",
  "Published",
  "Archived",
]); // Add "Active"

export const formSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10)), // Convert string id to number
  formKey: z.string().max(64).optional(),
  title: z.string().max(200).optional(),
  description: z.string().optional(),
  status: formStatusEnum,
  versionNo: z.number(),
  emailSubjectTpl: z.string().max(255).optional().nullable(),
  emailBodyTpl: z.string().optional().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  formSections: FormSectionsSchema.optional(),
});

// API response wrapper
export const apiResponseSchema = z.object({
  form: formSchema,
});

// Infer TypeScript type
export type Form = z.infer<typeof formSchema>;
