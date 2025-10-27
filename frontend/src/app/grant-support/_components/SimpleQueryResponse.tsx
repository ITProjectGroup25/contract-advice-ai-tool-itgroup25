"use client";

import { AlertCircle, ArrowLeft, Bot, CheckCircle, ThumbsUp } from "lucide-react";
import { useState } from "react";
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

    setShowFeedback(true);
    setTimeout(() => {
      onSatisfied();
    }, 2000);
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

    onNeedHumanHelp();
  };

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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="text-primary h-5 w-5" />
            Grants Assistant Response
          </CardTitle>
          <CardDescription>Automated guidance based on your query</CardDescription>
        </CardHeader>

              
        <ChatBot submissionId={submissionId} />;


        <CardContent className="space-y-6">
      
          <div className="border-t pt-6">
            <h3 className="mb-4 text-lg">Was this response helpful?</h3>
            <p className="text-muted-foreground mb-6">
              Please let us know if this automated response resolved your query or if you need
              further assistance from our grants team.
            </p>

            <div className="flex gap-4">
              <Button
                onClick={handleSatisfied}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <ThumbsUp className="h-4 w-4" />
                Yes, this helped!
              </Button>

              <Button
                onClick={handleNeedHelp}
                variant="outline"
                className="flex items-center gap-2 border-orange-200 hover:bg-orange-50"
              >
                <AlertCircle className="h-4 w-4 text-orange-600" />I need human assistance
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> If you selected &quot;I need human assistance,&quot; your
              original form submission will be forwarded to our grants team for manual review.
              You&apos;ll receive a response within 1-2 business days.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
