"use client";

import { updateFormFields } from "@/app/actions/updateFormFields";
import {
  ArrowLeft,
  Copy,
  Edit,
  Loader2,
  Lock,
  Plus,
  Save,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { DatabaseManagement } from "./DatabaseManagement";
import { EmailConfiguration } from "./EmailConfiguration";
import {
  FormSectionChildrenItemsType,
  FormSectionChildrenType,
  FormSectionType,
  FormSectionsType,
} from "./types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { FAQManagement } from "./FAQManagement";

interface AdminInterfaceProps {
  onBack: () => void;
  sections: FormSectionsType;
  formId: number;
  onSectionsUpdate: (sections: FormSectionsType) => void;
}

type ConfirmationAction =
  | { type: "save-field"; fieldId?: string | number }
  | { type: "save-section"; sectionId?: string }
  | { type: "delete-field"; fieldId: string | number; containerId: string }
  | { type: "delete-section"; sectionId: string }
  | { type: "duplicate-field"; field: FormSectionChildrenType }
  | null;

// System fields that cannot be edited or deleted
const SYSTEM_FIELD_LABELS = ["Your Name", "Your Email", "Query Type"];

const isSystemField = (labelName: string): boolean => {
  return SYSTEM_FIELD_LABELS.includes(labelName);
};

export function AdminInterface({
  onBack,
  sections,
  formId,
  onSectionsUpdate,
}: AdminInterfaceProps) {
  console.log({ sections });

  const [editingFieldId, setEditingFieldId] = useState<string | number | null>(
    null
  );
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [isCreatingField, setIsCreatingField] = useState(false);
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [activeTab, setActiveTab] = useState("fields");
  const [isPending, startTransition] = useTransition();
  const [confirmationAction, setConfirmationAction] =
    useState<ConfirmationAction>(null);

  // Section visibility configuration
  const [sectionVisibilityField, setSectionVisibilityField] = useState<
    string | null
  >(null);
  const [sectionVisibilityOption, setSectionVisibilityOption] = useState<
    string | null
  >(null);

  const [newField, setNewField] = useState<Partial<FormSectionChildrenType>>({
    controlName: "text-field",
    displayText: "Text Field",
    description: "",
    labelName: "",
    itemType: "control",
    icon: "fas fa-text-height",
    required: false,
    category: "text-elements",
    containerId: "",
    placeholder: "",
    dataType: "text",
  });

  const [newSection, setNewSection] = useState<Partial<FormSectionType>>({
    container: {
      controlName: "step-container",
      displayText: "Workflow Step",
      itemType: "container",
      icon: "fa fa-building",
      heading: "",
      subHeading: "",
      id: `section_${Date.now()}`,
      alwaysVisible: true,
    },
    children: [],
  });

  const getConfirmationMessage = () => {
    if (!confirmationAction) return { title: "", description: "" };

    switch (confirmationAction.type) {
      case "save-field":
        return {
          title: confirmationAction.fieldId ? "Update Field?" : "Create Field?",
          description: confirmationAction.fieldId
            ? "Are you sure you want to update this field? This will save changes to the database."
            : "Are you sure you want to create this field? This will save changes to the database.",
        };
      case "save-section":
        return {
          title: confirmationAction.sectionId
            ? "Update Section?"
            : "Create Section?",
          description: confirmationAction.sectionId
            ? "Are you sure you want to update this section? This will save changes to the database."
            : "Are you sure you want to create this section? This will save changes to the database.",
        };
      case "delete-field":
        return {
          title: "Delete Field?",
          description:
            "Are you sure you want to delete this field? This action cannot be undone.",
        };
      case "delete-section":
        return {
          title: "Delete Section?",
          description:
            "Are you sure you want to delete this section and all its fields? This action cannot be undone.",
        };
      case "duplicate-field":
        return {
          title: "Duplicate Field?",
          description:
            "Are you sure you want to duplicate this field? This will save changes to the database.",
        };
      default:
        return { title: "", description: "" };
    }
  };

  const executeAction = async () => {
    if (!confirmationAction) return;

    switch (confirmationAction.type) {
      case "save-field":
        await performSaveField(confirmationAction.fieldId);
        break;
      case "save-section":
        await performSaveSection(confirmationAction.sectionId);
        break;
      case "delete-field":
        await performDeleteField(
          confirmationAction.fieldId,
          confirmationAction.containerId
        );
        break;
      case "delete-section":
        await performDeleteSection(confirmationAction.sectionId);
        break;
      case "duplicate-field":
        await performDuplicateField(confirmationAction.field);
        break;
    }

    setConfirmationAction(null);
  };

  const performSaveField = async (fieldId?: string | number) => {
    if (!newField.labelName || !newField.containerId) {
      toast.error("Please fill in all required fields");
      return;
    }

    const field: FormSectionChildrenType = {
      controlName: newField.controlName!,
      displayText: newField.displayText!,
      description: newField.description!,
      labelName: newField.labelName!,
      itemType: newField.itemType!,
      icon: newField.icon!,
      required: newField.required!,
      category: newField.category!,
      id: fieldId || `field_${Date.now()}`,
      containerId: newField.containerId!,
      placeholder: newField.placeholder,
      rows: newField.rows,
      dataType: newField.dataType,
      items: newField.items,
      containersToMakeVisible: newField.containersToMakeVisible,
    };

    let updatedSections: FormSectionsType;

    if (fieldId) {
      // EDITING an existing field
      // Find the old section (where the field currently is)
      const oldField = sections
        .flatMap((s) => s.children)
        .find((child) => child.id === fieldId);

      const oldContainerId = oldField?.containerId;

      // If the section changed, we need to remove from old and add to new
      if (oldContainerId && oldContainerId !== newField.containerId) {
        updatedSections = sections.map((section) => {
          // Remove from old section
          if (section.container.id === oldContainerId) {
            return {
              ...section,
              children: section.children.filter(
                (child) => child.id !== fieldId
              ),
            };
          }
          // Add to new section
          if (section.container.id === newField.containerId) {
            return {
              ...section,
              children: [...section.children, field],
            };
          }
          return section;
        });
      } else {
        // Section didn't change, just update the field in place
        updatedSections = sections.map((section) => {
          if (section.container.id === field.containerId) {
            return {
              ...section,
              children: section.children.map((child) =>
                child.id === field.id ? field : child
              ),
            };
          }
          return section;
        });
      }
    } else {
      // CREATING a new field
      updatedSections = sections.map((section) => {
        if (section.container.id === field.containerId) {
          return {
            ...section,
            children: [...section.children, field],
          };
        }
        return section;
      });
    }

    startTransition(async () => {
      const result = await updateFormFields({
        formId,
        formSections: updatedSections,
      });

      if (result.message === "success") {
        toast.success(
          fieldId ? "Field updated successfully" : "Field created successfully"
        );
        onSectionsUpdate(updatedSections);
        resetFieldForm();
      } else {
        toast.error(result.error || "Failed to save field");
      }
    });
  };
  const performSaveSection = async (sectionId?: string) => {
    if (!newSection.container?.heading) {
      toast.error("Please enter a section heading");
      return;
    }

    // Validate conditional visibility if not always visible
    if (!newSection.container?.alwaysVisible) {
      if (!sectionVisibilityField || !sectionVisibilityOption) {
        toast.error(
          "Please select a field and option for conditional visibility"
        );
        return;
      }
    }

    const section: FormSectionType = {
      container: {
        ...newSection.container!,
        id: sectionId || `section_${Date.now()}`,
        visibilityCondition:
          !newSection.container?.alwaysVisible &&
          sectionVisibilityField &&
          sectionVisibilityOption
            ? {
                fieldId: sectionVisibilityField,
                optionId: sectionVisibilityOption,
              }
            : undefined,
      },
      children: newSection.children || [],
    };

    let updatedSections: FormSectionsType;

    if (sectionId) {
      updatedSections = sections.map((s) =>
        s.container.id === section.container.id ? section : s
      );
    } else {
      updatedSections = [...sections, section];
    }

    startTransition(async () => {
      const result = await updateFormFields({
        formId,
        formSections: updatedSections,
      });

      if (result.message === "success") {
        toast.success(
          sectionId
            ? "Section updated successfully"
            : "Section created successfully"
        );
        onSectionsUpdate(updatedSections);
        resetSectionForm();
        // window.location.reload();
      } else {
        toast.error(result.error || "Failed to save section");
      }
    });
  };

  const performDeleteField = async (
    fieldId: string | number,
    containerId: string
  ) => {
    const updatedSections = sections.map((section) => {
      if (section.container.id === containerId) {
        return {
          ...section,
          children: section.children.filter((child) => child.id !== fieldId),
        };
      }
      return section;
    });

    startTransition(async () => {
      const result = await updateFormFields({
        formId,
        formSections: updatedSections,
      });

      if (result.message === "success") {
        toast.success("Field deleted successfully");
        onSectionsUpdate(updatedSections);
        // window.location.reload();
      } else {
        toast.error(result.error || "Failed to delete field");
      }
    });
  };

  const performDeleteSection = async (sectionId: string) => {
    const updatedSections = sections.filter(
      (s) => s.container.id !== sectionId
    );

    startTransition(async () => {
      const result = await updateFormFields({
        formId,
        formSections: updatedSections,
      });

      if (result.message === "success") {
        toast.success("Section deleted successfully");
        onSectionsUpdate(updatedSections);
        // window.location.reload();
      } else {
        toast.error(result.error || "Failed to delete section");
      }
    });
  };

  const performDuplicateField = async (field: FormSectionChildrenType) => {
    const newField: FormSectionChildrenType = {
      ...field,
      id: `field_${Date.now()}`,
      labelName: `${field.labelName} (Copy)`,
    };

    const updatedSections = sections.map((section) => {
      if (section.container.id === field.containerId) {
        return {
          ...section,
          children: [...section.children, newField],
        };
      }
      return section;
    });

    startTransition(async () => {
      const result = await updateFormFields({
        formId,
        formSections: updatedSections,
      });

      if (result.message === "success") {
        toast.success("Field duplicated successfully");
        onSectionsUpdate(updatedSections);
        // window.location.reload();
      } else {
        toast.error(result.error || "Failed to duplicate field");
      }
    });
  };

  const handleSaveField = (fieldId?: string | number) => {
    if (!newField.labelName || !newField.containerId) {
      toast.error("Please fill in all required fields");
      return;
    }
    setConfirmationAction({ type: "save-field", fieldId });
  };

  const handleSaveSection = (sectionId?: string) => {
    if (!newSection.container?.heading) {
      toast.error("Please enter a section heading");
      return;
    }
    setConfirmationAction({ type: "save-section", sectionId });
  };

  const handleDeleteField = (fieldId: string | number, containerId: string) => {
    setConfirmationAction({ type: "delete-field", fieldId, containerId });
  };

  const handleDeleteSection = (sectionId: string) => {
    setConfirmationAction({ type: "delete-section", sectionId });
  };

  const duplicateField = (field: FormSectionChildrenType) => {
    setConfirmationAction({ type: "duplicate-field", field });
  };

  const resetFieldForm = () => {
    setNewField({
      controlName: "text-field",
      displayText: "Text Field",
      description: "",
      labelName: "",
      itemType: "control",
      icon: "fas fa-text-height",
      required: false,
      category: "text-elements",
      containerId: "",
      placeholder: "",
      dataType: "text",
    });
    setEditingFieldId(null);
    setIsCreatingField(false);
  };

  const resetSectionForm = () => {
    setNewSection({
      container: {
        controlName: "step-container",
        displayText: "Workflow Step",
        itemType: "container",
        icon: "fa fa-building",
        heading: "",
        subHeading: "",
        id: `section_${Date.now()}`,
        alwaysVisible: true,
      },
      children: [],
    });
    setSectionVisibilityField(null);
    setSectionVisibilityOption(null);
    setEditingSectionId(null);
    setIsCreatingSection(false);
  };

  const handleEditField = (field: FormSectionChildrenType) => {
    if (isSystemField(field.labelName)) {
      toast.error("System fields cannot be edited");
      return;
    }
    setNewField(field);
    setEditingFieldId(field.id);
  };

  const handleEditSection = (section: FormSectionType) => {
    setNewSection(section);
    setEditingSectionId(section.container.id);

    // Load existing visibility conditions if any
    if (section.container.visibilityCondition) {
      setSectionVisibilityField(section.container.visibilityCondition.fieldId);
      setSectionVisibilityOption(
        section.container.visibilityCondition.optionId
      );
    } else {
      setSectionVisibilityField(null);
      setSectionVisibilityOption(null);
    }
  };

  const addOption = () => {
    const currentItems = newField.items || [];
    setNewField({
      ...newField,
      items: [
        ...currentItems,
        { id: `opt_${Date.now()}`, label: "", value: "" },
      ],
    });
  };

  const updateOption = (
    index: number,
    field: keyof FormSectionChildrenItemsType,
    value: string
  ) => {
    const currentItems = newField.items || [];
    const updatedItems = [...currentItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setNewField({ ...newField, items: updatedItems });
  };

  const removeOption = (index: number) => {
    const currentItems = newField.items || [];
    setNewField({
      ...newField,
      items: currentItems.filter((_, i) => i !== index),
    });
  };

  // Get all fields that have options (for conditional visibility)
  const fieldsWithOptions = sections.flatMap((section) =>
    section.children.filter(
      (child) =>
        child.items &&
        child.items.length > 0 &&
        ["checklist", "radio-group"].includes(child.controlName)
    )
  );

  // Get options for selected visibility field
  const visibilityFieldOptions = sectionVisibilityField
    ? fieldsWithOptions.find((f) => f.id === sectionVisibilityField)?.items ||
      []
    : [];

  const allFields = sections.flatMap((section) =>
    section.children.map((child) => ({
      ...child,
      sectionTitle: section.container.heading,
    }))
  );

  const { title: confirmTitle, description: confirmDescription } =
    getConfirmationMessage();

  const renderFieldEditor = (field?: FormSectionChildrenType) => {
    const isEditing = field && editingFieldId === field.id;

    return (
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {isEditing ? "Edit Field" : "Create New Field"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="field-label">Field Label *</Label>
              <Input
                id="field-label"
                value={newField.labelName}
                onChange={(e) =>
                  setNewField({
                    ...newField,
                    labelName: e.target.value,
                  })
                }
                placeholder="Enter field label"
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="field-type">Field Type *</Label>
              <Select
                value={newField.controlName}
                onValueChange={(value) =>
                  setNewField({
                    ...newField,
                    controlName: value,
                  })
                }
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text-field">Text Input</SelectItem>
                  <SelectItem value="multiline-text-field">
                    Text Area
                  </SelectItem>
                  <SelectItem value="checklist">Checkbox Group</SelectItem>
                  <SelectItem value="radio-group">Radio Group</SelectItem>
                  <SelectItem value="file-upload">File Upload</SelectItem>
                  <SelectItem value="date-field">Date Field</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="field-description">Description</Label>
            <Textarea
              id="field-description"
              value={newField.description}
              onChange={(e) =>
                setNewField({
                  ...newField,
                  description: e.target.value,
                })
              }
              placeholder="Optional description or helper text"
              rows={2}
              disabled={isPending}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="field-section">Section *</Label>
              <Select
                value={newField.containerId}
                onValueChange={(value) =>
                  setNewField({ ...newField, containerId: value })
                }
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem
                      key={section.container.id}
                      value={section.container.id}
                    >
                      {section.container.heading}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="field-placeholder">Placeholder</Label>
              <Input
                id="field-placeholder"
                value={newField.placeholder}
                onChange={(e) =>
                  setNewField({
                    ...newField,
                    placeholder: e.target.value,
                  })
                }
                placeholder="Input placeholder text"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="field-required"
              checked={newField.required}
              onCheckedChange={(checked) =>
                setNewField({ ...newField, required: !!checked })
              }
              disabled={isPending}
            />
            <Label htmlFor="field-required">Required field</Label>
          </div>

          {/* Options for checklist/radio types */}
          {["checklist", "radio-group"].includes(newField.controlName!) && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Options</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  disabled={isPending}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Option
                </Button>
              </div>
              <div className="space-y-2">
                {(newField.items || []).map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={item.label}
                      onChange={(e) =>
                        updateOption(index, "label", e.target.value)
                      }
                      placeholder="Option label"
                      className="flex-1"
                      disabled={isPending}
                    />
                    <Input
                      value={item.value}
                      onChange={(e) =>
                        updateOption(index, "value", e.target.value)
                      }
                      placeholder="Option value"
                      className="flex-1"
                      disabled={isPending}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeOption(index)}
                      disabled={isPending}
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
            <Button
              variant="outline"
              onClick={resetFieldForm}
              disabled={isPending}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button
              onClick={() => handleSaveField(field?.id)}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  {isEditing ? "Update Field" : "Create Field"}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSectionEditor = (section?: FormSectionType) => {
    const isEditing = section && editingSectionId === section.container.id;

    return (
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {isEditing ? "Edit Section" : "Create New Section"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="section-heading">Section Heading *</Label>
            <Input
              id="section-heading"
              value={newSection.container?.heading}
              onChange={(e) =>
                setNewSection({
                  ...newSection,
                  container: {
                    ...newSection.container!,
                    heading: e.target.value,
                  },
                })
              }
              placeholder="Enter section heading"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="section-subheading">Sub-Heading</Label>
            <Textarea
              id="section-subheading"
              value={newSection.container?.subHeading}
              onChange={(e) =>
                setNewSection({
                  ...newSection,
                  container: {
                    ...newSection.container!,
                    subHeading: e.target.value,
                  },
                })
              }
              placeholder="Optional section sub-heading"
              rows={2}
              disabled={isPending}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="section-always-visible"
              checked={newSection.container?.alwaysVisible}
              onCheckedChange={(checked) => {
                setNewSection({
                  ...newSection,
                  container: {
                    ...newSection.container!,
                    alwaysVisible: !!checked,
                  },
                });
                // Reset visibility conditions when toggling
                if (checked) {
                  setSectionVisibilityField(null);
                  setSectionVisibilityOption(null);
                }
              }}
              disabled={isPending}
            />
            <Label htmlFor="section-always-visible">Always Visible</Label>
          </div>

          {/* Conditional Visibility Configuration */}
          {!newSection.container?.alwaysVisible && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <h4 className="text-sm font-medium">Conditional Visibility</h4>
              <p className="text-sm text-muted-foreground">
                This section will only be visible when a specific option is
                selected
              </p>

              <div className="space-y-2">
                <Label htmlFor="visibility-field">
                  Becomes visible when this question is selected *
                </Label>
                <Select
                  value={sectionVisibilityField || ""}
                  onValueChange={(value) => {
                    setSectionVisibilityField(value);
                    setSectionVisibilityOption(null); // Reset option when field changes
                  }}
                  disabled={isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a question" />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldsWithOptions.map((field) => (
                      <SelectItem key={field.id} value={field.id.toString()}>
                        {field.labelName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {sectionVisibilityField && (
                <div className="space-y-2">
                  <Label htmlFor="visibility-option">
                    When this option is selected *
                  </Label>
                  <Select
                    value={sectionVisibilityOption || ""}
                    onValueChange={setSectionVisibilityOption}
                    disabled={isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {visibilityFieldOptions.map((option) => (
                        <SelectItem
                          key={option.id}
                          value={option.id.toLocaleString()}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          <Separator />

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={resetSectionForm}
              disabled={isPending}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button
              onClick={() => handleSaveSection(section?.container.id)}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  {isEditing ? "Update Section" : "Create Section"}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <TooltipProvider>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="flex items-center gap-2"
              disabled={isPending}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Form
            </Button>
            <div className="space-y-1">
              <h1 className="text-3xl">Form Administration</h1>
              <p className="text-muted-foreground">
                Manage fields, sections, and form configuration
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="secondary"
              className="flex items-center gap-1 text-xs"
            >
              <Settings className="h-3 w-3" />
              Admin Mode
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="fields" disabled={isPending}>
              Fields Management
            </TabsTrigger>
            <TabsTrigger value="sections" disabled={isPending}>
              Sections Management
            </TabsTrigger>
            <TabsTrigger value="faqs" disabled={isPending}>
              FAQ Management
            </TabsTrigger>
            <TabsTrigger value="email" disabled={isPending}>
              Email Configuration
            </TabsTrigger>
            <TabsTrigger value="database" disabled={isPending}>
              Database Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fields" className="space-y-6">
            {/* Fields Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl">Fields ({allFields.length})</h2>
                <p className="text-muted-foreground">
                  Add, edit, and manage form fields
                </p>
              </div>
              <Button
                onClick={() => setIsCreatingField(true)}
                className="flex items-center gap-2"
                disabled={isPending}
              >
                <Plus className="h-4 w-4" />
                Add Field
              </Button>
            </div>

            {/* Create Field Form (at top) */}
            {isCreatingField && !editingFieldId && renderFieldEditor()}

            {/* Fields List */}
            <div className="space-y-3">
              {allFields.map((field) => {
                const isSystem = isSystemField(field.labelName);

                return (
                  <div key={field.id}>
                    {editingFieldId === field.id ? (
                      renderFieldEditor(field)
                    ) : (
                      <Card
                        className={
                          isSystem ? "border-blue-200 bg-blue-50/50" : ""
                        }
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {isSystem && (
                                  <Lock className="h-4 w-4 text-blue-600" />
                                )}
                                <h3 className="font-medium">
                                  {field.labelName}
                                </h3>
                                {isSystem && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-blue-100 text-blue-700 border-blue-300"
                                  >
                                    System Field
                                  </Badge>
                                )}
                                {field.required && (
                                  <Badge
                                    variant="destructive"
                                    className="text-xs"
                                  >
                                    Required
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {field.controlName}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {field.sectionTitle}
                                </Badge>
                              </div>
                              {field.description && (
                                <p className="text-sm text-muted-foreground">
                                  {field.description}
                                </p>
                              )}
                              {field.items && field.items.length > 0 && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                  Options:{" "}
                                  {field.items
                                    .map((item) => item.label)
                                    .join(", ")}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {!isSystem && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => duplicateField(field)}
                                    title="Duplicate field"
                                    disabled={isPending}
                                    className="hover:text-inherit"
                                  >
                                    <Copy className="h-4 w-4 text-grey-300" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditField(field)}
                                    disabled={isPending}
                                    className="text-blue-500 hover:text-inherit"
                                  >
                                    <Edit className="h-4 w-4 hover:text-inherit" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleDeleteField(
                                        field.id,
                                        field.containerId
                                      )
                                    }
                                    className="hover:text-inherit"
                                    disabled={isPending}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </>
                              )}
                              {isSystem && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600">
                                      <Lock className="h-3 w-3" />
                                      <span>Protected</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      System fields cannot be edited or deleted
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="sections" className="space-y-6">
            {/* Sections Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl">Sections ({sections.length})</h2>
                <p className="text-muted-foreground">
                  Organize fields into logical sections
                </p>
              </div>
              <Button
                onClick={() => setIsCreatingSection(true)}
                className="flex items-center gap-2"
                disabled={isPending}
              >
                <Plus className="h-4 w-4" />
                Add Section
              </Button>
            </div>

            {/* Create Section Form (at top) */}
            {isCreatingSection && !editingSectionId && renderSectionEditor()}

            {/* Sections List */}
            <div className="space-y-3">
              {sections.map((section) => {
                const sectionFields = section.children.length;
                const hasVisibilityCondition =
                  section.container.visibilityCondition;

                return (
                  <div key={section.container.id}>
                    {editingSectionId === section.container.id ? (
                      renderSectionEditor(section)
                    ) : (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium">
                                  {section.container.heading}
                                </h3>
                                {section.container.alwaysVisible && (
                                  <Badge variant="outline" className="text-xs">
                                    Always Visible
                                  </Badge>
                                )}
                                {hasVisibilityCondition && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Conditional
                                  </Badge>
                                )}
                                <Badge variant="secondary" className="text-xs">
                                  {sectionFields} fields
                                </Badge>
                              </div>
                              {section.container.subHeading && (
                                <p className="text-sm text-muted-foreground">
                                  {section.container.subHeading}
                                </p>
                              )}
                              {hasVisibilityCondition && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  Visible when:{" "}
                                  {(() => {
                                    const field = allFields.find(
                                      (f) =>
                                        f.id.toString() ===
                                        section.container.visibilityCondition
                                          ?.fieldId
                                    );
                                    const option = field?.items?.find(
                                      (item) =>
                                        item.id ===
                                        section.container.visibilityCondition
                                          ?.optionId
                                    );
                                    return field && option
                                      ? `"${field.labelName}" = "${option.label}"`
                                      : "Unknown condition";
                                  })()}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditSection(section)}
                                disabled={isPending}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDeleteSection(section.container.id)
                                }
                                className="text-destructive hover:text-destructive"
                                disabled={isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="faqs" className="space-y-6">
            <FAQManagement sections={sections} formId={2} />
          </TabsContent>

          <TabsContent value="email" className="space-y-6">
            <EmailConfiguration />
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            <DatabaseManagement />
          </TabsContent>
        </Tabs>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={!!confirmationAction}
        onOpenChange={(open) => !open && setConfirmationAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeAction} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
