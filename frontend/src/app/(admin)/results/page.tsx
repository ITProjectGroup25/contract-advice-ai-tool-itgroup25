"use client";

import { NextUIProvider } from "@nextui-org/react";
import { useEffect, useState } from "react";

import FormsPicker from "./FormPicker";
import Res from "./Res";
import type { SubmissionColumn, SubmissionRow, SubmissionTable } from "./types";

type FormSelectOption = {
  label: string;
  value: number;
};

const Page = () => {
  const [selectOptions, setSelectOptions] = useState<FormSelectOption[]>([]);
  const [data, setData] = useState<SubmissionTable | null>(null);
  const [cols, setCols] = useState<SubmissionColumn[]>([]);
  const [rows, setRows] = useState<SubmissionRow[]>([]);

  useEffect(() => {
    let isMounted = true;

    const fetchForms = async () => {
      try {
        const response = await fetch("/api/forms", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = (await response.json()) as {
          forms?: Array<{ id: number; name: string | null }>;
        };

        if (!isMounted) {
          return;
        }

        const options = (payload.forms ?? []).map((form) => ({
          label: form.name ?? `Form ${form.id}`,
          value: form.id,
        }));

        setSelectOptions(options);
      } catch (err) {
        console.error("Failed to load forms", err);
      }
    };

    fetchForms();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <NextUIProvider>
      {selectOptions.length > 0 && (
        <FormsPicker
          options={selectOptions}
          setData={setData}
          setCols={setCols}
          setRows={setRows}
        />
      )}
      <Res data={data} cols={cols} rows={rows} />
    </NextUIProvider>
  );
};

export default Page;
