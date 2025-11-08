"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const ADMIN_PANEL_URL = "/grant-support?view=admin&tab=database";
const REDIRECT_DELAY_MS = 3500;

export default function IntegrationsStatusPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const googleStatus = searchParams.get("google");

  useEffect(() => {
    if (googleStatus === "connected") {
      const timer = setTimeout(() => {
        router.replace(ADMIN_PANEL_URL);
      }, REDIRECT_DELAY_MS);

      return () => clearTimeout(timer);
    }
  }, [googleStatus, router]);

  const handleReturn = () => {
    router.replace(ADMIN_PANEL_URL);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-b from-green-50 to-white px-4 text-center">
      <div className="rounded-full bg-white p-4 shadow-md">
        {googleStatus === "connected" ? (
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        ) : (
          <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
        )}
      </div>

      <div className="max-w-xl space-y-2">
        <h1 className="text-3xl font-semibold">
          {googleStatus === "connected" ? "Google Sheets Connected" : "Finishing Google Setup"}
        </h1>
        <p className="text-muted-foreground text-lg">
          {googleStatus === "connected"
            ? "Your Google account is now linked. We are redirecting you back to the admin panel so you can continue exporting submissions."
            : "Please wait while we verify your Google connection. This should only take a moment."}
        </p>
      </div>

      <div className="flex flex-col items-center gap-3">
        <Button onClick={handleReturn} disabled={googleStatus !== "connected"}>
          Return to Database Management
        </Button>
        {googleStatus === "connected" && (
          <p className="text-muted-foreground text-sm">
            You will be redirected automatically in a few seconds.
          </p>
        )}
      </div>
    </div>
  );
}
