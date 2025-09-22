"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useEffect } from "react";
import { getUserForms } from "../actions/getUserForms";

type Form = Awaited<ReturnType<typeof getUserForms>>[number];

type Props = {
  forms: Form[];
};

const FormList = (props: Props) => {
  const { forms } = props;

  useEffect(() => {
    // Create a unique key for this page/route
    const currentPath = window.location.pathname;
    const reloadKey = `hasReloaded_${currentPath}`;

    // Check if we've already reloaded for this route in this session
    const hasReloaded = sessionStorage.getItem(reloadKey);

    if (!hasReloaded) {
      // Mark that we're about to reload
      sessionStorage.setItem(reloadKey, "true");
      // Use a small timeout to ensure the sessionStorage is set before reload
      setTimeout(() => {
        window.location.reload();
      }, 1);
    }
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-3 m-5 p-4 gap-4">
      {props.forms.map((form: Form) => (
        <Card
          key={form.id}
          className="max-w-[350px] flex flex-col justify-center"
        >
          <CardHeader>
            <CardTitle className="font-normal">{form.name}</CardTitle>
            <CardDescription>{form.description}</CardDescription>
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
