'use client';

import { useState, useEffect } from "react";
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

type AppState = 'form' | 'simple-response' | 'success' | 'admin' | 'chatbot';

export default function App() {
  const [currentState, setCurrentState] = useState<AppState>('form');
  const [questions, setQuestions] = useState<Question[]>(defaultQuestions);
  const [sections, setSections] = useState<FormSection[]>(defaultSections);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [successPageType, setSuccessPageType] = useState<'complex' | 'simple-escalated'>('complex');
  const [currentSubmissionId, setCurrentSubmissionId] = useState<string | undefined>();

  // Check EmailJS on app start
  useEffect(() => {
    console.log('[EmailJS] App started, checking EmailJS availability...');
    const checkEmailJS = () => {
      const emailjs = (window as any).emailjs;
      const emailJSReady = (window as any).emailJSReady;
      console.log('[EmailJS] EmailJS check:', {
        available: typeof emailjs !== 'undefined',
        methods: emailjs ? Object.keys(emailjs) : null,
        emailJSReady: emailJSReady,
        hasInit: emailjs && typeof emailjs.init === 'function',
        hasSend: emailjs && typeof emailjs.send === 'function'
      });
    };
    
    // Check immediately
    checkEmailJS();
    
    // Check periodically for more detailed monitoring
    const intervals = [500, 1000, 2000, 5000];
    intervals.forEach(delay => {
      setTimeout(checkEmailJS, delay);
    });
  }, []);

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
    <div
      className={`min-h-screen ${
        currentState === "admin" ? "bg-white" : "bg-gray-900"
      }`}
    >
      {/* Admin Panel Access - Only show on form page */}
      {currentState === 'form' && (
        <div className="fixed top-4 right-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGoToAdmin}
            className="flex items-center gap-2 bg-gray-900 border border-white text-white hover:bg-gray-800"
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





