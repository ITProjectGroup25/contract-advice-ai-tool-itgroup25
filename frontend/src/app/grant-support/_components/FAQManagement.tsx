"use client";

import { createFaq } from "@/app/actions/createFaq";
import { deleteFaq } from "@/app/actions/deleteFaq";
import { getFaqs } from "@/app/actions/getFaqs";
import { updateFaq } from "@/app/actions/updateFaq";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  ChevronRight,
  Edit,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  CompactFieldSelectionType,
  SelectedFormSectionsType,
  applySelections,
  extractCompactSelections,
} from "./selected-sections.type";
import { FormSectionChildrenType, FormSectionsType } from "./types";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";

interface FAQManagementProps {
  sections: FormSectionsType;
  formId: number;
}

// Using CompactFieldSelectionType from selected-sections.type.ts
// This represents a field-option selection pair

interface ChatbotResponse {
  id: number;
  form_id: number;
  answer: string;
  name?: string; // Added faq_name field
  selections: SelectedFormSectionsType | null; // Column name is 'selections' in DB, can be null
  created_at?: string;
  updated_at?: string;
}

export function FAQManagement({ sections, formId }: FAQManagementProps) {
  console.log("FAQManagement rendering", { sections, formId });

  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResponse, setEditingResponse] =
    useState<ChatbotResponse | null>(null);

  // New response being created/edited
  const [faqName, setFaqName] = useState(""); // Added FAQ name state
  const [responseText, setResponseText] = useState("");
  const [selections, setSelections] = useState<CompactFieldSelectionType[]>([]);

  // Temporary selection state (before adding to selections)
  const [selectedFieldId, setSelectedFieldId] = useState<string>("");
  const [selectedOptionId, setSelectedOptionId] = useState<string>("");

  // Fetch FAQs using React Query
  const {
    data: faqsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["faqs", formId],
    queryFn: async () => {
      console.log("Fetching FAQs for formId:", formId);
      const result = await getFaqs({ formId });
      console.log("FAQ fetch result:", result);
      if (result.message === "error") {
        throw new Error(result.error || "Failed to fetch FAQs");
      }
      return result.data as ChatbotResponse[];
    },
    enabled: !!formId && !!getFaqs, // Only run if we have formId and the function
  });

  // Create FAQ mutation
  const createMutation = useMutation({
    mutationFn: async (data: {
      formId: number;
      answer: string;
      sections: SelectedFormSectionsType;
      name?: string; // Added name parameter
    }) => {
      console.log("=== createMutation mutationFn called ===");
      console.log(
        "Data being sent to createFaq:",
        JSON.stringify(data, null, 2)
      );

      const result = await createFaq({
        formId: data.formId,
        answer: data.answer,
        selections: data.sections,
        faqName: data.name ?? "",
      });

      console.log("createFaq result:", result);

      if (result.message === "error") {
        throw new Error(result.error || "Failed to create FAQ");
      }
      return result.data;
    },
    onSuccess: (data) => {
      console.log("Create mutation successful, returned data:", data);
      queryClient.invalidateQueries({ queryKey: ["faqs", formId] });
      toast.success("Chatbot response created successfully");
      handleCloseDialog();
    },
    onError: (error: Error) => {
      console.error("Create mutation error:", error);
      toast.error(error.message || "Failed to create FAQ");
    },
  });

  // Update FAQ mutation
  const updateMutation = useMutation({
    mutationFn: async (data: {
      faqId: number;
      answer?: string;
      sections?: SelectedFormSectionsType;
      name?: string; // Added name parameter
    }) => {
      const result = await updateFaq({
        faqId: data.faqId,
        answer: data.answer,
        selections: data.sections,
        name: data.name,
      });
      if (result.message === "error") {
        throw new Error(result.error || "Failed to update FAQ");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs", formId] });
      toast.success("Chatbot response updated successfully");
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update FAQ");
    },
  });

  // Delete FAQ mutation
  const deleteMutation = useMutation({
    mutationFn: async (faqId: number) => {
      const result = await deleteFaq({ faqId });
      if (result.message === "error") {
        throw new Error(result.error || "Failed to delete FAQ");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs", formId] });
      toast.success("Chatbot response deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete FAQ");
    },
  });

  // Get all fields from all sections
  const allFields: FormSectionChildrenType[] = sections.flatMap(
    (section) => section.children
  );

  // Get fields that have options (radio-group, checklist)
  const fieldsWithOptions = allFields.filter(
    (field) =>
      field.items &&
      field.items.length > 0 &&
      ["radio-group", "checklist"].includes(field.controlName)
  );

  // Helper to extract selections from sections using the schema helper
  const extractSelectionsFromSections = (
    sections: SelectedFormSectionsType | undefined | null
  ): CompactFieldSelectionType[] => {
    if (!sections || !Array.isArray(sections)) {
      return [];
    }

    // Use the helper function from selected-sections.type.ts
    return extractCompactSelections(sections);
  };

  const handleOpenDialog = (response?: ChatbotResponse) => {
    if (response) {
      setEditingResponse(response);
      setFaqName(response.name || ""); // Set FAQ name when editing
      setResponseText(response.answer);
      const extractedSelections = extractSelectionsFromSections(
        response.selections
      );
      setSelections(extractedSelections);
    } else {
      setEditingResponse(null);
      setFaqName(""); // Clear FAQ name for new FAQ
      setResponseText("");
      setSelections([]);
    }
    setSelectedFieldId("");
    setSelectedOptionId("");
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingResponse(null);
    setFaqName(""); // Clear FAQ name
    setResponseText("");
    setSelections([]);
    setSelectedFieldId("");
    setSelectedOptionId("");
  };

  const handleAddSelection = () => {
    if (!selectedFieldId || !selectedOptionId) return;

    const field = fieldsWithOptions.find(
      (f) => f.id.toString() === selectedFieldId
    );
    const option = field?.items?.find(
      (opt) => opt.id.toString() === selectedOptionId
    );

    if (field && option) {
      // Find the section that contains this field
      const section = sections.find((s) =>
        s.children.some((c) => c.id.toString() === selectedFieldId)
      );

      const newSelection: CompactFieldSelectionType = {
        fieldId: selectedFieldId,
        fieldLabel: field.labelName,
        controlName: field.controlName,
        optionId: selectedOptionId,
        optionLabel: option.label,
        containerId: field.containerId,
        sectionHeading: section?.container.heading,
      };

      setSelections([...selections, newSelection]);
      setSelectedFieldId("");
      setSelectedOptionId("");
    }
  };

  const handleRemoveSelection = (fieldId: string) => {
    setSelections(selections.filter((s) => s.fieldId !== fieldId));
  };

  const handleSaveResponse = async () => {
    if (!responseText.trim()) {
      toast.error("Please enter a response text");
      return;
    }

    if (selections.length === 0) {
      toast.error("Please add at least one field selection");
      return;
    }

    // Convert selections to SelectedFormSectionsType
    const selectedSections = applySelections(sections, selections);

    console.log("=== Saving response ===");
    console.log("Selections before conversion:", selections);
    console.log("Converted to selectedSections:", selectedSections);

    if (editingResponse) {
      // Update existing response
      updateMutation.mutate({
        faqId: editingResponse.id,
        answer: responseText,
        sections: selectedSections,
        name: faqName.trim() || undefined, // Include name in update
      });
    } else {
      // Create new response
      createMutation.mutate({
        formId,
        answer: responseText,
        sections: selectedSections,
        name: faqName.trim() || undefined, // Include name in create
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">
              Loading chatbot responses...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-destructive">
          <CardContent className="p-8 text-center text-destructive">
            <p>Error loading FAQs: {(error as Error).message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl">Chatbot Responses</h2>
          <p className="text-muted-foreground">
            Configure automatic responses based on form field selections
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          New Response
        </Button>
      </div>

      {/* FAQ List */}
      <div className="space-y-4">
        {!faqsData || faqsData.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <p>No chatbot responses configured yet.</p>
              <p className="text-sm mt-1">
                <p className="text-sm mt-1">
                  {`Click "New Response" to create your first one.`}
                </p>
              </p>
            </CardContent>
          </Card>
        ) : (
          faqsData.map((response) => {
            const selections = extractSelectionsFromSections(
              response.selections
            );
            return (
              <Card key={response.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Display FAQ Name if available */}
                      {response.name && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-medium">
                            {response.name}
                          </Badge>
                        </div>
                      )}

                      {/* Pattern */}
                      <div>
                        <h3 className="text-sm font-medium mb-2">Pattern:</h3>
                        <div className="flex flex-wrap gap-2">
                          {selections.map((sel, idx) => (
                            <div
                              key={sel.fieldId}
                              className="flex items-center gap-1"
                            >
                              {idx > 0 && (
                                <span className="text-xs text-muted-foreground px-1">
                                  AND
                                </span>
                              )}
                              <Badge variant="secondary" className="text-xs">
                                {sel.fieldLabel} = {sel.optionLabel}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Response */}
                      <div>
                        <h3 className="text-sm font-medium mb-1">Response:</h3>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {response.answer}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(response)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to delete this response?"
                            )
                          ) {
                            deleteMutation.mutate(response.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl sm:max-w-[1100px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingResponse ? "Edit Response" : "Create New Response"}
            </DialogTitle>
            <DialogDescription>
              Configure which form field combinations should trigger this
              chatbot response
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-4 flex-1 overflow-hidden">
            {/* Left Column - Available Fields */}
            <div className="space-y-3">
              <div>
                <h3 className="font-medium text-sm mb-1">Available Fields</h3>
                <p className="text-xs text-muted-foreground">
                  Select fields with options to create patterns
                </p>
              </div>

              <ScrollArea className="h-[400px]">
                <div className="space-y-2 pr-3">
                  {fieldsWithOptions.map((field) => {
                    const isAlreadySelected = selections.some(
                      (s) => s.fieldId === field.id.toString()
                    );
                    const isCurrentlySelected =
                      selectedFieldId === field.id.toString();

                    return (
                      <Card
                        key={field.id}
                        className={`cursor-pointer transition-colors ${
                          isCurrentlySelected
                            ? "border-primary bg-primary/5"
                            : isAlreadySelected
                            ? "border-muted opacity-60"
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => {
                          // Toggle: if already selected, deselect it; otherwise select it
                          if (isCurrentlySelected) {
                            setSelectedFieldId("");
                            setSelectedOptionId("");
                          } else {
                            setSelectedFieldId(field.id.toString());
                            setSelectedOptionId("");
                          }
                        }}
                      >
                        <CardContent className="p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-sm">
                              {field.labelName}
                            </div>
                            {isAlreadySelected && (
                              <Badge variant="secondary" className="text-xs">
                                Selected
                              </Badge>
                            )}
                          </div>

                          {/* Show options for selected field */}
                          {isCurrentlySelected && field.items && (
                            <div className="space-y-1 pt-2 border-t">
                              <p className="text-xs text-muted-foreground mb-1">
                                Select an option:
                              </p>
                              {field.items.map((option) => (
                                <Button
                                  key={option.id}
                                  variant={
                                    selectedOptionId === option.id.toString()
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  className="w-full justify-start text-xs h-7"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedOptionId(option.id.toString());
                                  }}
                                >
                                  {option.label}
                                </Button>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* Add Selection Button */}
              {selectedFieldId && selectedOptionId && (
                <Button
                  onClick={handleAddSelection}
                  className="w-full"
                  size="sm"
                  disabled={isSubmitting}
                >
                  <ArrowRight className="h-4 w-4 mr-1" />
                  Add to Selections
                </Button>
              )}
            </div>

            {/* Middle Column - Selections */}
            <div className="space-y-3">
              <div>
                <h3 className="font-medium text-sm mb-1">Pattern Selections</h3>
                <p className="text-xs text-muted-foreground">
                  Field-option combinations that trigger this response
                </p>
              </div>

              <Card className="h-[400px]">
                <CardContent className="p-3">
                  {selections.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center text-muted-foreground text-sm">
                      <div>
                        <ChevronRight className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No selections yet</p>
                        <p className="text-xs mt-1">
                          Add field selections from the left
                        </p>
                      </div>
                    </div>
                  ) : (
                    <ScrollArea className="h-full">
                      <div className="space-y-2">
                        {selections.map((selection, index) => (
                          <Card
                            key={selection.fieldId}
                            className="border-primary/50"
                          >
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 space-y-1">
                                  {index > 0 && (
                                    <div className="text-xs font-semibold text-muted-foreground mb-1">
                                      AND
                                    </div>
                                  )}
                                  <div className="text-sm font-medium">
                                    {selection.fieldLabel}
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <span>=</span>
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {selection.optionLabel}
                                    </Badge>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleRemoveSelection(selection.fieldId)
                                  }
                                  className="h-6 w-6 p-0"
                                  disabled={isSubmitting}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Response Configuration */}
            <div className="space-y-3">
              <div>
                <h3 className="font-medium text-sm mb-1">Chatbot Response</h3>
                <p className="text-xs text-muted-foreground">
                  Configure the response for this pattern
                </p>
              </div>

              <div className="space-y-3">
                {/* FAQ Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="faq-name" className="text-xs">
                    Name (Optional)
                  </Label>
                  <Input
                    id="faq-name"
                    value={faqName}
                    onChange={(e) => setFaqName(e.target.value)}
                    placeholder="e.g., General Inquiry, Product Question..."
                    className="text-sm"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    Give this FAQ a descriptive name for easier identification
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="response-text" className="text-xs">
                    Response Text <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="response-text"
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Enter the chatbot's response when this pattern is detected..."
                    rows={12}
                    className="text-sm resize-none"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    {responseText.length} characters
                  </p>
                </div>

                {selections.length > 0 && (
                  <div className="p-3 bg-muted rounded-lg space-y-2">
                    <p className="text-xs font-medium">Preview Pattern:</p>
                    <div className="text-xs space-y-1">
                      {selections.map((sel, idx) => (
                        <div key={sel.fieldId}>
                          {idx > 0 && (
                            <span className="text-muted-foreground">AND </span>
                          )}
                          <span className="font-medium">{sel.fieldLabel}</span>{" "}
                          =
                          <span className="ml-1 font-medium text-primary">
                            {sel.optionLabel}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button onClick={handleSaveResponse} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  {editingResponse ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  {editingResponse ? "Update Response" : "Create Response"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
