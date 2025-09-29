import { FormLayoutComponentChildrenType } from "@/app/forms/edit/[formId]/form-builder-components/types/FormTemplateTypes";
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
  Radio,
  RadioGroup,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import {
  DatePicker,
  LocalizationProvider,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";

export const renderField = (
  field: FormLayoutComponentChildrenType,
  value: any,
  onChange: (value: any) => void
) => {
  switch (field.controlName) {
    case FormControlNames.INPUTTEXTFIELD:
      return (
        <TextField
          type={field.dataType || "text"}
          label={field.labelName + (field.required ? " *" : "")}
          placeholder={field.placeholder}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          helperText={field.description}
          variant="outlined"
          fullWidth
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
