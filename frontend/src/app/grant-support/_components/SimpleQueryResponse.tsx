"use client";

import { ArrowLeft, CheckCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { GrantTeamEmailData, emailService } from "../_utils/emailService";
import { localDB } from "../_utils/localDatabase";
import { ChatBot } from "./chatbot/ChatBot";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface SimpleQueryResponseProps {
  onBack: () => void;
  onSatisfied: () => void;
  onNeedHumanHelp: () => void;
  submissionId?: string;
}

export function SimpleQueryResponse({
  onBack,
  onSatisfied,
  onNeedHumanHelp,
  submissionId,
}: SimpleQueryResponseProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const referenceId = useMemo(() => submissionId ?? "", [submissionId]);

  const handleSatisfied = async () => {
    if (submissionId) {
      try {
        await localDB.updateSubmission(submissionId, {
          userSatisfied: true,
          needsHumanReview: false,
          status: "processed",
        });
      } catch (error) {
        console.error("Error updating submission:", error);
      }
    }
    
    // Show feedback page immediately (ChatBot already handled countdown)
    setShowFeedback(true);
    
    // After showing thank you page, redirect to form
    setTimeout(() => {
      onSatisfied(); // This calls handleSimpleQuerySatisfied which goes back to form
    }, 2000); // 2 seconds on thank you page
  };

  const handleNeedHelp = async () => {
    if (submissionId) {
      try {
        await localDB.updateSubmission(submissionId, {
          userSatisfied: false,
          needsHumanReview: true,
          status: "escalated",
        });

        try {
          const submission = await localDB.getSubmission(submissionId);
          if (submission?.formData) {
            const userEmail = submission.formData.email as string | undefined;
            const userName = submission.formData.name as string | undefined;

            if (userEmail && userName) {
              const grantTeamEmailData: GrantTeamEmailData = {
                submissionId,
                queryType: "escalated",
                userEmail,
                userName,
                timestamp: new Date().toISOString(),
                formData: submission.formData,
              };

              const grantEmailSent =
                await emailService.sendGrantTeamNotification(grantTeamEmailData);
              if (!grantEmailSent) {
                console.warn("Grant team escalation email was not sent");
              }
            }
          }
        } catch (grantEmailError) {
          console.error("Grant team escalation email failed:", grantEmailError);
        }
      } catch (error) {
        console.error("Error updating submission:", error);
      }
    }

    // Redirect immediately (ChatBot already handled countdown)
    onNeedHumanHelp(); // This calls handleSimpleQueryNeedHelp which goes to success page
  };

  // Show thank you feedback page after user clicks "Yes, this helped!"
  if (showFeedback) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-4xl items-center justify-center space-y-6 p-6">
        <Card className="p-8 text-center">
          <CardContent className="space-y-4">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="text-2xl">Thank you for your feedback!</h2>
            <p className="text-muted-foreground">
              Great! We&apos;re glad we could help resolve your query.
            </p>
            <p className="text-muted-foreground text-sm">Redirecting you back to the form...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <h1 className="text-2xl">Automated Response</h1>
          <p className="text-muted-foreground">Your simple query has been processed</p>
        </div>
      </div>

      {referenceId && (
        <Card className="border-green-200 bg-white shadow">
          <CardHeader className="pb-4">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-xl">Simple Request Submitted</CardTitle>
              <CardDescription className="max-w-md text-base">
                Your simple request has been submitted successfully. You should receive a response
                within 24 hours.
              </CardDescription>
              <p className="text-sm font-medium text-gray-600">
                Reference ID: <span className="font-semibold text-gray-800">{referenceId}</span>
              </p>
              <Button onClick={onBack} variant="outline">
                Submit Another Request
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      <ChatBot 
        submissionId={submissionId}
        onSatisfied={handleSatisfied}
        onNeedHelp={handleNeedHelp}
      />
    </div>
  );
}
