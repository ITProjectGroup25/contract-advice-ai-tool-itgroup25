import { Button } from "@mui/material";
import React, { FunctionComponent, useCallback } from "react";
import { useDrop } from "react-dnd";
import { FormContainerList, FormItemTypes } from "../utils/formBuilderUtils";
import ControlViewComponent from "./ControlViewComponent";
import "./styles.scss";
import {
  FormLayoutComponentChildrenType,
  FormLayoutComponentContainerType,
} from "../types/FormTemplateTypes";

interface DropContainerComponentProps {
  accept: string;
  name?: string;
  index?: number;
  handleItemAdded?: (
    item: FormLayoutComponentChildrenType | FormLayoutComponentContainerType,
    containerId?: string
  ) => void;
  layout?: FormLayoutComponentChildrenType | FormLayoutComponentContainerType;
  selectedControl?: null | FormLayoutComponentChildrenType | FormLayoutComponentContainerType;
  childrenComponents?: FormLayoutComponentChildrenType[];
  deleteContainer?: (containerId: string) => void;
  deleteControl?: (controlId: string, containerId: string) => void;
  selectControl?: (
    layout: FormLayoutComponentChildrenType | FormLayoutComponentContainerType | undefined
  ) => void;
  moveControl?: (
    item: FormLayoutComponentChildrenType,
    dragIndex: number,
    hoverIndex: number,
    containerId: string
  ) => void;
}

const DropContainerComponent: FunctionComponent<DropContainerComponentProps> = (props) => {
  const {
    accept,
    layout,
    childrenComponents,
    index,
    deleteContainer,
    deleteControl,
    selectControl,
    selectedControl,
    handleItemAdded,
    moveControl,
  } = props;

  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: accept,
    drop: () => layout,
    collect: (monitor: any) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  const setDropRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node) {
        drop(node);
      }
    },
    [drop]
  );

  const isActive = canDrop && isOver;
  let backgroundColor =
    accept && accept === FormItemTypes.CONTROL ? "rgba(0,0,0,0)" : "rgba(0,0,0,0.1)";
  let borderColor = "rgba(0,0,0,0.1)";
  const borderBase = "1px solid";
  let border;
  if (isActive) {
    backgroundColor = "rgba(46,212,182,0.4)";
  } else if (canDrop) {
    backgroundColor = "rgba(255,178,15,0.7)";
  }

  if (accept === FormItemTypes.CONTROL) {
    border = `${borderBase} ${borderColor}`;
  }

  // Change border Color
  if (
    selectedControl &&
    selectedControl.itemType === layout?.itemType &&
    selectedControl.id === layout.id
  ) {
    borderColor = "rgb(255, 193, 7)";
    border = `${borderBase} ${borderColor}`;
  }

  const handleDeleteContainer: React.MouseEventHandler<HTMLSpanElement> = (event) => {
    if (deleteContainer) {
      deleteContainer(layout?.id as string);
    }
    if (event.stopPropagation) event.stopPropagation();
  };

  return (
    <div
      className="col-12 container-drop"
      ref={setDropRef}
      style={{ backgroundColor, borderRadius: "9px", border }}
    >
      {accept === FormItemTypes.CONTAINER ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "90px" }}
        >
          <Button
            onClick={() => {
              if (handleItemAdded) {
                handleItemAdded({ ...FormContainerList[0] });
              }
            }}
          >
            <span style={{ marginRight: "9px" }}>
              <i className="fa fa-plus"></i>
            </span>
            <span>Add a workflow step</span>
          </Button>
        </div>
      ) : null}

      {accept === FormItemTypes.CONTROL ? (
        <>
          <div
            onClick={() => {
              if (selectControl) {
                selectControl(layout);
              }
            }}
            className="container-header d-flex justify-content-between mb-3 py-3"
            style={{
              borderBottom: "1px solid rgba(0,0,0,0.1)",
              cursor: "pointer",
            }}
          >
            <h5>Step {(index as number) + 1}</h5>
            <div className="container-actions" style={{ fontSize: "1.1rem" }}>
              <span style={{ cursor: "grab" }}>
                <i className="fa fa-ellipsis-v"></i>
                <i className="fa fa-ellipsis-v"></i>
              </span>
              <span onClick={handleDeleteContainer}>
                <i className="fa fa-trash"></i>
              </span>
            </div>
          </div>
          <h4>{(layout as FormLayoutComponentContainerType)?.heading}</h4>
          <p>{(layout as FormLayoutComponentContainerType)?.subHeading}</p>
          <div
            className="d-flex flex-column justify-content-center align-items-center"
            style={{ minHeight: "20vh", position: "relative" }}
          >
            {childrenComponents?.length === 0 ? (
              <div>
                <span style={{ marginRight: "9px" }}>
                  <i className="fa fa-plus"></i>
                </span>
                <span>Drop Field</span>
              </div>
            ) : (
              childrenComponents?.map((component, ind) => (
                <ControlViewComponent
                  key={component.id}
                  item={component}
                  deleteControl={(controlId, containerId) => {
                    if (deleteControl) {
                      deleteControl(controlId, containerId);
                    }
                  }}
                  selectControl={(currentLayout) => {
                    if (selectControl) {
                      selectControl(currentLayout);
                    }
                  }}
                  selectedControl={selectedControl}
                  containerId={layout?.id as string}
                  index={ind}
                  moveControl={(item, dragIndex, hoverIndex, containerId) => {
                    if (moveControl) {
                      moveControl(item, dragIndex, hoverIndex, containerId);
                    }
                  }}
                />
              ))
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default DropContainerComponent;
