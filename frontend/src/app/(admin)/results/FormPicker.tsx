"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";
import type { SubmissionColumn, SubmissionRow, SubmissionTable } from "./types";

type FormPickerProps = {
  options: Array<{ label: string; value: number }>;
  setData: (table: SubmissionTable | null) => void;
  setCols: (columns: SubmissionColumn[]) => void;
  setRows: (rows: SubmissionRow[]) => void;
};

const FormsPicker = ({
  options,
  setData,
  setCols,
  setRows,
}: FormPickerProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const fallbackFormId = options[0]?.value ?? 0;
  const formIdParam = searchParams.get("formId");
  const formId = formIdParam ?? String(fallbackFormId);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  // ✅ Wrap getSubmissions in useCallback to stabilize reference
  const getSubmissions = useCallback(
    async (_formId: number): Promise<SubmissionTable | null> => {
      // TODO: Integrate with real form submissions endpoint once available.
      return null;
    },
    [] // no dependencies
  );

  const fetchData = useCallback(
    async (selectedFormId: number) => {
      try {
        const response = await getSubmissions(selectedFormId);
        if (response) {
          setCols(response.columns);
          setRows(response.data);
          setData(response);
        } else {
          setCols([]);
          setRows([]);
          setData(null);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setCols([]);
        setRows([]);
        setData(null);
      }
    },
    [getSubmissions, setCols, setRows, setData]
  );

  useEffect(() => {
    fetchData(Number(formId));
  }, [formId, fetchData]);

  return (
    <div className="flex gap-2 items-center">
      <Label className="font-bold">Select a form</Label>
      <Select
        value={formId}
        onValueChange={(value) => {
          router.push(`${pathname}?${createQueryString("formId", value)}`);
          fetchData(Number(value));
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={options[0]?.label ?? "Select a form"} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default FormsPicker;
