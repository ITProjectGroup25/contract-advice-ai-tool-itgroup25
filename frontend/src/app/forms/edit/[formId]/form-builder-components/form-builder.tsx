import { deleteForm } from "@/app/actions/deleteForm";
import { publishForm } from "@/app/actions/publishForm";
import { SAMPLE_GRANT_FORM_URL } from "@/app/contact/community-showcase";
import PublishIcon from "@mui/icons-material/Publish";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
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
  } = useFormBuilder({ template: props.template });

  const router = useRouter();

  const { showPreview, openPreviewDrawer, closePreviewDrawer } = useFormPreview();

  const { classes } = useStyles();

  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublishForm = async () => {
    try {
      setIsPublishing(true);

      // Convert your form layout/components into FormData
      const formData = new FormData();
      formData.append("formName", selectedTemplate?.formName ?? "");
      formData.append("formLayoutComponents", JSON.stringify(formLayoutComponents));
      formData.append("id", String(selectedTemplate?.id ?? ""));

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

  return (
    <>
      <>
        <DndProvider backend={HTML5Backend}>
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
                <div className="h-100 container p-20">
                  {/* Form Details and Action */}
                  <div className="row mb-5">
                    <div className="col-12">
                      <div className="d-flex justify-content-between align-items-between">
                        <h4 className="mb-0">{selectedTemplate?.formName}</h4>
                        <div className="action-buttons d-flex">
                          <Button
                            onClick={handleDelete}
                            className="text-red mx-2"
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
                            endIcon={<RemoveRedEyeIcon />}
                          >
                            <a href={SAMPLE_GRANT_FORM_URL}>Preview</a>
                          </Button>
                          <Button
                            onClick={handlePublishForm}
                            className="mx-2"
                            color="primary"
                            endIcon={<PublishIcon />}
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
