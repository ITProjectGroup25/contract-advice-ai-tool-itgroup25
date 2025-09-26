import { z } from "zod";

// Leaf type
export const FormLayoutComponentChildrenItemsSchema = z.object({
  id: z.number().or(z.string()),
  value: z.string(),
  label: z.string(),
});
export type FormLayoutComponentChildrenItemsType = z.infer<
  typeof FormLayoutComponentChildrenItemsSchema
>;

// Children type
export const FormLayoutComponentChildrenSchema = z.object({
  controlName: z.string(),
  displayText: z.string(),
  description: z.string(),
  labelName: z.string(),
  itemType: z.string(),
  icon: z.string(),
  required: z.boolean(),
  alwaysVisible: z.boolean().optional(),
  items: z.array(FormLayoutComponentChildrenItemsSchema).optional(),
  category: z.string(),
  index: z.number().optional(),
  id: z.string().or(z.number()),
  containerId: z.string(),
  placeholder: z.string().optional(),
  rows: z.number().optional(),
  dataType: z.string().optional(),
  position: z.number().optional(),
});
export type FormLayoutComponentChildrenType = z.infer<
  typeof FormLayoutComponentChildrenSchema
>;

// Container type
export const FormLayoutComponentContainerSchema = z.object({
  controlName: z.string(),
  displayText: z.string(),
  itemType: z.string(),
  icon: z.string(),
  heading: z.string(),
  subHeading: z.string(),
  id: z.string(),
  alwaysVisible: z.boolean(),
  desktopWidth: z.number().optional(),
});
export type FormLayoutComponentContainerType = z.infer<
  typeof FormLayoutComponentContainerSchema
>;

// Components type
export const FormLayoutComponentsSchema = z.object({
  container: FormLayoutComponentContainerSchema,
  children: z.array(FormLayoutComponentChildrenSchema),
});
export type FormLayoutComponentsType = z.infer<
  typeof FormLayoutComponentsSchema
>;

// History type
export const FormLayoutHistorySchema = z.object({
  lastPublishedAt: z.number(),
  formLayoutComponents: z.array(FormLayoutComponentsSchema),
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
  formLayoutComponents: z.array(FormLayoutComponentsSchema),
  publishHistory: z.array(FormLayoutHistorySchema).optional(),
  creator: z.string().optional(),
});
export type TemplateType = z.infer<typeof TemplateSchema>;
