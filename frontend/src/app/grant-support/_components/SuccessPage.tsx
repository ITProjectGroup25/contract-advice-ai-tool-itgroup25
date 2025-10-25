"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { CheckCircle, ArrowLeft, FileText, Clock } from "lucide-react";

interface SuccessPageProps {
  onBack: () => void;
  type?: "complex" | "simple-escalated";
}

export function SuccessPage({ onBack, type = "complex" }: SuccessPageProps) {
  const isSimpleEscalated = type === "simple-escalated";

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2 border border-white bg-green-700 px-4 py-2 text-white hover:bg-green-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Form
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl">Referral Request</h1>
          <p className="text-muted-foreground">
            {isSimpleEscalated
              ? "Your query has been escalated for human review"
              : "Your complex referral has been submitted successfully"}
          </p>
        </div>
      </div>

      <Card className="text-center">
        <CardContent className="pb-8 pt-8">
          <div className="flex flex-col items-center space-y-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl text-green-700">Successfully Submitted!</h2>
              <p className="text-muted-foreground max-w-md">
                {isSimpleEscalated
                  ? "Your simple query has been forwarded to our grants team for personalized assistance since the automated response didn&apos;t fully address your needs."
                  : "Your complex referral request has been received and will be processed by our team."}
              </p>
            </div>

            {isSimpleEscalated && (
              <div className="max-w-2xl rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Your original simple query and responses have been
                  automatically included in this escalation to provide context to our team.
                </p>
              </div>
            )}

            <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5" />
                    What&apos;s Next?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground text-sm">
                    {isSimpleEscalated
                      ? "Our grants team will review your query and the automated response, then provide personalized guidance tailored to your specific situation."
                      : "Our team will review your complex referral and get back to you with detailed guidance and support."}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground text-sm">
                    {isSimpleEscalated
                      ? "You can expect a personalized response within 1-2 business days since this was escalated from our automated system."
                      : "You can expect a response within 3-5 business days. Urgent requests will be prioritized accordingly."}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <Button onClick={onBack} size="lg">
                Submit Another Request
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
