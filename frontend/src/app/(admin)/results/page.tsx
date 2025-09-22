"use client";

import { getUserForms } from "@/app/actions/getUserForms";
import { NextUIProvider, TableProps } from "@nextui-org/react";
import { useEffect, useState } from "react";
import FormsPicker from "./FormPicker";
import Res from "./Res";

type Props = {};

type Question = any;

type FormSubmission = any;

const Page = (props: Props) => {
  const [selectOptions, setSelectOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const [data, setData] = useState<TableProps | null>(null);
  const [cols, setCols] = useState<Question[] | null>(null);
  const [rows, setRows] = useState<FormSubmission[] | null>(null);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const userForms = await getUserForms();
        const options: { label: string; value: number }[] = userForms
          .filter((form) => form.name !== null) // Filter out forms with null names
          .map((form) => ({
            label: form.name!,
            value: form.id,
          }));
        setSelectOptions(options);
        console.log("userForms", userForms);
      } catch (err) {
        console.log(err);
      }
    };

    fetchForms();
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
