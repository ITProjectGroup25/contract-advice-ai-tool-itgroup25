import {
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import _ from "lodash";
import React, { FC, useEffect, useState } from "react";
import useFormBuilder from "../hooks/useFormBuilder";
import {
  FormLayoutComponentChildrenItemsType,
  FormLayoutComponentChildrenType,
  FormLayoutComponentContainerType,
  FormLayoutComponentsType,
} from "../types/FormTemplateTypes";
import { FormControlNames, FormItemTypes } from "../utils/formBuilderUtils";
import ManageItemsListComponent from "./ManageItemsListComponent";
import listAllControlDisplayNames from "./helpers/listAllControlDisplayNames";
import retrieveOptionsFromControl from "./helpers/retrieveOptionsFromControl";

const textboxStyle = {
  minWidth: "100%",
  maxWidth: "100%",
  marginTop: 10,
};

interface EditPropertiesComponentProps {
  selectedTemplate?: ReturnType<typeof useFormBuilder>["selectedTemplate"];
  selectedControl?:
    | undefined
    | FormLayoutComponentChildrenType
    | FormLayoutComponentContainerType;
  selectControl?: (
    layout:
      | FormLayoutComponentChildrenType
      | FormLayoutComponentContainerType
      | undefined
  ) => void;
  editControlProperties: (updatedItem: FormLayoutComponentChildrenType) => void;
  editContainerProperties: (
    updatedItem: FormLayoutComponentContainerType
  ) => void;
  formLayoutComponents: FormLayoutComponentsType[];
  moveControlFromSide: (
    selectedControl: FormLayoutComponentChildrenType,
    moveControlObj: FormLayoutComponentChildrenType
  ) => void;
}

const EditPropertiesComponent: FC<EditPropertiesComponentProps> = (props) => {
  const {
    selectedTemplate,
    selectedControl,
    selectControl,
    editControlProperties,
    editContainerProperties,
  } = props;
  const [updatedItem, setUpdatedItem] = useState<
    FormLayoutComponentChildrenType | FormLayoutComponentContainerType | {}
  >({});

  const childUpdatedItem = updatedItem as FormLayoutComponentChildrenType;
  const containerUpdatedItem = updatedItem as FormLayoutComponentContainerType;

  const [isUpdatedItemRequired, setIsUpdatedItemRequired] = useState(false);
  const [itemIsAlwaysVisible, setItemIsAlwaysVisible] = useState(true);

  console.log({ selectedTemplate });

  const controlDisplayNames = listAllControlDisplayNames(selectedTemplate!);

  const [selectedControlHeading, setSelectedControlHeading] = useState("");

  const controlOptions = retrieveOptionsFromControl({
    controlName: selectedControlHeading,
    template: selectedTemplate!,
  });

  const [selectedControlOption, setSelectedControlOption] = useState("");

  useEffect(() => {
    if (selectedControl) {
      if ((selectedControl as FormLayoutComponentChildrenType).items) {
        setUpdatedItem({
          ...selectedControl,
          items: JSON.parse(
            JSON.stringify(
              (selectedControl as FormLayoutComponentChildrenType).items
            )
          ),
        });
      } else {
        setUpdatedItem({ ...selectedControl });
      }
      if (selectedControl.hasOwnProperty("required")) {
        setIsUpdatedItemRequired(
          (selectedControl as FormLayoutComponentChildrenType).required
        );
      }
      if (selectedControl.hasOwnProperty("alwaysVisible")) {
        setItemIsAlwaysVisible(
          (selectedControl as FormLayoutComponentChildrenType).alwaysVisible!
        );
      }
    }
  }, [selectedControl]);

  const handleChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = (e) => {
    const { name, value } = e.target;
    setUpdatedItem((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const addItemInList = (item: FormLayoutComponentChildrenItemsType) => {
    const newItems = _.cloneDeep(
      (updatedItem as FormLayoutComponentChildrenType).items
    );
    newItems.push(item);
    setUpdatedItem((prevState) => ({
      ...prevState,
      items: newItems,
    }));
  };

  const deleteItemFromList = (item: FormLayoutComponentChildrenItemsType) => {
    const newItems = (
      updatedItem as FormLayoutComponentChildrenType
    ).items?.filter((i) => i.id !== item.id);
    setUpdatedItem((prevState) => ({
      ...prevState,
      items: newItems,
    }));
  };

  const editIteminList = (item: FormLayoutComponentChildrenItemsType) => {
    const newItems: FormLayoutComponentChildrenItemsType[] = _.cloneDeep(
      (updatedItem as FormLayoutComponentChildrenType).items
    );
    const itemToBeReplaced = newItems.filter((i) => i.id === item.id)[0];
    itemToBeReplaced.value = item.value;
    itemToBeReplaced.label = item.label;
    setUpdatedItem((prevState) => ({
      ...prevState,
      items: newItems,
    }));
  };

  const handleCheckChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const { name } = e.target;
    const key = e.currentTarget.checked;
    if (name === "required") {
      setIsUpdatedItemRequired(key);
    }

    console.log({ name, key });
    setUpdatedItem((prevState) => ({
      ...prevState,
      [name]: key,
    }));
    console.log({ updatedItem });
  };

  const handleAlwaysVisibleCheckChange: React.ChangeEventHandler<
    HTMLInputElement
  > = (e) => {
    const isVisible = e.currentTarget.checked;
    setItemIsAlwaysVisible(isVisible);

    console.log({ isVisible });

    console.log({ updatedItem });

    setUpdatedItem((prevState) => ({
      ...prevState,
      alwaysVisible: isVisible,
    }));

    console.log({ updatedItem });
  };

  const onFormSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    editControlProperties(updatedItem as FormLayoutComponentChildrenType);
  };

  const onContainerFormSubmit: React.FormEventHandler<HTMLFormElement> = (
    event
  ) => {
    event.preventDefault();
    console.log({
      updatedItem,
    });
    editContainerProperties(updatedItem as FormLayoutComponentContainerType);
  };

  return (
    <>
      {selectedControl ? (
        <>
          {containerUpdatedItem.itemType === FormItemTypes.CONTAINER ? (
            <>
              <div className="main-form">
                <button
                  onClick={() => {
                    console.log({ updatedItem });
                  }}
                >
                  {" "}
                  CLICKME
                </button>
                <form
                  onSubmit={onContainerFormSubmit}
                  style={{ minWidth: "100%" }}
                >
                  <div className="main-form-title">
                    Edit Container Properties
                  </div>
                  <div>
                    <TextField
                      label="Container Heading"
                      name="heading"
                      value={containerUpdatedItem.heading}
                      onChange={handleChange}
                      style={textboxStyle}
                    />
                  </div>
                  <div>
                    <TextField
                      label="Container Sub-Heading"
                      name="subHeading"
                      value={containerUpdatedItem.subHeading}
                      onChange={handleChange}
                      style={textboxStyle}
                    />
                  </div>
                  <input
                    type="submit"
                    className="btn btn-light btn-shadow m-t-20 m-r-10"
                    value="Update Data"
                  />
                  <input
                    type="button"
                    className="btn btn-light btn-shadow m-t-20 m-l-0"
                    value="Cancel"
                    onClick={() => {
                      if (selectControl) {
                        selectControl(undefined);
                      }
                    }}
                  />
                  <div className="m-t-20 p-l-0">
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={itemIsAlwaysVisible}
                          name="alwaysVisible"
                          onChange={handleAlwaysVisibleCheckChange}
                        />
                      }
                      label="Always Visible"
                    />

                    <button onClick={() => console.log(selectedControlHeading)}>
                      Click MEEEEE
                    </button>

                    {!itemIsAlwaysVisible ? (
                      <FormControl fullWidth>
                        <InputLabel>Visible when control</InputLabel>
                        <Select
                          value={selectedControlHeading}
                          label="Age"
                          onChange={(e) =>
                            setSelectedControlHeading(e.target.value)
                          }
                        >
                          {controlDisplayNames.length === 0 ? (
                            <MenuItem value="">
                              <em>There are no controls in your form</em>
                            </MenuItem>
                          ) : null}
                          <MenuItem value="">
                            <em>Select a control</em>
                          </MenuItem>
                          {controlDisplayNames.map((controlHeading) => (
                            <MenuItem
                              key={controlHeading}
                              value={controlHeading}
                            >
                              {controlHeading}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : null}

                    <div className="my-4"></div>

                    {selectedControlHeading ? (
                      <FormControl fullWidth>
                        <InputLabel>On select of</InputLabel>
                        <Select
                          value={selectedControlOption}
                          label="control-options"
                          onChange={(e) =>
                            setSelectedControlOption(e.target.value)
                          }
                        >
                          {controlOptions.length === 0 ? (
                            <MenuItem value="">
                              <em>There are no controls in your form</em>
                            </MenuItem>
                          ) : null}
                          <MenuItem value="">
                            <em>Select an option</em>
                          </MenuItem>
                          {controlOptions.map((controlOption) => (
                            <MenuItem key={controlOption} value={controlOption}>
                              {controlOption}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : null}
                  </div>
                </form>
              </div>
            </>
          ) : (
            <>
              <div className="main-form">
                <form onSubmit={onFormSubmit} style={{ minWidth: "100%" }}>
                  <div className="main-form-title">Edit Field Properties</div>
                  <div>
                    <TextField
                      label="Field Label Name"
                      name="labelName"
                      value={childUpdatedItem.labelName}
                      onChange={handleChange}
                      style={textboxStyle}
                    />
                  </div>

                  {childUpdatedItem.controlName ===
                    FormControlNames.INPUTTEXTFIELD ||
                  childUpdatedItem.controlName ===
                    FormControlNames.INPUTMULTILINE ||
                  childUpdatedItem.controlName === FormControlNames.CHECKBOX ? (
                    <>
                      <div>
                        <TextField
                          label="Field Placeholder"
                          name="placeholder"
                          value={childUpdatedItem.placeholder}
                          onChange={handleChange}
                          style={textboxStyle}
                        />
                      </div>
                    </>
                  ) : (
                    ""
                  )}
                  <div>
                    <TextField
                      label="Field Description"
                      name="description"
                      value={childUpdatedItem.description}
                      onChange={handleChange}
                      multiline
                      style={textboxStyle}
                    />
                  </div>
                  <div className="m-t-20 p-l-0">
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isUpdatedItemRequired}
                          name="required"
                          onChange={handleCheckChange}
                        />
                      }
                      label="Required"
                    />
                  </div>
                  {childUpdatedItem.controlName ===
                    FormControlNames.RADIOGROUP ||
                  childUpdatedItem.controlName ===
                    FormControlNames.SELECTDROPDOWN ||
                  childUpdatedItem.controlName ===
                    FormControlNames.CHECKLIST ? (
                    <>
                      <h6>List Items</h6>
                      <ManageItemsListComponent
                        addItemInList={addItemInList}
                        editIteminList={editIteminList}
                        deleteItemFromList={deleteItemFromList}
                        items={childUpdatedItem.items}
                      />
                    </>
                  ) : null}

                  <input
                    type="submit"
                    className="btn btn-light btn-shadow m-t-20 m-r-10"
                    value="Update Data"
                  />
                  <input
                    type="button"
                    className="btn btn-light btn-shadow m-t-20 m-l-0"
                    value="Cancel"
                    onClick={() => {
                      if (selectControl) {
                        selectControl(undefined);
                      }
                    }}
                  />
                </form>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <h4>Edit Properties</h4>
          <div
            role="alert"
            className="m-t-30 alert alert-dark alert-dismissible"
          >
            <h4>Note!</h4>
            You need to select a container/control to edit properties.
          </div>
        </>
      )}
    </>
  );
};

export default EditPropertiesComponent;
