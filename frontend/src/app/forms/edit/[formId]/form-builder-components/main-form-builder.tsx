"use client";

import { Provider } from "react-redux";

import "../../../edit/[formId]/form-builder-components/styles/plugins.css";
import "../../../edit/[formId]/form-builder-components/styles/style.css";
import "../../../edit/[formId]/form-builder-components/subcomponents/styles.scss";
import FormBuilderPage from "./form-builder-page";
import ModalStrip from "./ModalStrip";
import { store } from "./redux/store";
import { TemplateType } from "./types/FormTemplateTypes";

interface MainFormBuilderProps {
  formTemplate: TemplateType;
}

function MainFormBuilder({ formTemplate }: MainFormBuilderProps) {
  return (
    <>
      <Provider store={store}>
        <ModalStrip />
        <FormBuilderPage formTemplate={formTemplate} />
      </Provider>
    </>
  );
}

export default MainFormBuilder;
