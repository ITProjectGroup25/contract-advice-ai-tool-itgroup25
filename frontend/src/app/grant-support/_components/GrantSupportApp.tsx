"use client";

import { useState } from "react";
import { ChatBot } from "./ChatBot";
import { SuccessPage } from "./SuccessPage";
import { SimpleQueryResponse } from "./SimpleQueryResponse";
import { AdminInterface, Question, FormSection } from "./AdminInterface";
import { DynamicFormRenderer } from "./DynamicFormRenderer";
import { PasswordDialog } from "./PasswordDialog";
import { Button } from "./ui/button";
import { Toaster } from "./ui/sonner";
import { Settings } from "lucide-react";
import { defaultQuestions, defaultSections } from "../_data/defaultQuestions";

type AppState = 'form' | 'simple-response' | 'success' | 'admin';

export default function GrantSupportApp() {
  const [currentState, setCurrentState] = useState<AppState>('form');
  const [questions, setQuestions] = useState<Question[]>(defaultQuestions);
  const [sections, setSections] = useState<FormSection[]>(defaultSections);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [successPageType, setSuccessPageType] = useState<'complex' | 'simple-escalated'>('complex');
  const [currentSubmissionId, setCurrentSubmissionId] = useState<string | undefined>();

  const handleSimpleQuerySuccess = (submissionId?: string) => {
    setCurrentSubmissionId(submissionId);
    setCurrentState('simple-response');
  };

  const handleComplexQuerySuccess = () => {
    setSuccessPageType('complex');
    setCurrentState('success');
  };

  const handleSimpleQuerySatisfied = () => {
    setCurrentSubmissionId(undefined);
    setCurrentState('form');
  };

  const handleSimpleQueryNeedHelp = () => {
    setSuccessPageType('simple-escalated');
    setCurrentState('success');
  };

  const handleBackToForm = () => {
    setCurrentSubmissionId(undefined);
    setCurrentState('form');
  };

  const handleGoToAdmin = () => {
    setShowPasswordDialog(true);
  };

  const handlePasswordSuccess = () => {
    setCurrentState('admin');
  };

  const handlePasswordDialogClose = () => {
    setShowPasswordDialog(false);
  };

  const handleBackFromAdmin = () => {
    setCurrentState('form');
  };

  const handleQuestionsUpdate = (updatedQuestions: Question[]) => {
    setQuestions(updatedQuestions);
  };

  const handleSectionsUpdate = (updatedSections: FormSection[]) => {
    setSections(updatedSections);
  };

  const renderCurrentView = () => {
    switch (currentState) {
      case 'chatbot':
        return <ChatBot onBack={handleBackToForm} />;
      case 'simple-response':
        return (
          <SimpleQueryResponse 
            onBack={handleBackToForm} 
            onSatisfied={handleSimpleQuerySatisfied}
            onNeedHumanHelp={handleSimpleQueryNeedHelp}
            submissionId={currentSubmissionId}
          />
        );
      case 'success':
        return <SuccessPage onBack={handleBackToForm} type={successPageType} />;
      case 'admin':
        return (
          <AdminInterface
            onBack={handleBackFromAdmin}
            questions={questions}
            sections={sections}
            onQuestionsUpdate={handleQuestionsUpdate}
            onSectionsUpdate={handleSectionsUpdate}
          />
        );
      default:
        return (
          <DynamicFormRenderer
            questions={questions}
            sections={sections}
            onSimpleQuerySuccess={handleSimpleQuerySuccess}
            onComplexQuerySuccess={handleComplexQuerySuccess}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Panel Access - Only show on form page */}
      {currentState === 'form' && (
        <div className="fixed top-4 right-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGoToAdmin}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Admin Panel
          </Button>
        </div>
      )}
      
      {renderCurrentView()}
      
      {/* Password Dialog */}
      <PasswordDialog
        open={showPasswordDialog}
        onClose={handlePasswordDialogClose}
        onSuccess={handlePasswordSuccess}
      />
      
      <Toaster />
    </div>
  );
}









