"use client";

import { FormWithQuestions, QuestionSelectModel } from "@shared";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form as FormComponent,
  FormControl,
  FormItem,
  FormLabel,
  FormField as ShadcdnFormField,
} from "@/components/ui/form";
import { ThemeChange } from "@/components/ui/ThemeChange";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { deleteForm } from "../actions/deleteForm";

import FormField from "./FormField";
import FormPublishSucces from "./FormPublishSucces";

type Props = {
  form: FormWithQuestions;
  editMode?: boolean;
};

const Form = ({ form: formData, editMode = false }: Props) => {
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [deletingForm, setDeletingForm] = useState(false);
  const [submittingForm, setSubmittingForm] = useState(false);

  const { name, description, questions, formID, id } = formData;
  const form = useForm();
  const router = useRouter();

  const onSubmit = async (data: Record<string, unknown>) => {
    if (editMode) {
      setSuccessDialogOpen(true);
      return;
    }

    setSubmittingForm(true);

    const answers = Object.entries(data).map(([questionId, value]) => {
      const idNumber = parseInt(questionId.replace("question_", ""), 10);

      if (typeof value === "string" && value.includes("answerId_")) {
        return {
          questionId: idNumber,
          fieldOptionsId: parseInt(value.replace("answerId_", ""), 10),
          value: null as string | null,
        };
      }

      return {
        questionId: idNumber,
        fieldOptionsId: null as number | null,
        value: typeof value === "string" ? value : null,
      };
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    try {
      const response = await fetch(`${baseUrl}/api/form/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ formId: formData.id, answers }),
      });

      if (response.ok) {
        router.push(`/forms/${formID}/success`);
      } else {
        console.error("Error submitting form", await response.text());
        alert("Error submitting form. Please try again later");
      }
    } catch (error) {
      console.error("Error submitting form", error);
      alert("Error submitting form. Please try again later");
    } finally {
      setSubmittingForm(false);
    }
  };

  const handleDialogChange = (open: boolean) => {
    setSuccessDialogOpen(open);
  };

  const handleDeleteForm = async () => {
    if (!editMode) {
      return;
    }

    try {
      setDeletingForm(true);
      await deleteForm({ id });
      router.push("/view-forms");
    } catch (error) {
      console.error("Failed to delete form", error);
    } finally {
      setDeletingForm(false);
    }
  };

  return (
    <div className="min-w-[320px] max-w-[620px] rounded-md border border-gray-100 bg-gray-400 bg-opacity-10 bg-clip-padding px-8 py-4 text-center backdrop-blur-md backdrop-filter md:min-w-[540px]">
      <div className="hidden">
        <ThemeChange />
      </div>
      <div className="flex items-center justify-center gap-2">
        <h1 className="text-red py-3 text-3xl font-semibold">{name}</h1>

        {editMode && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-inherit"
                  onClick={handleDeleteForm}
                  disabled={deletingForm}
                >
                  {deletingForm ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <Trash2 className="hover:text-red-900" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete this form</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {description && <h3 className="text-md italic">{description}</h3>}

      <FormComponent {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="my-4 grid w-full max-w-3xl items-center gap-6 text-left"
        >
          {questions.map((question: QuestionSelectModel, index: number) => (
            <ShadcdnFormField
              control={form.control}
              name={`question_${question.id}`}
              key={`${question.text}_${question.id}`}
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-around">
                    <FormLabel className="mr-3 mt-3 flex-1 text-base">
                      {index + 1}. {question.text}
                    </FormLabel>
                  </div>
                  <FormControl>
                    <FormField element={question} value={field.value} onChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          ))}

          <Button type="submit" disabled={submittingForm}>
            {editMode ? "Publish" : submittingForm ? "Submitting" : "Submit"}
          </Button>
        </form>
      </FormComponent>

      <FormPublishSucces
        formId={formID ?? ""}
        open={successDialogOpen}
        onOpenChange={handleDialogChange}
      />
    </div>
  );
};

export default Form;
