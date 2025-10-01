import { deleteForm } from "@/app/actions/deleteForm";
import { publishForm } from "@/app/actions/publishForm";
import { updateFormName } from "@/app/actions/updateFormName";
import { Publish, RemoveRedEye } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
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
    addAdminEmailToSendFormResultsTo,
    editFormName,
  } = useFormBuilder({ template: props.template });

  const router = useRouter();

  const { showPreview, openPreviewDrawer, closePreviewDrawer } =
    useFormPreview();

  const { classes } = useStyles();

  const [isPublishing, setIsPublishing] = useState(false);
  const [isEditingFormName, setIsEditingFormName] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

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
      formData.append(
        "adminEmailToSendResultsTo",
        selectedTemplate?.adminEmailToSendResultsTo
      );

      console.log({ formLayoutComponents });

      // Call your server function (Next.js server action)
      const res = await publishForm({ message: "" }, formData);

      if (res.message === "success") {
        // Update the form name after successful publish
        if (selectedTemplate?.id && selectedTemplate?.formName) {
          const updateResult = await updateFormName({
            formId: Number(selectedTemplate.id),
            name: selectedTemplate.formName,
          });

          if (updateResult.message !== "success") {
            console.error("Failed to update form name:", updateResult);
            // You might want to handle this error differently
          }
        }

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

  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    setOpenDeleteDialog(false);
    startIsDeletingTransition(() => {
      deleteForm({ id: selectedTemplate?.id! });
      window.location.href = "/view-forms-redirect";
    });
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
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
                          {isEditingFormName ? (
                            <TextField
                              variant="outlined"
                              size="small"
                              autoFocus
                              value={selectedTemplate?.formName ?? ""}
                              onChange={(e) => editFormName(e.target.value)}
                              onBlur={() => setIsEditingFormName(false)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  setIsEditingFormName(false);
                                }
                              }}
                            />
                          ) : (
                            <h4
                              className="mb-0"
                              style={{ cursor: "pointer" }}
                              onClick={() => setIsEditingFormName(true)}
                            >
                              {selectedTemplate?.formName || "Untitled Form"}
                            </h4>
                          )}
                        </div>
                        <div>
                          <div className="action-buttons d-flex">
                            <Button
                              onClick={handleDeleteClick}
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
                              onClick={() => {
                                if (selectedTemplate?.id) {
                                  window.open(
                                    `/forms/ric_form/${selectedTemplate.id}`,
                                    "_blank"
                                  );
                                }
                              }}
                              endIcon={<RemoveRedEye />}
                              disabled={!selectedTemplate?.id}
                            >
                              Preview
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
                    addAdminEmailToSendFormResultsTo={
                      addAdminEmailToSendFormResultsTo
                    }
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

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={openDeleteDialog}
            onClose={handleDeleteCancel}
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-description"
          >
            <DialogTitle id="delete-dialog-title">Delete Form?</DialogTitle>
            <DialogContent>
              <DialogContentText id="delete-dialog-description">
                Are you sure you want to delete "
                {selectedTemplate?.formName || "this form"}"? This action cannot
                be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDeleteCancel} color="primary">
                Cancel
              </Button>
              <Button
                onClick={handleDeleteConfirm}
                color="error"
                variant="contained"
                autoFocus
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </DndProvider>
      </>
    </>
  );
};

export default FormBuilder;
