"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

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
    <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-3 m-5 p-4 gap-4">
      {safeForms.map((form) => (
        <Card
          key={form.id}
          className="max-w-[350px] flex flex-col justify-center"
        >
          <CardHeader>
            <CardTitle className="font-normal">
              {form.name ?? "Untitled form"}
            </CardTitle>
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
