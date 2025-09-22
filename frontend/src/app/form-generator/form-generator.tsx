"use client";

import { navigate } from "@/actions/navigateToForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";

import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import { createNewForm } from "../actions/createNewForm";

type Props = {};

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

const FormGenerator = (props: Props) => {
  const [state, formAction] = useFormState(createNewForm, initialState);
  const [open, setOpen] = useState(false);
  const session = useSession();

  useEffect(() => {
    console.log("State", state);
    if (state?.message == "success") {
      setOpen(false);
      navigate(state.data.formId);
      // navigate(state.data.formId, "Additional value i am passing");
    }
    console.log(state?.data);
  }, [state?.message]);

  const onFormCreate = () => {
    setOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={onFormCreate}>Create Form</Button>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Form</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="grid gap-4 py-4">
          <Input
            id="formName"
            name="formName"
            required
            placeholder="Form Name"
          />
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
export default FormGenerator;
