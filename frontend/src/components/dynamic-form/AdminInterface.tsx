"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ArrowLeft,
  Eye,
  EyeOff,
  Move,
} from "lucide-react";
import { Question, FormSection } from "@shared";
import { toast } from "sonner";

interface AdminInterfaceProps {
  onBack: () => void;
  questions: Question[];
  sections: FormSection[];
  onQuestionsUpdate: (questions: Question[]) => void;
  onSectionsUpdate: (sections: FormSection[]) => void;
}

export function AdminInterface({
  onBack,
  questions,
  sections,
  onQuestionsUpdate,
  onSectionsUpdate,
}: AdminInterfaceProps) {
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editingSection, setEditingSection] = useState<FormSection | null>(
    null
  );
  const [isCreatingQuestion, setIsCreatingQuestion] = useState(false);
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [activeTab, setActiveTab] = useState("questions");

  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    id: "",
    label: "",
    type: "text",
    required: false,
    visible: true,
    order: questions.length + 1,
    sectionId: "",
  });

  const [newSection, setNewSection] = useState<Partial<FormSection>>({
    id: "",
    title: "",
    description: "",
    order: sections.length + 1,
    visible: true,
  });

  const handleCreateQuestion = () => {
    if (!newQuestion.id || !newQuestion.label || !newQuestion.sectionId) {
      toast.error("Please fill in all required fields");
      return;
    }

    const question: Question = {
      id: newQuestion.id,
      type: newQuestion.type || "text",
      label: newQuestion.label,
      placeholder: newQuestion.placeholder,
      required: newQuestion.required || false,
      visible: newQuestion.visible || true,
      order: newQuestion.order || questions.length + 1,
      sectionId: newQuestion.sectionId,
      helpText: newQuestion.helpText,
      options: newQuestion.options || [],
      validation: newQuestion.validation,
      conditional: newQuestion.conditional,
    };

    onQuestionsUpdate([...questions, question]);
    setNewQuestion({
      id: "",
      label: "",
      type: "text",
      required: false,
      visible: true,
      order: questions.length + 2,
      sectionId: "",
    });
    setIsCreatingQuestion(false);
    toast.success("Question created successfully");
  };

  const handleCreateSection = () => {
    if (!newSection.id || !newSection.title) {
      toast.error("Please fill in all required fields");
      return;
    }

    const section: FormSection = {
      id: newSection.id,
      title: newSection.title,
      description: newSection.description,
      order: newSection.order || sections.length + 1,
      visible: newSection.visible || true,
      conditional: newSection.conditional,
      icon: newSection.icon,
    };

    onSectionsUpdate([...sections, section]);
    setNewSection({
      id: "",
      title: "",
      description: "",
      order: sections.length + 2,
      visible: true,
    });
    setIsCreatingSection(false);
    toast.success("Section created successfully");
  };

  const handleDeleteQuestion = (questionId: string) => {
    onQuestionsUpdate(questions.filter((q) => q.id !== questionId));
    toast.success("Question deleted successfully");
  };

  const handleDeleteSection = (sectionId: string) => {
    onSectionsUpdate(sections.filter((s) => s.id !== sectionId));
    // Also remove questions in this section
    onQuestionsUpdate(questions.filter((q) => q.sectionId !== sectionId));
    toast.success("Section deleted successfully");
  };

  const handleToggleQuestionVisibility = (questionId: string) => {
    const updatedQuestions = questions.map((q) =>
      q.id === questionId ? { ...q, visible: !q.visible } : q
    );
    onQuestionsUpdate(updatedQuestions);
  };

  const handleToggleSectionVisibility = (sectionId: string) => {
    const updatedSections = sections.map((s) =>
      s.id === sectionId ? { ...s, visible: !s.visible } : s
    );
    onSectionsUpdate(updatedSections);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Form
            </Button>
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">
                Administration Panel
              </h1>
              <p className="text-gray-600">
                Manage form questions and sections
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-600" />
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="sections">Sections</TabsTrigger>
          </TabsList>

          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Form Questions</h2>
              <Button
                onClick={() => setIsCreatingQuestion(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Question
              </Button>
            </div>

            {/* Create Question Form */}
            {isCreatingQuestion && (
              <Card>
                <CardHeader>
                  <CardTitle>Create New Question</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="question-id">Question ID</Label>
                      <Input
                        id="question-id"
                        value={newQuestion.id || ""}
                        onChange={(e) =>
                          setNewQuestion({ ...newQuestion, id: e.target.value })
                        }
                        placeholder="e.g., user-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="question-type">Type</Label>
                      <Select
                        value={newQuestion.type}
                        onValueChange={(value) =>
                          setNewQuestion({ ...newQuestion, type: value as any })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="textarea">Textarea</SelectItem>
                          <SelectItem value="select">Select</SelectItem>
                          <SelectItem value="checkbox">Checkbox</SelectItem>
                          <SelectItem value="radio">Radio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="question-label">Label</Label>
                    <Input
                      id="question-label"
                      value={newQuestion.label || ""}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          label: e.target.value,
                        })
                      }
                      placeholder="Question label"
                    />
                  </div>

                  <div>
                    <Label htmlFor="question-section">Section</Label>
                    <Select
                      value={newQuestion.sectionId}
                      onValueChange={(value) =>
                        setNewQuestion({ ...newQuestion, sectionId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a section" />
                      </SelectTrigger>
                      <SelectContent>
                        {sections.map((section) => (
                          <SelectItem key={section.id} value={section.id}>
                            {section.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="question-required"
                      checked={newQuestion.required}
                      onCheckedChange={(checked) =>
                        setNewQuestion({ ...newQuestion, required: !!checked })
                      }
                    />
                    <Label htmlFor="question-required">Required</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleCreateQuestion}>
                      <Save className="h-4 w-4 mr-2" />
                      Create Question
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreatingQuestion(false)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Questions List */}
            <div className="space-y-4">
              {questions.map((question) => (
                <Card key={question.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-medium">{question.label}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">{question.type}</Badge>
                            <Badge
                              variant={
                                question.required ? "default" : "outline"
                              }
                            >
                              {question.required ? "Required" : "Optional"}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              Section:{" "}
                              {sections.find((s) => s.id === question.sectionId)
                                ?.title || "Unknown"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleToggleQuestionVisibility(question.id)
                          }
                        >
                          {question.visible ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingQuestion(question)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteQuestion(question.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Sections Tab */}
          <TabsContent value="sections" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Form Sections</h2>
              <Button
                onClick={() => setIsCreatingSection(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Section
              </Button>
            </div>

            {/* Create Section Form */}
            {isCreatingSection && (
              <Card>
                <CardHeader>
                  <CardTitle>Create New Section</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="section-id">Section ID</Label>
                    <Input
                      id="section-id"
                      value={newSection.id || ""}
                      onChange={(e) =>
                        setNewSection({ ...newSection, id: e.target.value })
                      }
                      placeholder="e.g., basic-info"
                    />
                  </div>

                  <div>
                    <Label htmlFor="section-title">Title</Label>
                    <Input
                      id="section-title"
                      value={newSection.title || ""}
                      onChange={(e) =>
                        setNewSection({ ...newSection, title: e.target.value })
                      }
                      placeholder="Section title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="section-description">Description</Label>
                    <Textarea
                      id="section-description"
                      value={newSection.description || ""}
                      onChange={(e) =>
                        setNewSection({
                          ...newSection,
                          description: e.target.value,
                        })
                      }
                      placeholder="Section description"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleCreateSection}>
                      <Save className="h-4 w-4 mr-2" />
                      Create Section
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreatingSection(false)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sections List */}
            <div className="space-y-4">
              {sections.map((section) => (
                <Card key={section.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{section.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {section.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">
                            Order: {section.order}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {
                              questions.filter(
                                (q) => q.sectionId === section.id
                              ).length
                            }{" "}
                            questions
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleToggleSectionVisibility(section.id)
                          }
                        >
                          {section.visible ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingSection(section)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSection(section.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
