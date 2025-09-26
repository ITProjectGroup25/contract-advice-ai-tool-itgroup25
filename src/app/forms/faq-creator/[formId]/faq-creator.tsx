"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

export default function AdminFAQManager() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const handleAddFAQ = () => {
    if (!question.trim() || !answer.trim()) return;
    const newFAQ: FAQ = {
      id: Date.now(),
      question,
      answer,
    };
    setFaqs((prev) => [...prev, newFAQ]);
    setQuestion("");
    setAnswer("");
  };

  const handleDeleteFAQ = (id: number) => {
    setFaqs((prev) => prev.filter((faq) => faq.id !== id));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-6">
      {/* Form to add FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Add New FAQ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Input
              id="question"
              placeholder="Enter FAQ question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="answer">Answer</Label>
            <Textarea
              id="answer"
              placeholder="Enter FAQ answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
          </div>

          <Button onClick={handleAddFAQ} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add FAQ
          </Button>
        </CardContent>
      </Card>

      {/* FAQ List */}
      <div className="space-y-4">
        {faqs.map((faq) => (
          <Card key={faq.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">{faq.question}</CardTitle>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleDeleteFAQ(faq.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">{faq.answer}</p>
            </CardContent>
          </Card>
        ))}

        {faqs.length === 0 && (
          <p className="text-center text-gray-500">No FAQs yet.</p>
        )}
      </div>
    </div>
  );
}
