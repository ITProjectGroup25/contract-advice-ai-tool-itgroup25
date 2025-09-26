"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Edit3, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

export default function AdminFAQManager() {
  const [faqs, setFaqs] = useState<FAQ[]>([
    {
      id: 1,
      question: "What is your return policy?",
      answer:
        "We offer a 30-day return policy for all unused items in their original packaging. Please contact our support team to initiate a return.",
    },
    {
      id: 2,
      question: "How long does shipping take?",
      answer:
        "Standard shipping typically takes 3-5 business days. Express shipping options are available for faster delivery.",
    },
  ]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleAddFAQ = () => {
    if (!question.trim() || !answer.trim()) return;

    if (editingId) {
      // Update existing FAQ
      setFaqs((prev) =>
        prev.map((faq) =>
          faq.id === editingId
            ? { ...faq, question: question.trim(), answer: answer.trim() }
            : faq
        )
      );
      setEditingId(null);
    } else {
      // Add new FAQ
      const newFAQ: FAQ = {
        id: Date.now(),
        question: question.trim(),
        answer: answer.trim(),
      };
      setFaqs((prev) => [...prev, newFAQ]);
    }

    setQuestion("");
    setAnswer("");
    setShowForm(false);
  };

  const handleEditFAQ = (faq: FAQ) => {
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setEditingId(faq.id);
    setShowForm(true);
  };

  const handleDeleteFAQ = (id: number) => {
    setFaqs((prev) => prev.filter((faq) => faq.id !== id));
  };

  const handleCancel = () => {
    setQuestion("");
    setAnswer("");
    setShowForm(false);
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground mb-2 text-balance">
            FAQ Management
          </h1>
          <p className="text-muted-foreground text-pretty">
            Create and manage frequently asked questions for your website
          </p>
        </div>

        {/* Create New FAQ Button */}
        <div className="mb-6">
          <Button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 font-medium"
            disabled={showForm}
          >
            <Plus className="w-4 h-4" />
            Create New FAQ
          </Button>
        </div>

        {/* Form Card - Only show when creating/editing */}
        {showForm && (
          <Card className="mb-8 border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">
                  {editingId ? "Edit FAQ" : "Add New FAQ"}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancel}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="question" className="text-sm font-medium">
                  Question
                </Label>
                <Input
                  id="question"
                  placeholder="Enter your FAQ question..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="answer" className="text-sm font-medium">
                  Answer
                </Label>
                <Textarea
                  id="answer"
                  placeholder="Enter the answer to this question..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="min-h-[120px] border-border/50 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleAddFAQ}
                  className="flex items-center gap-2 font-medium"
                  disabled={!question.trim() || !answer.trim()}
                >
                  <Plus className="w-4 h-4" />
                  {editingId ? "Update FAQ" : "Add FAQ"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="font-medium bg-transparent"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Divider */}
        <Separator className="mb-8" />

        {/* FAQ List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium text-foreground">
              Existing FAQs ({faqs.length})
            </h2>
          </div>

          {faqs.length === 0 ? (
            <Card className="border-dashed border-2 border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Plus className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No FAQs yet
                </h3>
                <p className="text-muted-foreground text-center text-pretty max-w-sm">
                  Get started by creating your first FAQ to help answer common
                  questions from your users.
                </p>
                <Button
                  onClick={() => setShowForm(true)}
                  className="mt-4 font-medium"
                  variant="outline"
                >
                  Create Your First FAQ
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card
                  key={faq.id}
                  className="border-border/50 shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                            FAQ {index + 1}
                          </span>
                        </div>
                        <CardTitle className="text-base font-medium text-foreground leading-relaxed text-pretty">
                          {faq.question}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditFAQ(faq)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteFAQ(faq.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
