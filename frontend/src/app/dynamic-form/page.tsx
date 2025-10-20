"use client";

import { DynamicFormRenderer } from "@/components/dynamic-form/DynamicFormRenderer";
import { defaultQuestions, defaultSections } from "@shared";
import { useState } from "react";
import { toast } from "sonner";

type AppState = "form" | "simple-response" | "success";

export default function DynamicFormPage() {
  const [currentState, setCurrentState] = useState<AppState>("form");
  const [successPageType, setSuccessPageType] = useState<
    "complex" | "simple-escalated"
  >("complex");
  const [currentSubmissionId, setCurrentSubmissionId] = useState<
    string | undefined
  >();

  const handleSimpleQuerySuccess = (submissionId?: string) => {
    setCurrentSubmissionId(submissionId);
    setCurrentState("simple-response");
    toast.success(
      "Simple request submitted successfully! You will receive a response shortly."
    );
  };

  const handleComplexQuerySuccess = () => {
    setSuccessPageType("complex");
    setCurrentState("success");
    toast.success(
      "Complex request submitted successfully! Our team will review and contact you."
    );
  };

  const handleBackToForm = () => {
    setCurrentSubmissionId(undefined);
    setCurrentState("form");
  };

  const renderCurrentView = () => {
    switch (currentState) {
      case "simple-response":
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="max-w-md mx-auto text-center">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
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
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Simple Request Submitted
                </h2>
                <p className="text-gray-600 mb-6">
                  Your simple request has been submitted successfully. You
                  should receive a response within 24 hours.
                </p>
                {currentSubmissionId && (
                  <p className="text-sm text-gray-500 mb-4">
                    Reference ID: {currentSubmissionId}
                  </p>
                )}
                <button
                  onClick={handleBackToForm}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md"
                >
                  Submit Another Request
                </button>
              </div>
            </div>
          </div>
        );

      case "success":
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="max-w-md mx-auto text-center">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-blue-600"
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
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  {successPageType === "complex"
                    ? "Complex Request Submitted"
                    : "Request Escalated"}
                </h2>
                <p className="text-gray-600 mb-6">
                  {successPageType === "complex"
                    ? "Your complex request has been submitted to our team. We will review your request and contact you within 2-3 business days."
                    : "Your request has been escalated to our human experts. We will contact you within 1-2 business days."}
                </p>
                <button
                  onClick={handleBackToForm}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md"
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
