"use client";

import { FunctionComponent } from "react";
import FormBuilder from "./form-builder";
import { TemplateType } from "./types/FormTemplateTypes";

interface FormBuilderPageProps {
  formTemplate: TemplateType;
}

const FormBuilderPage: FunctionComponent<FormBuilderPageProps> = ({
  formTemplate,
}) => {
  return <FormBuilder template={formTemplate} />;
};

export default FormBuilderPage;
