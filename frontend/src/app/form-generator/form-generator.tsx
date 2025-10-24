"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { toast } from "sonner";

import { navigate } from "@/actions/navigateToForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { createNewForm } from "../actions/createNewForm";

const initialState: {
  message: string;
  data?: any;
} = {
  message: "",
};

export function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating..." : "Create Form"}
    </Button>
  );
}

const FormGenerator = () => {
  const [state, formAction] = useFormState(createNewForm, initialState);
  const [open, setOpen] = useState(false);
  const _session = useSession();

  useEffect(() => {
    console.log("State", state);
    if (state?.message == "success") {
      toast.success("Form created successfully!");
      setOpen(false);
      navigate(String(state.data.formId));
    } else if (state?.message && state?.message !== "") {
      // Show error message if there's a failure
      toast.error(state.message || "Failed to create form. Please try again.");
    }
    console.log(state?.data);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Form</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Form</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="grid gap-4 py-4">
          <Input id="formName" name="formName" required placeholder="Form Name" />
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
export default FormGenerator;
