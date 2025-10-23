"use client";

import { Link2Icon, CopyIcon } from "@radix-ui/react-icons";
import React from "react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

type Props = {
  formId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const FormPublishSucces = (props: Props) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(`${baseUrl}/forms/${props.formId}`)
      .then(() => {
        toast({
          description: "Link Copied To Clipboard!",
        });
      })
      .catch((error) => alert("Failed to copy!"));
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Your Form Has Been Published Successfully!</DialogTitle>
          <DialogDescription>
            Your Form is now live and ready to be filled out by your users. You can now share your
            form using the link below.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col">
          <p>Copy Link</p>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 rounded-md">
          <Link2Icon className="mr-2 h-5 w-5" />
          <input
            className="w-full rounded-md border-2 border-gray-200 bg-transparent px-2 outline-none"
            type="text"
            placeholder="link"
            disabled
            value={`${baseUrl}/forms/${props.formId}`}
          />{" "}
          <DialogClose asChild className="hover:cursor-pointer">
            <CopyIcon onClick={copyToClipboard} className="h-6 w-6" />
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FormPublishSucces;
