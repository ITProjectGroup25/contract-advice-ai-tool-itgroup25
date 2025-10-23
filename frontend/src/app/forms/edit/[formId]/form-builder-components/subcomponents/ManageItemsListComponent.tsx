import { Delete, Edit } from "@mui/icons-material";
import {
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  TextField,
} from "@mui/material";
import React, { FC, useEffect, useState } from "react";

import { FormLayoutComponentChildrenItemsType } from "../types/FormTemplateTypes";
import { generateID } from "../utils/common";

interface ManageItemsListComponentProps {
  items: FormLayoutComponentChildrenItemsType[] | undefined;
  addItemInList: (item: FormLayoutComponentChildrenItemsType) => void;
  deleteItemFromList: (item: FormLayoutComponentChildrenItemsType) => void;
  editIteminList: (item: FormLayoutComponentChildrenItemsType) => void;
}

const ManageItemsListComponent: FC<ManageItemsListComponentProps> = (props) => {
  const [editMode, setEditMode] = useState<boolean>(false);
  const [itemName, setItemName] = useState<string>("");
  const [editItemId, setEditItemId] = useState<
    FormLayoutComponentChildrenItemsType["id"] | undefined
  >(undefined);

  const { items, addItemInList, deleteItemFromList, editIteminList } = props;

  useEffect(() => {
    cancelEditing();
  }, [items]);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setItemName(event.target.value);
  };

  const changeToEditMode = (item: FormLayoutComponentChildrenItemsType) => {
    setItemName(item.label);
    setEditItemId(item.id);
    setEditMode(true);
  };

  const onSubmit: React.MouseEventHandler<HTMLInputElement> = () => {
    if (!itemName) {
      return;
    }

    const value = itemName.replace(" ", "__-");

    if (!editMode) {
      addItemInList({
        id: generateID(),
        value,
        label: itemName,
      });
      return;
    }

    if (editItemId === undefined) {
      return;
    }

    editIteminList({
      id: editItemId,
      value,
      label: itemName,
    });
  };

  const cancelEditing = () => {
    setEditMode(false);
    setItemName("");
    setEditItemId(undefined);
  };

  return (
    <>
      <div>
        <TextField
          label="Item Name"
          name="newItem"
          value={itemName}
          onChange={handleChange}
          style={{ minWidth: "100%" }}
        />
        <input
          className="btn btn-light btn-shadow m-t-20 m-r-10"
          value={editMode ? "Edit Item" : "Add Item"}
          type="button"
          onClick={onSubmit}
        />
        {editMode && (
          <input
            className="btn btn-light btn-shadow m-t-20 m-r-10"
            value="Cancel"
            type="button"
            onClick={cancelEditing}
          />
        )}
        <List component="nav">
          {items?.map((item) => {
            return (
              <ListItem key={item.value}>
                <ListItemText primary={item.label} />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => changeToEditMode(item)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => deleteItemFromList(item)} edge="end">
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
      </div>
    </>
  );
};

export default ManageItemsListComponent;
