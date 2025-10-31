"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminInterface } from "./AdminInterface";
import { DynamicFormRenderer } from "./DynamicFormRenderer/DynamicFormRenderer";
import { PasswordDialog } from "./PasswordDialog";
import { SimpleQueryResponse } from "./SimpleQueryResponse";
import { SuccessPage } from "./SuccessPage";
import { Form, FormSectionsType } from "./types";
import { Button } from "./ui/button";
import { Toaster } from "./ui/sonner";
import { prefetchFaqs } from "./chatbot/useGetFaq";

type AppState = "form" | "simple-response" | "success" | "admin";

type Props = {
  form: Form;
  formId: number;
};

export default function App({ form, formId }: Props) {
  const queryClient = useQueryClient();

  const { formSections: sections } = form;
  const [currentState, setCurrentState] = useState<AppState>("form");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [successPageType, setSuccessPageType] = useState<"complex" | "simple-escalated">("complex");
  const [currentSubmissionId, setCurrentSubmissionId] = useState<string | undefined>();

  useEffect(() => {
    console.log("[EmailJS] App started, checking EmailJS availability...");
    const checkEmailJS = () => {
      const emailjs = (window as any).emailjs;
      const emailJSReady = (window as any).emailJSReady;
      console.log("[EmailJS] EmailJS check:", {
        available: typeof emailjs !== "undefined",
        methods: emailjs ? Object.keys(emailjs) : null,
        emailJSReady: emailJSReady,
        hasInit: emailjs && typeof emailjs.init === "function",
        hasSend: emailjs && typeof emailjs.send === "function",
      });
    };

    checkEmailJS();

    const intervals = [500, 1000, 2000, 5000];
    intervals.forEach((delay) => {
      setTimeout(checkEmailJS, delay);
    });
  }, []);

  useEffect(() => {
    if (!formId) {
      return;
    }

    prefetchFaqs(queryClient, formId)
      .then(() => {
        console.debug("[GrantSupportApp] FAQs prefetched for form", { formId });
      })
      .catch((error: unknown) => {
        console.warn("[GrantSupportApp] Failed to prefetch FAQs", error);
      });
  }, [formId, queryClient]);

  const handleSimpleQuerySuccess = (submissionId?: string) => {
    setCurrentSubmissionId(submissionId);
    setCurrentState("simple-response");
  };

  const handleComplexQuerySuccess = () => {
    setSuccessPageType("complex");
    setCurrentState("success");
  };

  const handleSimpleQuerySatisfied = () => {
    setCurrentSubmissionId(undefined);
    setCurrentState("form");
  };

  const handleSimpleQueryNeedHelp = () => {
    setSuccessPageType("simple-escalated");
    setCurrentState("success");
  };

  const handleBackToForm = () => {
    setCurrentSubmissionId(undefined);
    setCurrentState("form");
  };

  const handleGoToAdmin = () => {
    setShowPasswordDialog(true);
  };

  const handlePasswordSuccess = () => {
    setCurrentState("admin");
  };

  const handlePasswordDialogClose = () => {
    setShowPasswordDialog(false);
  };

  const handleBackFromAdmin = () => {
    setCurrentState("form");
  };

  const handleSectionsUpdate = (updatedSections: FormSectionsType) => {
    queryClient.invalidateQueries({ queryKey: ["form", formId] });
  };

  const renderCurrentView = () => {
    switch (currentState) {
      case "simple-response":
        return (
          <SimpleQueryResponse
            onBack={handleBackToForm}
            onSatisfied={handleSimpleQuerySatisfied}
            onNeedHumanHelp={handleSimpleQueryNeedHelp}
            submissionId={currentSubmissionId}
            formId={formId}
          />
        );
      case "success":
        return <SuccessPage onBack={handleBackToForm} type={successPageType} />;
      case "admin":
        return (
          <AdminInterface
            onBack={handleBackFromAdmin}
            sections={sections!}
            formId={formId!}
            onSectionsUpdate={handleSectionsUpdate}
          />
        );
      default:
        return (
          <DynamicFormRenderer
            title={form.title!}
            sections={sections!}
            onSimpleQuerySuccess={handleSimpleQuerySuccess}
            onComplexQuerySuccess={handleComplexQuerySuccess}
          />
        );
    }
  };

  return (
    <div className={`min-h-screen ${currentState === "admin" ? "bg-white" : "bg-green-100"}`}>
      {currentState === "form" && (
        <div className="fixed right-4 top-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGoToAdmin}
            className="flex items-center gap-2 border border-white bg-green-700 text-white hover:bg-green-600"
          >
            <Settings className="h-4 w-4" />
            Admin Panel
          </Button>
        </div>
      )}

      {renderCurrentView()}

      <PasswordDialog
        open={showPasswordDialog}
        onClose={handlePasswordDialogClose}
        onSuccess={handlePasswordSuccess}
      />

      <Toaster />
    </div>
  );
}
