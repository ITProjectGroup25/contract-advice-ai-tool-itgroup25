"use client";
// FormParser.tsx - Complete form parsing system in one file
import {
  FormLayoutComponentChildrenType,
  FormLayoutComponentContainerType,
} from "@/app/forms/edit/[formId]/form-builder-components/types/FormTemplateTypes";
import { FormControlNames } from "@/app/forms/edit/[formId]/form-builder-components/utils/formBuilderUtils";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import moment from "moment";
import React, { useState } from "react";

// Main Form Parser Component
interface FormParserProps {
  formTemplate: {
    formName: string;
    id: number;
    formLayoutComponents: Array<{
      container: FormLayoutComponentContainerType;
      children: FormLayoutComponentChildrenType[];
    }>;
  };
  onSubmit?: (formData: Record<string, any>) => void;
}

const FormParser: React.FC<FormParserProps> = ({ formTemplate, onSubmit }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState(0);

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleNext = () => {
    if (currentStep < formTemplate.formLayoutComponents.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  // Field Renderer Function
  const renderField = (
    field: FormLayoutComponentChildrenType,
    value: any,
    onChange: (value: any) => void
  ) => {
    switch (field.controlName) {
      case FormControlNames.INPUTTEXTFIELD:
        return (
          <TextField
            type={field.dataType || "text"}
            fullWidth
            label={field.labelName + (field.required ? " *" : "")}
            placeholder={field.placeholder}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            helperText={field.description}
            variant="outlined"
          />
        );

      case FormControlNames.INPUTMULTILINE:
        return (
          <TextField
            fullWidth
            multiline
            rows={field.rows || 4}
            label={field.labelName + (field.required ? " *" : "")}
            placeholder={field.placeholder}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            helperText={field.description}
            variant="outlined"
          />
        );

      case FormControlNames.CHECKBOX:
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={value || false}
                onChange={(e) => onChange(e.target.checked)}
              />
            }
            label={field.labelName + (field.required ? " *" : "")}
          />
        );

      case FormControlNames.RADIOGROUP:
        return (
          <FormControl component="fieldset" required={field.required}>
            <FormLabel component="legend">
              {field.labelName + (field.required ? " *" : "")}
            </FormLabel>
            <RadioGroup
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
            >
              {field.items?.map((item) => (
                <FormControlLabel
                  key={item.id}
                  value={item.value}
                  control={<Radio />}
                  label={item.label}
                />
              ))}
            </RadioGroup>
            {field.description && (
              <Typography variant="caption" color="text.secondary">
                {field.description}
              </Typography>
            )}
          </FormControl>
        );

      case FormControlNames.SELECTDROPDOWN:
        return (
          <Box>
            <FormControl fullWidth required={field.required}>
              <InputLabel>
                {field.labelName + (field.required ? " *" : "")}
              </InputLabel>
              <Select
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                label={field.labelName + (field.required ? " *" : "")}
              >
                {field.items?.map((item) => (
                  <MenuItem key={item.id} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {field.description && (
              <Typography variant="caption" color="text.secondary">
                {field.description}
              </Typography>
            )}
          </Box>
        );

      case FormControlNames.DATEFIELD:
        return (
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <DatePicker
              label={field.labelName + (field.required ? " *" : "")}
              value={value ? moment(value) : null}
              onChange={(newValue) =>
                onChange(newValue ? newValue.toDate() : null)
              }
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: field.required,
                  helperText: field.description,
                },
              }}
            />
          </LocalizationProvider>
        );

      case FormControlNames.TIMEFIELD:
        return (
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <TimePicker
              label={field.labelName + (field.required ? " *" : "")}
              value={value ? moment(value) : null}
              onChange={(newValue) =>
                onChange(newValue ? newValue.toDate() : null)
              }
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: field.required,
                  helperText: field.description,
                },
              }}
            />
          </LocalizationProvider>
        );

      case FormControlNames.FILEUPLOAD:
        return (
          <Box>
            <Typography variant="body2" gutterBottom>
              {field.labelName + (field.required ? " *" : "")}
            </Typography>
            <input
              type="file"
              onChange={(e) => onChange(e.target.files?.[0] || null)}
              style={{ display: "none" }}
              id={`file-${field.id}`}
              required={field.required}
            />
            <label htmlFor={`file-${field.id}`}>
              <Button
                variant="outlined"
                component="span"
                startIcon={<i className="fas fa-cloud-upload-alt" />}
              >
                Choose File
              </Button>
            </label>
            {value && (
              <Typography variant="caption" sx={{ ml: 2 }}>
                {value.name}
              </Typography>
            )}
            {field.description && (
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                {field.description}
              </Typography>
            )}
          </Box>
        );

      case FormControlNames.IMAGEUPLOAD:
        return (
          <Box>
            <Typography variant="body2" gutterBottom>
              {field.labelName + (field.required ? " *" : "")}
            </Typography>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onChange(e.target.files?.[0] || null)}
              style={{ display: "none" }}
              id={`image-${field.id}`}
              required={field.required}
            />
            <label htmlFor={`image-${field.id}`}>
              <Button
                variant="outlined"
                component="span"
                startIcon={<i className="far fa-image" />}
              >
                Choose Image
              </Button>
            </label>
            {value && (
              <Typography variant="caption" sx={{ ml: 2 }}>
                {value.name}
              </Typography>
            )}
            {field.description && (
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                {field.description}
              </Typography>
            )}
          </Box>
        );

      case FormControlNames.TOGGLE:
        return (
          <FormControlLabel
            control={
              <Switch
                checked={value || false}
                onChange={(e) => onChange(e.target.checked)}
              />
            }
            label={field.labelName + (field.required ? " *" : "")}
          />
        );

      case FormControlNames.CHECKLIST:
        return (
          <FormControl component="fieldset" required={field.required}>
            <FormLabel component="legend">
              {field.labelName + (field.required ? " *" : "")}
            </FormLabel>
            <FormGroup>
              {field.items?.map((item) => (
                <FormControlLabel
                  key={item.id}
                  control={
                    <Checkbox
                      checked={value?.includes(item.value) || false}
                      onChange={(e) => {
                        const currentValues = value || [];
                        if (e.target.checked) {
                          onChange([...currentValues, item.value]);
                        } else {
                          onChange(
                            currentValues.filter((v: any) => v !== item.value)
                          );
                        }
                      }}
                    />
                  }
                  label={item.label}
                />
              ))}
            </FormGroup>
            {field.description && (
              <Typography variant="caption" color="text.secondary">
                {field.description}
              </Typography>
            )}
          </FormControl>
        );

      case FormControlNames.SIGNATURE:
        return (
          <Box>
            <Typography variant="body2" gutterBottom>
              {field.labelName + (field.required ? " *" : "")}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                // Implement signature capture logic here
                console.log("Open signature capture");
              }}
              sx={{ width: 270, height: 100 }}
            >
              Sign Here
            </Button>
            {field.description && (
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                {field.description}
              </Typography>
            )}
          </Box>
        );

      case FormControlNames.SCANCODE:
        return (
          <Box>
            <Typography variant="body2" gutterBottom>
              {field.labelName + (field.required ? " *" : "")}
            </Typography>
            <input
              style={{ display: "none" }}
              id={`scancode-${field.id}`}
              type="file"
            />
            <label htmlFor={`scancode-${field.id}`}>
              <Button
                variant="outlined"
                component="span"
                startIcon={<i className="fas fa-qrcode" />}
              >
                Scan Code
              </Button>
            </label>
            {field.description && (
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                {field.description}
              </Typography>
            )}
          </Box>
        );

      default:
        return (
          <Box>
            <Typography variant="body2" color="error">
              Unsupported field type: {field.controlName}
            </Typography>
          </Box>
        );
    }
  };

  // Step Renderer Function
  const renderStep = (
    container: FormLayoutComponentContainerType,
    children: FormLayoutComponentChildrenType[],
    isVisible: boolean
  ) => {
    if (!isVisible) return null;

    return (
      <Paper elevation={2} sx={{ p: 3, mb: 3 }} key={container.id}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            {container.heading}
          </Typography>
          {container.subHeading && (
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {container.subHeading}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {children.map((field) => (
            <Box key={field.id}>
              {renderField(field, formData[field.id], (value) =>
                //   @ts-ignore
                handleFieldChange(field.id, value)
              )}
            </Box>
          ))}
        </Box>
      </Paper>
    );
  };

  const isLastStep =
    currentStep === formTemplate.formLayoutComponents.length - 1;
  const isFirstStep = currentStep === 0;

  // Filter visible steps
  const visibleSteps = formTemplate.formLayoutComponents.filter(
    (step) =>
      step.container.alwaysVisible ||
      currentStep === formTemplate.formLayoutComponents.indexOf(step)
  );

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ maxWidth: 800, mx: "auto", p: 3 }}
    >
      <Typography variant="h4" gutterBottom>
        {formTemplate.formName}
      </Typography>

      {/* Render visible steps */}
      {visibleSteps.map((step, index) =>
        renderStep(
          step.container,
          step.children,
          step.container.alwaysVisible || index === 0
        )
      )}

      {/* Navigation buttons */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
        <Button
          variant="outlined"
          onClick={handlePrevious}
          disabled={isFirstStep}
        >
          Previous
        </Button>

        {isLastStep ? (
          <Button type="submit" variant="contained" color="primary">
            Submit
          </Button>
        ) : (
          <Button variant="contained" onClick={handleNext}>
            Next
          </Button>
        )}
      </Box>

      {/* Debug info - remove in production */}
      <Box sx={{ mt: 4, p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Form Data (Debug):
        </Typography>
        <pre style={{ fontSize: "12px", overflow: "auto" }}>
          {JSON.stringify(formData, null, 2)}
        </pre>
      </Box>
    </Box>
  );
};

export default FormParser;
