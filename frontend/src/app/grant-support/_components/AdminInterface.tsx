"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
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
  Copy,
  Database,
} from "lucide-react";
import { DatabaseManagement } from "./DatabaseManagement";
import { EmailConfiguration } from "./EmailConfiguration";

export interface QuestionOption {
  id: string;
  label: string;
  hasOtherField?: boolean;
}

export interface Question {
  id: string;
  title: string;
  description?: string;
  type: "text" | "email" | "textarea" | "select" | "checkbox-group" | "radio-group" | "date";
  required: boolean;
  options?: QuestionOption[];
  placeholder?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  conditional?: {
    dependsOn: string;
    showWhen: string[];
  };
  section: string;
  order: number;
  visible: boolean;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  queryType?: "both" | "simple" | "complex";
}

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
  const [editingSection, setEditingSection] = useState<FormSection | null>(null);
  const [isCreatingQuestion, setIsCreatingQuestion] = useState(false);
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [activeTab, setActiveTab] = useState("questions");

  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    title: "",
    description: "",
    type: "text",
    required: false,
    options: [],
    section: "",
    order: questions.length + 1,
    visible: true,
  });

  const [newSection, setNewSection] = useState<Partial<FormSection>>({
    title: "",
    description: "",
    order: sections.length + 1,
    queryType: "both",
  });

  const handleSaveQuestion = () => {
    if (!newQuestion.title || !newQuestion.section) return;

    const question: Question = {
      id: editingQuestion?.id || `q_${Date.now()}`,
      title: newQuestion.title!,
      description: newQuestion.description,
      type: newQuestion.type!,
      required: newQuestion.required!,
      options: newQuestion.options,
      placeholder: newQuestion.placeholder,
      validation: newQuestion.validation,
      conditional: newQuestion.conditional,
      section: newQuestion.section!,
      order: newQuestion.order!,
      visible: newQuestion.visible!,
    };

    if (editingQuestion) {
      onQuestionsUpdate(questions.map((q) => (q.id === question.id ? question : q)));
    } else {
      onQuestionsUpdate([...questions, question]);
    }

    resetQuestionForm();
  };

  const handleSaveSection = () => {
    if (!newSection.title) return;

    const section: FormSection = {
      id: editingSection?.id || `s_${Date.now()}`,
      title: newSection.title!,
      description: newSection.description,
      order: newSection.order!,
      queryType: newSection.queryType!,
    };

    if (editingSection) {
      onSectionsUpdate(sections.map((s) => (s.id === section.id ? section : s)));
    } else {
      onSectionsUpdate([...sections, section]);
    }

    resetSectionForm();
  };

  const resetQuestionForm = () => {
    setNewQuestion({
      title: "",
      description: "",
      type: "text",
      required: false,
      options: [],
      section: "",
      order: questions.length + 1,
      visible: true,
    });
    setEditingQuestion(null);
    setIsCreatingQuestion(false);
  };

  const resetSectionForm = () => {
    setNewSection({
      title: "",
      description: "",
      order: sections.length + 1,
      queryType: "both",
    });
    setEditingSection(null);
    setIsCreatingSection(false);
  };

  const handleEditQuestion = (question: Question) => {
    setNewQuestion(question);
    setEditingQuestion(question);
    setIsCreatingQuestion(true);
  };

  const handleEditSection = (section: FormSection) => {
    setNewSection(section);
    setEditingSection(section);
    setIsCreatingSection(true);
  };

  const handleDeleteQuestion = (questionId: string) => {
    onQuestionsUpdate(questions.filter((q) => q.id !== questionId));
  };

  const handleDeleteSection = (sectionId: string) => {
    // Also remove questions in this section
    onQuestionsUpdate(questions.filter((q) => q.section !== sectionId));
    onSectionsUpdate(sections.filter((s) => s.id !== sectionId));
  };

  const addOption = () => {
    const currentOptions = newQuestion.options || [];
    setNewQuestion({
      ...newQuestion,
      options: [...currentOptions, { id: `opt_${Date.now()}`, label: "" }],
    });
  };

  const updateOption = (index: number, field: keyof QuestionOption, value: string | boolean) => {
    const currentOptions = newQuestion.options || [];
    const updatedOptions = [...currentOptions];
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  const removeOption = (index: number) => {
    const currentOptions = newQuestion.options || [];
    setNewQuestion({
      ...newQuestion,
      options: currentOptions.filter((_, i) => i !== index),
    });
  };

  const toggleQuestionVisibility = (questionId: string) => {
    onQuestionsUpdate(
      questions.map((q) => (q.id === questionId ? { ...q, visible: !q.visible } : q))
    );
  };

  const duplicateQuestion = (question: Question) => {
    const newQ: Question = {
      ...question,
      id: `q_${Date.now()}`,
      title: `${question.title} (Copy)`,
      order: questions.length + 1,
    };
    onQuestionsUpdate([...questions, newQ]);
  };

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);
  const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Form
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl">Form Administration</h1>
            <p className="text-muted-foreground">
              Manage questions, sections, and form configuration
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="flex items-center gap-1 text-xs">
            <Settings className="h-3 w-3" />
            Admin Mode
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="questions">Questions Management</TabsTrigger>
          <TabsTrigger value="sections">Sections Management</TabsTrigger>
          <TabsTrigger value="email">Email Configuration</TabsTrigger>
          <TabsTrigger value="database">Database Management</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-6">
          {/* Questions Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl">Questions ({questions.length})</h2>
              <p className="text-muted-foreground">Add, edit, and manage form questions</p>
            </div>
            <Button onClick={() => setIsCreatingQuestion(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
          </div>

          {/* Question Form */}
          {isCreatingQuestion && (
            <Card className="border-primary/20 border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {editingQuestion ? "Edit Question" : "Create New Question"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="question-title">Question Title *</Label>
                    <Input
                      id="question-title"
                      value={newQuestion.title}
                      onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                      placeholder="Enter question title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="question-type">Question Type *</Label>
                    <Select
                      value={newQuestion.type}
                      onValueChange={(value) =>
                        setNewQuestion({ ...newQuestion, type: value as Question["type"] })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text Input</SelectItem>
                        <SelectItem value="email">Email Input</SelectItem>
                        <SelectItem value="textarea">Text Area</SelectItem>
                        <SelectItem value="select">Dropdown</SelectItem>
                        <SelectItem value="checkbox-group">Checkbox Group</SelectItem>
                        <SelectItem value="radio-group">Radio Group</SelectItem>
                        <SelectItem value="date">Date Input</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="question-description">Description</Label>
                  <Textarea
                    id="question-description"
                    value={newQuestion.description}
                    onChange={(e) =>
                      setNewQuestion({ ...newQuestion, description: e.target.value })
                    }
                    placeholder="Optional description or helper text"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="question-section">Section *</Label>
                    <Select
                      value={newQuestion.section}
                      onValueChange={(value) => setNewQuestion({ ...newQuestion, section: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select section" />
                      </SelectTrigger>
                      <SelectContent>
                        {sortedSections.map((section) => (
                          <SelectItem key={section.id} value={section.id}>
                            {section.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="question-placeholder">Placeholder</Label>
                    <Input
                      id="question-placeholder"
                      value={newQuestion.placeholder}
                      onChange={(e) =>
                        setNewQuestion({ ...newQuestion, placeholder: e.target.value })
                      }
                      placeholder="Input placeholder text"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="question-required"
                    checked={newQuestion.required}
                    onCheckedChange={(checked) =>
                      setNewQuestion({ ...newQuestion, required: !!checked })
                    }
                  />
                  <Label htmlFor="question-required">Required field</Label>
                </div>

                {/* Options for select/checkbox/radio types */}
                {["select", "checkbox-group", "radio-group"].includes(newQuestion.type!) && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Options</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addOption}>
                        <Plus className="mr-1 h-4 w-4" />
                        Add Option
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {(newQuestion.options || []).map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={option.label}
                            onChange={(e) => updateOption(index, "label", e.target.value)}
                            placeholder="Option label"
                            className="flex-1"
                          />
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={option.hasOtherField}
                              onCheckedChange={(checked) =>
                                updateOption(index, "hasOtherField", !!checked)
                              }
                            />
                            <Label className="text-sm">Has &quot;Other&quot; field</Label>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeOption(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={resetQuestionForm}>
                    <X className="mr-1 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button onClick={handleSaveQuestion}>
                    <Save className="mr-1 h-4 w-4" />
                    {editingQuestion ? "Update" : "Create"} Question
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Questions List */}
          <div className="space-y-3">
            {sortedQuestions.map((question) => (
              <Card key={question.id} className={!question.visible ? "opacity-50" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="font-medium">{question.title}</h3>
                        {question.required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {question.type}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {sections.find((s) => s.id === question.section)?.title}
                        </Badge>
                      </div>
                      {question.description && (
                        <p className="text-muted-foreground text-sm">{question.description}</p>
                      )}
                      {question.options && question.options.length > 0 && (
                        <div className="text-muted-foreground mt-2 text-xs">
                          Options: {question.options.map((opt) => opt.label).join(", ")}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleQuestionVisibility(question.id)}
                        title={question.visible ? "Hide question" : "Show question"}
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
                        onClick={() => duplicateQuestion(question)}
                        title="Duplicate question"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditQuestion(question)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="text-destructive hover:text-destructive"
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

        <TabsContent value="sections" className="space-y-6">
          {/* Sections Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl">Sections ({sections.length})</h2>
              <p className="text-muted-foreground">Organize questions into logical sections</p>
            </div>
            <Button onClick={() => setIsCreatingSection(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Section
            </Button>
          </div>

          {/* Section Form */}
          {isCreatingSection && (
            <Card className="border-primary/20 border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {editingSection ? "Edit Section" : "Create New Section"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="section-title">Section Title *</Label>
                  <Input
                    id="section-title"
                    value={newSection.title}
                    onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                    placeholder="Enter section title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="section-description">Description</Label>
                  <Textarea
                    id="section-description"
                    value={newSection.description}
                    onChange={(e) => setNewSection({ ...newSection, description: e.target.value })}
                    placeholder="Optional section description"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="section-query-type">Visibility</Label>
                  <Select
                    value={newSection.queryType}
                    onValueChange={(value) =>
                      setNewSection({ ...newSection, queryType: value as FormSection["queryType"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="both">Both Query Types</SelectItem>
                      <SelectItem value="simple">Simple Queries Only</SelectItem>
                      <SelectItem value="complex">Complex Queries Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={resetSectionForm}>
                    <X className="mr-1 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button onClick={handleSaveSection}>
                    <Save className="mr-1 h-4 w-4" />
                    {editingSection ? "Update" : "Create"} Section
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sections List */}
          <div className="space-y-3">
            {sortedSections.map((section) => {
              const sectionQuestions = questions.filter((q) => q.section === section.id);
              return (
                <Card key={section.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <h3 className="font-medium">{section.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {section.queryType}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {sectionQuestions.length} questions
                          </Badge>
                        </div>
                        {section.description && (
                          <p className="text-muted-foreground text-sm">{section.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSection(section)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSection(section.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <EmailConfiguration />
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <DatabaseManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
