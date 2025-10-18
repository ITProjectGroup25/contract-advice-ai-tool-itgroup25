import z from "zod";

type Args = {
  uncleanFormData: string;
};

export const parsedFormDataSchema = z.record(
  z.union([z.string(), z.array(z.string())])
);
export type ParsedFormDataSchema = z.infer<typeof parsedFormDataSchema>;

function parseFormData({ uncleanFormData }: Args): ParsedFormDataSchema {
  try {
    const cleanedFormData = JSON.parse(uncleanFormData);

    console.log({ cleanedFormData });

    const parsedFormData = parsedFormDataSchema.parse(cleanedFormData);

    return parsedFormData;
  } catch (error) {
    throw new Error(`Failed to parse submission string: ${error}`);
  }
}

export default parseFormData;
