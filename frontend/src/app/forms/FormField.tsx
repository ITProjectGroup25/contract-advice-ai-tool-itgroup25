import { ChangeEvent } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormControl } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { QuestionSelectModel, FieldOptionSelectModel } from "@shared";
import { Label } from "@/components/ui/label";

type SupportedFieldType = "Input" | "Switch" | "Textarea" | "Select" | "RadioGroup";

type Props = {
  element: QuestionSelectModel & {
    fieldOptions: Array<FieldOptionSelectModel>;
  };
  value: string;
  onChange: (value?: string | ChangeEvent<HTMLInputElement>) => void;
};

const components: Record<SupportedFieldType, (params: Props) => JSX.Element> = {
  Input: ({ onChange }) => <Input type="text" onChange={onChange} />,
  Switch: ({ onChange }) => (
    <Switch
      onCheckedChange={(checked: boolean) => {
        onChange(checked ? "true" : "false");
      }}
    />
  ),
  Textarea: ({ onChange }) => (
    <Textarea
      onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
        onChange(event.target.value)
      }
    />
  ),
  Select: ({ element, onChange }) => (
    <Select onValueChange={(value) => onChange(value)}>
      <SelectTrigger>
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        {element.fieldOptions.map((option) => (
          <SelectItem
            key={`${option.text}_${option.id}`}
            value={`answerId_${option.id}`}
          >
            {option.text}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
  RadioGroup: ({ element, onChange }) => (
    <RadioGroup onValueChange={(value) => onChange(value)}>
      {element.fieldOptions.map((option) => (
        <div
          key={`${option.text}_${option.id}`}
          className="flex items-center space-x-2"
        >
          <FormControl>
            <RadioGroupItem
              value={`answerId_${option.id}`}
              id={option?.value?.toString() || `answerId_${option.id}`}
            >
              {option.text}
            </RadioGroupItem>
          </FormControl>
          <Label className="text-base">{option.text}</Label>
        </div>
      ))}
    </RadioGroup>
  ),
};

const isSupportedFieldType = (
  value: QuestionSelectModel["fieldType"],
): value is SupportedFieldType => {
  return value === "Input" ||
    value === "Switch" ||
    value === "Textarea" ||
    value === "Select" ||
    value === "RadioGroup";
};

const FormField = ({ element, value, onChange }: Props) => {
  if (!element || !element.fieldType) {
    return null;
  }

  if (!isSupportedFieldType(element.fieldType)) {
    return null;
  }

  const Component = components[element.fieldType];
  return <Component element={element} value={value} onChange={onChange} />;
};

export default FormField;
