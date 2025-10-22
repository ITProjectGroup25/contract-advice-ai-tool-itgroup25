import { FunctionComponent, useCallback } from "react";
import { useDrag } from "react-dnd";
import {
  FormLayoutComponentChildrenType,
  FormLayoutComponentContainerType,
  FormLayoutComponentsType,
} from "../types/FormTemplateTypes";

interface ControlDragComponentProps {
  handleItemAdded: (
    item: FormLayoutComponentChildrenType | FormLayoutComponentContainerType,
    containerId?: string
  ) => void;
  item: FormLayoutComponentChildrenType | FormLayoutComponentContainerType;
  formLayoutComponents: FormLayoutComponentsType[];
}

const ControlDragComponent: FunctionComponent<ControlDragComponentProps> = (props) => {
  const { item, handleItemAdded } = props;

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: item.itemType,
      item: item,
      end: (
        item: FormLayoutComponentChildrenType | FormLayoutComponentContainerType,
        monitor: any
      ) => {
        const dropResult: FormLayoutComponentContainerType = monitor.getDropResult();
        if (item && dropResult) {
          if (item.itemType === "container") {
            handleItemAdded(item);
          } else if (item.itemType === "control") {
            handleItemAdded(item, dropResult.id);
          }
        }
      },
      collect: (monitor: any) => ({
        isDragging: monitor.isDragging(),
        handlerId: monitor.getHandlerId(),
      }),
    }),
    [props.formLayoutComponents]
  ); // Need to add this dependency for dragging elements.
  const opacity = isDragging ? 0.4 : 1;

  const setDragRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node) {
        drag(node);
      }
    },
    [drag]
  );

  return (
    <>
      <div
        ref={setDragRef}
        style={{ opacity, cursor: "move" }}
        className="d-flex align-items-center justify-content-center btn btn-light btn-shadow w-100 my-2"
      >
        <span style={{ height: "100%", marginRight: "9px", fontSize: "1.2rem" }}>
          <i className={item.icon}></i>
        </span>
        {item.displayText}
      </div>
    </>
  );
};

export default ControlDragComponent;
