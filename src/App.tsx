import { useState } from "react";
import { ChatBot } from "./components/ChatBot";
import { SuccessPage } from "./components/SuccessPage";
import { AdminInterface, Question, FormSection } from "./components/AdminInterface";
import { DynamicFormRenderer } from "./components/DynamicFormRenderer";
import { PasswordDialog } from "./components/PasswordDialog";
import { Button } from "./components/ui/button";
import { Toaster } from "./components/ui/sonner";
import { Settings } from "lucide-react";
import { defaultQuestions, defaultSections } from "./data/defaultQuestions";

type AppState = 'form' | 'chatbot' | 'success' | 'admin';

export default function App() {
  const [currentState, setCurrentState] = useState<AppState>('form');
  const [questions, setQuestions] = useState<Question[]>(defaultQuestions);
  const [sections, setSections] = useState<FormSection[]>(defaultSections);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  const handleSimpleQuerySuccess = () => {
    setCurrentState('chatbot');
  };

  const handleComplexQuerySuccess = () => {
    setCurrentState('success');
  };

  const handleBackToForm = () => {
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
      case 'success':
        return <SuccessPage onBack={handleBackToForm} />;
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