import { Publish, RemoveRedEye } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { makeStyles } from "tss-react/mui";

import { deleteForm } from "@/app/actions/deleteForm";
import { publishForm } from "@/app/actions/publishForm";
import { SAMPLE_GRANT_FORM_URL } from "@/app/contact/community-showcase";

import useFormBuilder from "./hooks/useFormBuilder";
import useFormPreview from "./hooks/useFormPreview";
import LeftSidebar from "./LeftSidebar";
import DropContainerComponent from "./subcomponents/DropContainerComponent";
import EditPropertiesComponent from "./subcomponents/EditPropertiesComponent";
import FormPreview from "./subcomponents/FormPreview";
import { TemplateType } from "./types/FormTemplateTypes";
import { FormItemTypes } from "./utils/formBuilderUtils";

interface FormBuilderProps {
  template: TemplateType;
}

const useStyles = makeStyles()(() => ({
  sidebarHeight: {
    height: "calc(100vh - 63px)",
    overflowY: "auto",
  },
  paddedSidebar: {
    paddingLeft: 30,
  },
}));

const FormBuilder = (props: FormBuilderProps) => {
  const {
    handleItemAdded,
    deleteContainer,
    deleteControl,
    editContainerProperties,
    editControlProperties,
    moveControl,
    moveControlFromSide,
    selectControl,
    selectedTemplate,
    formLayoutComponents,
    selectedControl,
  } = useFormBuilder({ template: props.template });

  const router = useRouter();
  const { showPreview, closePreviewDrawer } = useFormPreview();
  const { classes } = useStyles();

  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, startIsDeletingTransition] = useTransition();

  const handlePublishForm = async () => {
    try {
      setIsPublishing(true);
      const formData = new FormData();
      formData.append("formName", selectedTemplate?.formName ?? "");
      formData.append("formLayoutComponents", JSON.stringify(formLayoutComponents));
      formData.append("id", String(selectedTemplate?.id ?? ""));
      const res = await publishForm({ message: "" }, formData);
      if (res.message === "success") {
        router.push("/view-forms-redirect");
      } else {
        // eslint-disable-next-line no-console
        console.error(res.message);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error publishing form:", error);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCancel = () => {
    router.refresh();
    router.push("/view-forms-redirect");
  };

  const handleSave = () => {};

  const handleDelete = () => {
    const templateId = selectedTemplate?.id;
    if (!templateId) return;
    startIsDeletingTransition(() => {
      void (async () => {
        await deleteForm({ id: templateId });
        router.push("/view-forms-redirect");
      })();
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={["wrapper"].join(" ")}>
        <div className={["row"].join(" ")}>
          <div
            className={[classes.sidebarHeight, classes.paddedSidebar, "sidebar", "col-lg-3"].join(
              " "
            )}
          >
            <div className={["container"].join(" ")}>
              <LeftSidebar
                handleItemAdded={handleItemAdded}
                formLayoutComponents={formLayoutComponents}
              />
            </div>
          </div>

          <div className={["col-lg-6"].join(" ")}>
            <div className={["h-100", "container", "p-20"].join(" ")}>
              <div className={["row", "mb-5"].join(" ")}>
                <div className={["col-12"].join(" ")}>
                  <div
                    className={["d-flex", "justify-content-between", "align-items-between"].join(
                      " "
                    )}
                  >
                    <h4 className={["mb-0"].join(" ")}>{selectedTemplate?.formName}</h4>
                    <div className={["action-buttons", "d-flex"].join(" ")}>
                      <Button
                        onClick={handleDelete}
                        className={["text-red", "mx-2"].join(" ")}
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </Button>
                      <div className={["border-right"].join(" ")} />
                      <Button onClick={handleCancel} className={["mx-2"].join(" ")}>
                        Cancel
                      </Button>
                      <div className={["border-right"].join(" ")} />
                      <Button onClick={handleSave} className={["mx-2"].join(" ")}>
                        Save
                      </Button>
                      <Button
                        className={["mx-2"].join(" ")}
                        variant="outlined"
                        endIcon={<RemoveRedEye />}
                        component="a"
                        href={SAMPLE_GRANT_FORM_URL}
                      >
                        Preview
                      </Button>
                      <Button
                        onClick={handlePublishForm}
                        className={["mx-2"].join(" ")}
                        color="primary"
                        endIcon={<Publish />}
                        disableElevation
                        variant="contained"
                        disabled={isPublishing}
                      >
                        {isPublishing ? "Publishing..." : "Publish"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={["p-20"].join(" ")}
                style={{ overflowY: "auto", height: "calc(100vh - 180px)" }}
              >
                <div className={["row", "mb-5"].join(" ")}>
                  {formLayoutComponents.map((layout, ind) => (
                    <DropContainerComponent
                      key={layout.container.id}
                      index={ind}
                      layout={layout.container}
                      selectedControl={selectedControl}
                      childrenComponents={layout.children}
                      deleteContainer={deleteContainer}
                      deleteControl={deleteControl}
                      selectControl={selectControl}
                      accept={FormItemTypes.CONTROL}
                      moveControl={moveControl}
                    />
                  ))}
                </div>

                <div className={["row", "mb-5"].join(" ")}>
                  <DropContainerComponent
                    accept={FormItemTypes.CONTAINER}
                    name="Parent Component"
                    handleItemAdded={handleItemAdded}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={[classes.sidebarHeight, "sidebar", "col-lg-3"].join(" ")}>
            <div className={["container"].join(" ")}>
              <EditPropertiesComponent
                selectedControl={selectedControl}
                selectControl={selectControl}
                formLayoutComponents={formLayoutComponents}
                moveControlFromSide={moveControlFromSide}
                editContainerProperties={editContainerProperties}
                editControlProperties={editControlProperties}
              />
            </div>
          </div>
        </div>
      </div>

      <FormPreview
        screenType="mobile"
        showPreview={showPreview}
        formLayoutComponents={formLayoutComponents}
        closePreviewDrawer={closePreviewDrawer}
      />
    </DndProvider>
  );
};

export default FormBuilder;
