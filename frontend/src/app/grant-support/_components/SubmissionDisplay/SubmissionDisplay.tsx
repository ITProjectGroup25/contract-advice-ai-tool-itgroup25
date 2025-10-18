import { ScrollArea } from "@/components/ui/scroll-area";
import { TabsContent } from "@/components/ui/tabs";
import z from "zod";
import SubmissionField from "./SubmissionField/SubmissionField";
import parseFormData from "./parseFormData/parseFormData";

interface SubmissionDisplayProps {
  submission: {
    formData: Record<string, unknown>;
  };
  value?: string;
}

export function SubmissionDisplay({
  submission,
  value = "data",
}: SubmissionDisplayProps) {
  const formData = submission.formData;
  console.log({ formData });

  const correctlyTypedFormData = z.string().parse(formData);

  const cleanedFormData = parseFormData({
    uncleanFormData: correctlyTypedFormData,
  });

  console.log({ cleanedFormData });

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
