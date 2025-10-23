"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type FormSummary = {
  id: number;
  name: string | null;
  createdAt?: string | null;
};

type Props = {
  forms: FormSummary[];
};

const FormList = ({ forms }: Props) => {
  const safeForms = Array.isArray(forms) ? forms : [];

  return (
    <div className="m-5 grid grid-cols-1 gap-4 p-4 md:grid-cols-2 md:grid-cols-3">
      {safeForms.map((form) => (
        <Card key={form.id} className="flex max-w-[350px] flex-col justify-center">
          <CardHeader>
            <CardTitle className="font-normal">{form.name ?? "Untitled form"}</CardTitle>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Link className="w-1/2" href={`/forms/edit/${form.id}`}>
              <div className="flex justify-center">
                <Button className="w-1/2">View</Button>
              </div>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default FormList;
