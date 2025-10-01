"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { deleteForm } from "../actions/deleteForm";
import { getUserForms } from "../actions/getUserForms";

type Form = Awaited<ReturnType<typeof getUserForms>>[number];

type Props = {
  forms: Form[];
};

const FormList = (props: Props) => {
  const { forms } = props;
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [formToDelete, setFormToDelete] = useState<Form | null>(null);
  const [isDeleting, startTransition] = useTransition();

  useEffect(() => {
    const currentPath = window.location.pathname;
    const reloadKey = `hasReloaded_${currentPath}`;
    const hasReloaded = sessionStorage.getItem(reloadKey);

    if (!hasReloaded) {
      sessionStorage.setItem(reloadKey, "true");
      setTimeout(() => {
        window.location.reload();
      }, 1);
    }
  }, []);

  const handleDeleteClick = (form: Form, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFormToDelete(form);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (!formToDelete) return;

    startTransition(async () => {
      const result = await deleteForm({ id: formToDelete.id });
      setOpenDeleteDialog(false);
      setFormToDelete(null);

      if (result.message === "success") {
        // Refresh the page to show updated list
        window.location.reload();
      } else {
        // You might want to show an error toast here
        console.error("Failed to delete form");
      }
    });
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setFormToDelete(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-3 m-5 p-4 gap-4">
        {forms.map((form: Form) => (
          <Card
            key={form.id}
            className="max-w-[350px] flex flex-col justify-center relative"
          >
            {/* Delete Button */}
            <button
              onClick={(e) => handleDeleteClick(form, e)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-red-50 transition-colors group"
              disabled={isDeleting}
            >
              <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-600" />
            </button>

            <CardHeader>
              <CardTitle className="font-normal pr-8">{form.name}</CardTitle>
              <CardDescription>{form.description}</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Link className="w-1/2" href={`/forms/edit/${form.id}`}>
                <div className="flex justify-center">
                  <Button className="w-1/2">View</Button>
                </div>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
      {/* Delete Confirmation Dialog */}
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
            Are you sure you want to delete "{formToDelete?.name}"? This action
            cannot be undone and will delete all associated form data.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDeleteCancel}
            variant="ghost"
            className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="destructive"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>{" "}
    </>
  );
};

export default FormList;
