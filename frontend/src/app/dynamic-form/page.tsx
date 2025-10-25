"use client";

import { DynamicFormRenderer } from "@/components/dynamic-form/DynamicFormRenderer";
import { defaultQuestions, defaultSections } from "@shared";
import { useState } from "react";
import { toast } from "sonner";

type AppState = "form" | "simple-response" | "success";

export default function DynamicFormPage() {
  const [currentState, setCurrentState] = useState<AppState>("form");
  const [successPageType, setSuccessPageType] = useState<"complex" | "simple-escalated">("complex");
  const [currentSubmissionId, setCurrentSubmissionId] = useState<string | undefined>();

  const handleSimpleQuerySuccess = (submissionId?: string) => {
    setCurrentSubmissionId(submissionId);
    setCurrentState("simple-response");
    toast.success("Simple request submitted successfully! You will receive a response shortly.");
  };

  const handleComplexQuerySuccess = () => {
    setSuccessPageType("complex");
    setCurrentState("success");
    toast.success("Complex request submitted successfully! Our team will review and contact you.");
  };

  const handleBackToForm = () => {
    setCurrentSubmissionId(undefined);
    setCurrentState("form");
  };

  const renderCurrentView = () => {
    switch (currentState) {
      case "simple-response":
        return (
          <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
            <div className="mx-auto max-w-md text-center">
              <div className="rounded-lg bg-white p-8 shadow-lg">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <svg
                    className="h-8 w-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="mb-2 text-2xl font-semibold text-gray-900">
                  Simple Request Submitted
                </h2>
                <p className="mb-6 text-gray-600">
                  Your simple request has been submitted successfully. You should receive a response
                  within 24 hours.
                </p>
                {currentSubmissionId && (
                  <p className="mb-4 text-sm text-gray-500">Reference ID: {currentSubmissionId}</p>
                )}
                <button
                  onClick={handleBackToForm}
                  className="rounded-md bg-green-600 px-6 py-2 text-white hover:bg-green-700"
                >
                  Submit Another Request
                </button>
              </div>
            </div>
          </div>
        );

      case "success":
        return (
          <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
            <div className="mx-auto max-w-md text-center">
              <div className="rounded-lg bg-white p-8 shadow-lg">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <svg
                    className="h-8 w-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="mb-2 text-2xl font-semibold text-gray-900">
                  {successPageType === "complex"
                    ? "Complex Request Submitted"
                    : "Request Escalated"}
                </h2>
                <p className="mb-6 text-gray-600">
                  {successPageType === "complex"
                    ? "Your complex request has been submitted to our team. We will review your request and contact you within 2-3 business days."
                    : "Your request has been escalated to our human experts. We will contact you within 1-2 business days."}
                </p>
                <button
                  onClick={handleBackToForm}
                  className="rounded-md bg-green-600 px-6 py-2 text-white hover:bg-green-700"
                >
                  Submit Another Request
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <DynamicFormRenderer
            questions={defaultQuestions}
            sections={defaultSections}
            onSimpleQuerySuccess={handleSimpleQuerySuccess}
            onComplexQuerySuccess={handleComplexQuerySuccess}
          />
        );
    }
  };

  return renderCurrentView();
}
