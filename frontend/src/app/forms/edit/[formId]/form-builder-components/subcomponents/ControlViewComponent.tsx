import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Switch,
  TextField,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import type { Identifier } from "dnd-core";
import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";

import { FormLayoutComponentChildrenType } from "../types/FormTemplateTypes";
import { FormControlNames, FormItemTypes } from "../utils/formBuilderUtils";

const selectedColor = "var(--primary)";
const nonSelectedColor = "rgba(0,0,0,0.1)";
const _dateFormat = "yyyy, MMM dd";

const renderItem = (item: FormLayoutComponentChildrenType) => {
  switch (item.controlName) {
    case FormControlNames.INPUTTEXTFIELD:
      return (
        <>
          <TextField
            type={item.dataType}
            fullWidth={true}
            placeholder={item.placeholder}
            disabled
            variant="outlined"
          />
        </>
      );

    case FormControlNames.INPUTMULTILINE:
      return (
        <>
          <TextField
            type={item.dataType}
            fullWidth={true}
            multiline={true}
            minRows={item.rows}
            placeholder={item.placeholder}
            disabled
            variant="outlined"
          />
        </>
      );
    case FormControlNames.CHECKBOX:
      return (
        <>
          <div className="m-t-20 p-l-0">
            <FormControlLabel
              control={<Checkbox disabled />}
              style={{ marginLeft: "0px" }}
              label={item.placeholder}
            />
          </div>
        </>
      );

    case FormControlNames.RADIOGROUP:
      return (
        <>
          <FormControl>
            {/* <FormLabel>{item.labelName + (item.required?" *":"")}</FormLabel> */}
            <RadioGroup name={item.controlName + item.id} row>
              {item.items?.map((i) => (
                <FormControlLabel
                  value={i.value}
                  key={i.value}
                  control={<Radio />}
                  label={i.label}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </>
      );

    case FormControlNames.SELECTDROPDOWN:
      return (
        <>
          <FormControl style={{ minWidth: "100%" }}>
            {/* <InputLabel>{item.labelName + (item.required?" *":"")}</InputLabel> */}
            <Select variant="outlined" disabled value={item.items && item.items[0].value}>
              {item.items?.map((i, _ind) => (
                <MenuItem key={i.value} value={i.value}>
                  {i.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </>
      );

    case FormControlNames.DATEFIELD:
      return (
        <>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <DatePicker slotProps={{ textField: { fullWidth: true } }} disabled />
          </LocalizationProvider>
        </>
      );

    case FormControlNames.TIMEFIELD:
      return (
        <>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <TimePicker disabled slotProps={{ textField: { fullWidth: true } }} />
          </LocalizationProvider>
        </>
      );

    case FormControlNames.FILEUPLOAD:
      return (
        <>
          <input style={{ display: "none" }} id={item.controlName + item.id} type="file" />
          <label
            className="control-input-trigger-buttons"
            htmlFor={item.controlName + item.id}
            aria-label={item.placeholder || "Upload file"}
          >
            <i className="fas fa-cloud-upload-alt" aria-hidden="true"></i>
          </label>
        </>
      );

    case FormControlNames.IMAGEUPLOAD:
      return (
        <>
          <input style={{ display: "none" }} id={item.controlName + item.id} type="file" />
          <label
            className="control-input-trigger-buttons"
            htmlFor={item.controlName + item.id}
            aria-label={item.placeholder || "Upload image"}
          >
            <i className="far fa-image" aria-hidden="true"></i>
          </label>
        </>
      );

    case FormControlNames.SCANCODE:
      return (
        <>
          <input style={{ display: "none" }} id={item.controlName + item.id} type="file" />
          <label
            className="control-input-trigger-buttons"
            htmlFor={item.controlName + item.id}
            aria-label={item.placeholder || "Scan code"}
          >
            <i className="fas fa-qrcode" aria-hidden="true"></i>
          </label>
        </>
      );

    case FormControlNames.SIGNATURE:
      // 原先是 <label htmlFor=...> 但没有对应 input，会触发 a11y 警告。这里用 button 作为占位交互元素。
      return (
        <>
          <button
            type="button"
            className="control-input-trigger-buttons"
            style={{ width: "270px" }}
            aria-label={item.placeholder || "Open signature pad"}
            // onClick={...}  // 以后接入签名面板时在这里处理
          >
            <span className="sign-label">Sign Here</span>
          </button>
        </>
      );

    case FormControlNames.TOGGLE:
      return (
        <>
          <Switch checked={true} />
        </>
      );

    case FormControlNames.CHECKLIST:
      return (
        <>
          <FormGroup>
            {item.items?.map((i, _ind) => (
              <FormControlLabel
                key={i.value}
                control={<Checkbox />}
                label={i.label}
                style={{ marginLeft: "0px" }}
              />
            ))}
          </FormGroup>
        </>
      );
  }
};

interface ControlViewComponentProps {
  item: any;
  deleteControl: (itemId: string, containerId: string) => void;
  containerId: string;
  selectControl: (item: FormLayoutComponentChildrenType) => void;
  selectedControl: any;
  index: number;
  moveControl: (
    item: FormLayoutComponentChildrenType,
    dragIndex: number,
    hoverIndex: number,
    containerId: string
  ) => void;
}

function ControlViewComponent(props: ControlViewComponentProps) {
  const { item, deleteControl, containerId, selectControl, selectedControl, index, moveControl } =
    props;

  let _colBackgroundcolor = nonSelectedColor;
  let _color = "";
  const wrapperStyle: React.CSSProperties = {
    border: "1px solid " + nonSelectedColor,
    borderRadius: "9px",
    marginBottom: "20px",
    backgroundColor: "white",
    cursor: "pointer",
    boxShadow: "0 9px 90px #efefef",
  };

  const isSelected =
    selectedControl && item.id === selectedControl.id && item.type === selectedControl.type;

  // Check if its the same type and id to change color.
  if (isSelected) {
    wrapperStyle.border = "2px solid " + selectedColor;
    _colBackgroundcolor = selectedColor;
    _color = "white";
  }

  const handleDeleteControl: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    deleteControl(item.id, containerId);
    if (event.stopPropagation) event.stopPropagation();
  };

  const handleKeyDownSelect: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectControl(item);
    }
  };

  // Drag & Sort Code for functionality

  const ref = useRef<HTMLDivElement>(null);
  const [{ handlerId: _handlerId }, drop] = useDrop<
    FormLayoutComponentChildrenType,
    void,
    { handlerId: Identifier | null }
  >({
    accept: FormItemTypes.CONTROL,
    collect(monitor: any) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: FormLayoutComponentChildrenType, monitor: any) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      if (dragIndex && dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex && dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      moveControl(item, dragIndex as number, hoverIndex, containerId);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, _preview] = useDrag({
    type: FormItemTypes.CONTROL,
    item: () => {
      return { ...item, index };
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));

  return (
    <>
      <div
        ref={ref}
        className="row w-100 align-items-stretch justify-content-end"
        onClick={() => selectControl(item)}
        onKeyDown={handleKeyDownSelect}
        role="button"
        tabIndex={0}
        aria-pressed={!!isSelected}
        style={{ ...wrapperStyle, opacity }}
      >
        <div className="col-12 p-20">
          <div className="d-flex align-items-center justify-content-between">
            <h5>{item.labelName + (item.required ? " *" : "")}</h5>
            <div className="control-actions">
              <span style={{ cursor: "grab" }} aria-hidden="true">
                <i className="fa fa-ellipsis-v" aria-hidden="true"></i>
                <i className="fa fa-ellipsis-v" aria-hidden="true"></i>
              </span>
              <button
                type="button"
                onClick={handleDeleteControl}
                className="unstyled-button"
                aria-label="Delete control"
              >
                <i className="fa fa-trash" aria-hidden="true"></i>
              </button>
            </div>
          </div>
          {item.description !== "" ? (
            <>
              <div className="mt-2">
                <p>{item.description}</p>
              </div>
            </>
          ) : null}
          <div className="mt-3">{renderItem(item)}</div>
        </div>
      </div>
    </>
  );
}

export default ControlViewComponent;
