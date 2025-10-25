"use client";

import { useEffect, useState } from "react";
import FormList from "@/app/forms/FormList";

type FormSummary = {
  id: number;
  name: string | null;
  createdAt?: string | null;
};

const Page = () => {
  const [forms, setForms] = useState<FormSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchForms = async () => {
      try {
        const response = await fetch("/api/forms", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = (await response.json()) as {
          forms?: FormSummary[];
        };

        if (!isMounted) {
          return;
        }

        setForms(payload.forms ?? []);
      } catch (error) {
        console.error("Failed to fetch forms", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchForms();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div>
      <h1 className="m-5 px-4 text-4xl font-normal">My Forms</h1>
      {isLoading ? <p className="px-4">Loading forms...</p> : <FormList forms={forms} />}
    </div>
  );
};

export default Page;
