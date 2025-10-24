import { Drawer, IconButton } from "@mui/material";
import { Component } from "react";

import { FormLayoutComponentsType } from "../types/FormTemplateTypes";

import StepperFormPreview from "./form-preview/StepperFormPreview";

interface FormPreviewProps {
  screenType: string;
  showPreview: boolean;
  closePreviewDrawer: () => void;
  formLayoutComponents: FormLayoutComponentsType[];
}

interface FormPreviewStates {
  screenType: string;
}

class FormPreview extends Component<FormPreviewProps, FormPreviewStates> {
  constructor(props: FormPreviewProps) {
    super(props);
    this.state = {
      screenType: this.props.screenType || "mobile",
    };
    this.handleCloseClick = this.handleCloseClick.bind(this);
  }

  handleCloseClick() {
    this.props.closePreviewDrawer();
  }

  render() {
    const { showPreview, formLayoutComponents } = this.props;

    return (
      <>
        <Drawer open={showPreview} anchor="right" onClose={this.handleCloseClick}>
          <div
            style={{
              minWidth: "30vw",
              backgroundColor: "#f8f9fa",
              height: "100vh",
            }}
          >
            <div className="container">
              <div className="p-20">
                <div className="d-flex align-items-center">
                  <IconButton
                    aria-label="Close preview"
                    onClick={this.handleCloseClick}
                    style={{ marginRight: "10px" }}
                  >
                    <i className="fas fa-chevron-right" aria-hidden="true"></i>
                  </IconButton>
                  <h4>Preview</h4>
                </div>
                <StepperFormPreview
                  screenType={this.state.screenType}
                  formLayoutComponents={formLayoutComponents}
                />
              </div>
            </div>
          </div>
        </Drawer>
      </>
    );
  }
}

export default FormPreview;
