import { ScrollArea } from "@/components/ui/scroll-area";
import { TabsContent } from "@/components/ui/tabs";
import SubmissionField from "./SubmissionField/SubmissionField";
import { FormValues } from "../types";

interface SubmissionDisplayProps {
  submission: {
    formData: FormValues;
  };
  value?: string;
}

export function SubmissionDisplay({ submission, value = "data" }: SubmissionDisplayProps) {
  const formData = submission.formData;
  console.log({ formData });

  const cleanedFormData = formData;

  return (
    <TabsContent value={value}>
      <ScrollArea className="h-[400px] w-full rounded-md border p-4">
        <div className="space-y-4">
          {Object.entries(cleanedFormData).map(([key, value]) => (
            <SubmissionField key={key} fieldKey={key} value={value} />
          ))}
        </div>
      </ScrollArea>
    </TabsContent>
  );
}
