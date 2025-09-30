import { deleteForm } from "@/app/actions/deleteForm";
import { publishForm } from "@/app/actions/publishForm";
import { SAMPLE_GRANT_FORM_URL } from "@/app/contact/community-showcase";
import { Publish, RemoveRedEye } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { FunctionComponent, useState, useTransition } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { makeStyles } from "tss-react/mui";
import LeftSidebar from "./LeftSidebar";
import useFormBuilder from "./hooks/useFormBuilder";
import useFormPreview from "./hooks/useFormPreview";
import DropContainerComponent from "./subcomponents/DropContainerComponent";
import EditPropertiesComponent from "./subcomponents/EditPropertiesComponent";
import FormPreview from "./subcomponents/FormPreview";
import { TemplateType } from "./types/FormTemplateTypes";
import { FormItemTypes } from "./utils/formBuilderUtils";

interface FormBuilderProps {
  template: TemplateType;
}

const useStyles = makeStyles()(() => ({
  textField: {
    minWidth: "100%",
    maxWidth: "100%",
  },
  sidebarHeight: {
    height: "calc(100vh - 63px);",
    overflowY: "auto",
  },
}));

const FormBuilder: FunctionComponent<FormBuilderProps> = (props) => {
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
    addAdminEmailToSendFormResultsTo
  } = useFormBuilder({ template: props.template });

  const router = useRouter();

  const { showPreview, openPreviewDrawer, closePreviewDrawer } =
    useFormPreview();

  const { classes } = useStyles();

  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublishForm = async () => {
    try {
      setIsPublishing(true);

      // Convert your form layout/components into FormData
      const formData = new FormData();
      formData.append("formName", selectedTemplate?.formName);
      formData.append(
        "formLayoutComponents",
        JSON.stringify(formLayoutComponents)
      );
      formData.append("id", selectedTemplate?.id);
      formData.append("adminEmailToSendResultsTo", selectedTemplate?.adminEmailToSendResultsTo);

      console.log({ formLayoutComponents });

      // Call your server function (Next.js server action)
      const res = await publishForm({ message: "" }, formData);

      if (res.message === "success") {
        // Optionally navigate to the newly published form

        window.location.href = "/view-forms-redirect";
      } else {
        console.error(res.message);
      }
    } catch (error) {
      console.error("Error publishing form:", error);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCancel = () => {
    router.refresh();

    window.location.href = "/view-forms-redirect";
  };

  const handleSave = () => {};

  const [isDeleting, startIsDeletingTransition] = useTransition();

  const handleDelete = () => {
    startIsDeletingTransition(() => {
      deleteForm({ id: selectedTemplate?.id! });

      window.location.href = "/view-forms-redirect";
    });
  };

  const handleGoToResults = () => {
    router.push(`/forms/results/${selectedTemplate?.id}`);
  };

  const handleGoToFAQCreator = () => {
    router.push(`/forms/faq-creator/${selectedTemplate?.id}`);
  };

  return (
    <>
      <>
        <DndProvider backend={HTML5Backend}>
          <button
            onClick={() =>
              console.log({ formLayoutComponents, selectedTemplate })
            }
          >
            CLICKME
          </button>
          <div className="wrapper">
            <div className="row">
              <div
                className={classes.sidebarHeight + " sidebar col-lg-3"}
                style={{ paddingLeft: "30px !important" }}
              >
                <div className="container">
                  <LeftSidebar
                    handleItemAdded={handleItemAdded}
                    formLayoutComponents={formLayoutComponents}
                  />
                </div>
              </div>
              <div className="col-lg-6">
                <div className="container p-20 h-100">
                  {/* Form Details and Action */}
                  <div className="row mb-5">
                    <div className="col-12">
                      <div className="d-flex justify-content-between align-items-between">
                        <div>
                          <h4 className="mb-0">{selectedTemplate?.formName}</h4>
                        </div>
                        <div>
                          <div className="action-buttons d-flex">
                            <Button
                              onClick={handleDelete}
                              className="mx-2 text-red"
                              disabled={isDeleting}
                            >
                              {isDeleting ? "Deleting..." : "Delete"}
                            </Button>
                            <div className="border-right"></div>
                            <Button onClick={handleCancel} className="mx-2">
                              Cancel
                            </Button>
                            <div className="border-right"></div>
                            <Button onClick={handleSave} className="mx-2">
                              Save
                            </Button>
                            <Button
                              className="mx-2"
                              variant="outlined"
                              // onClick={() => openPreviewDrawer()}
                              endIcon={<RemoveRedEye />}
                            >
                              <a href={SAMPLE_GRANT_FORM_URL}>Preview</a>
                            </Button>
                            <Button
                              onClick={handlePublishForm}
                              className="mx-2"
                              color="primary"
                              endIcon={<Publish />}
                              disableElevation
                              variant="contained"
                              disabled={isPublishing}
                            >
                              {isPublishing ? "Publishing..." : "Publish"}
                            </Button>
                          </div>
                          <div className="d-flex justify-content-start align-items-center">
                            <Button
                              onClick={handleGoToResults}
                              className="mx-2"
                            >
                              Results
                            </Button>
                            <Button
                              onClick={handleGoToFAQCreator}
                              className="mx-2"
                            >
                              FAQ
                            </Button>
                            <div className="border-right"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className="p-20"
                    style={{
                      overflowY: "auto",
                      height: "calc(100vh - 180px)",
                    }}
                  >
                    <div className="row mb-5">
                      {formLayoutComponents.map((layout, ind) => {
                        return (
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
                        );
                      })}
                    </div>
                    <div className="row mb-5">
                      <DropContainerComponent
                        accept={FormItemTypes.CONTAINER}
                        name={"Parent Component"}
                        handleItemAdded={handleItemAdded}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className={classes.sidebarHeight + " sidebar col-lg-3"}>
                <div className="container">
                  <EditPropertiesComponent
                    selectedTemplate={selectedTemplate}
                    selectedControl={selectedControl}
                    selectControl={selectControl}
                    formLayoutComponents={formLayoutComponents}
                    moveControlFromSide={moveControlFromSide}
                    editContainerProperties={editContainerProperties}
                    editControlProperties={editControlProperties}
                    addAdminEmailToSendFormResultsTo={addAdminEmailToSendFormResultsTo}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Preview Drawer */}
          <FormPreview
            screenType="mobile"
            showPreview={showPreview}
            formLayoutComponents={formLayoutComponents}
            closePreviewDrawer={closePreviewDrawer}
          />
        </DndProvider>
      </>
    </>
  );
};

export default FormBuilder;
