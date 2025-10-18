"use client";

import {
  ArrowLeft,
  Copy,
  Edit,
  Plus,
  Save,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { DatabaseManagement } from "./DatabaseManagement";
import { EmailConfiguration } from "./EmailConfiguration";
import {
  FormSectionChildrenItemsType,
  FormSectionChildrenType,
  FormSectionType,
  FormSectionsType,
} from "./types";
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

interface AdminInterfaceProps {
  onBack: () => void;
  sections: FormSectionsType;
  onSectionsUpdate: (sections: FormSectionsType) => void;
}

export function AdminInterface({
  onBack,
  sections,
  onSectionsUpdate,
}: AdminInterfaceProps) {
  const [editingField, setEditingField] =
    useState<FormSectionChildrenType | null>(null);
  const [editingSection, setEditingSection] = useState<FormSectionType | null>(
    null
  );
  const [isCreatingField, setIsCreatingField] = useState(false);
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [activeTab, setActiveTab] = useState("fields");

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

  const handleSaveField = () => {
    if (!newField.labelName || !newField.containerId) return;

    const field: FormSectionChildrenType = {
      controlName: newField.controlName!,
      displayText: newField.displayText!,
      description: newField.description!,
      labelName: newField.labelName!,
      itemType: newField.itemType!,
      icon: newField.icon!,
      required: newField.required!,
      category: newField.category!,
      id: editingField?.id || `field_${Date.now()}`,
      containerId: newField.containerId!,
      placeholder: newField.placeholder,
      rows: newField.rows,
      dataType: newField.dataType,
      items: newField.items,
      containersToMakeVisible: newField.containersToMakeVisible,
    };

    const updatedSections = sections.map((section) => {
      if (section.container.id === field.containerId) {
        if (editingField) {
          // Update existing field
          return {
            ...section,
            children: section.children.map((child) =>
              child.id === field.id ? field : child
            ),
          };
        } else {
          // Add new field
          return {
            ...section,
            children: [...section.children, field],
          };
        }
      }
      return section;
    });

    onSectionsUpdate(updatedSections);
    resetFieldForm();
  };

  const handleSaveSection = () => {
    if (!newSection.container?.heading) return;

    const section: FormSectionType = {
      container: {
        ...newSection.container!,
        id: newSection.container.id || `section_${Date.now()}`,
      },
      children: newSection.children || [],
    };

    if (editingSection) {
      onSectionsUpdate(
        sections.map((s) =>
          s.container.id === section.container.id ? section : s
        )
      );
    } else {
      onSectionsUpdate([...sections, section]);
    }

    resetSectionForm();
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
    setEditingField(null);
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
    setEditingSection(null);
    setIsCreatingSection(false);
  };

  const handleEditField = (field: FormSectionChildrenType) => {
    setNewField(field);
    setEditingField(field);
    setIsCreatingField(true);
  };

  const handleEditSection = (section: FormSectionType) => {
    setNewSection(section);
    setEditingSection(section);
    setIsCreatingSection(true);
  };

  const handleDeleteField = (fieldId: string | number, containerId: string) => {
    const updatedSections = sections.map((section) => {
      if (section.container.id === containerId) {
        return {
          ...section,
          children: section.children.filter((child) => child.id !== fieldId),
        };
      }
      return section;
    });
    onSectionsUpdate(updatedSections);
  };

  const handleDeleteSection = (sectionId: string) => {
    onSectionsUpdate(sections.filter((s) => s.container.id !== sectionId));
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

  const duplicateField = (field: FormSectionChildrenType) => {
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

    onSectionsUpdate(updatedSections);
  };

  const allFields = sections.flatMap((section) =>
    section.children.map((child) => ({
      ...child,
      sectionTitle: section.container.heading,
    }))
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="fields">Fields Management</TabsTrigger>
          <TabsTrigger value="sections">Sections Management</TabsTrigger>
          <TabsTrigger value="email">Email Configuration</TabsTrigger>
          <TabsTrigger value="database">Database Management</TabsTrigger>
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
            >
              <Plus className="h-4 w-4" />
              Add Field
            </Button>
          </div>

          {/* Field Form */}
          {isCreatingField && (
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {editingField ? "Edit Field" : "Create New Field"}
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
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text-field">Text Input</SelectItem>
                        <SelectItem value="multiline-text-field">
                          Text Area
                        </SelectItem>
                        <SelectItem value="checklist">
                          Checkbox Group
                        </SelectItem>
                        <SelectItem value="radio-group">Radio Group</SelectItem>
                        <SelectItem value="file-upload">File Upload</SelectItem>
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
                  />
                  <Label htmlFor="field-required">Required field</Label>
                </div>

                {/* Options for checklist/radio types */}
                {["checklist", "radio-group"].includes(
                  newField.controlName!
                ) && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label>Options</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addOption}
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
                          />
                          <Input
                            value={item.value}
                            onChange={(e) =>
                              updateOption(index, "value", e.target.value)
                            }
                            placeholder="Option value"
                            className="flex-1"
                          />
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
                  <Button variant="outline" onClick={resetFieldForm}>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button onClick={handleSaveField}>
                    <Save className="h-4 w-4 mr-1" />
                    {editingField ? "Update" : "Create"} Field
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fields List */}
          <div className="space-y-3">
            {allFields.map((field) => (
              <Card key={field.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{field.labelName}</h3>
                        {field.required && (
                          <Badge variant="destructive" className="text-xs">
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
                          {field.items.map((item) => item.label).join(", ")}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => duplicateField(field)}
                        title="Duplicate field"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditField(field)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleDeleteField(field.id, field.containerId)
                        }
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
            >
              <Plus className="h-4 w-4" />
              Add Section
            </Button>
          </div>

          {/* Section Form */}
          {isCreatingSection && (
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {editingSection ? "Edit Section" : "Create New Section"}
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
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="section-always-visible"
                    checked={newSection.container?.alwaysVisible}
                    onCheckedChange={(checked) =>
                      setNewSection({
                        ...newSection,
                        container: {
                          ...newSection.container!,
                          alwaysVisible: !!checked,
                        },
                      })
                    }
                  />
                  <Label htmlFor="section-always-visible">Always Visible</Label>
                </div>

                <Separator />

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={resetSectionForm}>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button onClick={handleSaveSection}>
                    <Save className="h-4 w-4 mr-1" />
                    {editingSection ? "Update" : "Create"} Section
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sections List */}
          <div className="space-y-3">
            {sections.map((section) => {
              const sectionFields = section.children.length;
              return (
                <Card key={section.container.id}>
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
                          <Badge variant="secondary" className="text-xs">
                            {sectionFields} fields
                          </Badge>
                        </div>
                        {section.container.subHeading && (
                          <p className="text-sm text-muted-foreground">
                            {section.container.subHeading}
                          </p>
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
                          onClick={() =>
                            handleDeleteSection(section.container.id)
                          }
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
