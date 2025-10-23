"use client";

import { defaultQuestions, defaultSections, Question, FormSection } from "@shared";
import { useState } from "react";
import { toast } from "sonner";

import { AdminInterface } from "@/components/dynamic-form/AdminInterface";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [questions, setQuestions] = useState<Question[]>(defaultQuestions);
  const [sections, setSections] = useState<FormSection[]>(defaultSections);

  // Simple password authentication (in production, use proper authentication)
  const handleLogin = () => {
    if (password === "admin123") {
      setIsAuthenticated(true);
      toast.success("Welcome to the Admin Panel!");
    } else {
      toast.error("Invalid Password");
    }
  };

  const handleBack = () => {
    // In a real app, this would navigate back to the main form
    window.location.href = "/dynamic-form";
  };

  const handleQuestionsUpdate = (updatedQuestions: Question[]) => {
    setQuestions(updatedQuestions);
    // In a real app, this would save to the database
    console.log("Questions updated:", updatedQuestions);
  };

  const handleSectionsUpdate = (updatedSections: FormSection[]) => {
    setSections(updatedSections);
    // In a real app, this would save to the database
    console.log("Sections updated:", updatedSections);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Administrator Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter administrator password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <Button onClick={handleLogin} className="w-full">
              Login
            </Button>
            <p className="text-center text-sm text-gray-600">Demo password: admin123</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AdminInterface
      onBack={handleBack}
      questions={questions}
      sections={sections}
      onQuestionsUpdate={handleQuestionsUpdate}
      onSectionsUpdate={handleSectionsUpdate}
    />
  );
}
