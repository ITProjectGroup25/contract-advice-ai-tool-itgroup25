"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { GrantTeamEmailData, emailService } from "../_utils/emailService";
import { localDB } from "../_utils/localDatabase";
import { ChatBot } from "./chatbot/ChatBot";
import { prefetchFaqs, prefetchSubmission } from "./chatbot/useGetFaq";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface SimpleQueryResponseProps {
  onBack: () => void;
  onSatisfied: () => void;
  onNeedHumanHelp: () => void;
  submissionId?: string;
  formId: number;
}

export function SimpleQueryResponse({
  onBack,
  onSatisfied,
  onNeedHumanHelp,
  submissionId,
  formId,
}: SimpleQueryResponseProps) {
  const queryClient = useQueryClient();
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (!formId) {
      return;
    }

    void prefetchFaqs(queryClient, formId);
  }, [formId, queryClient]);

  useEffect(() => {
    if (!submissionId) {
      return;
    }

    void prefetchSubmission(queryClient, submissionId);
  }, [queryClient, submissionId]);

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
    if (!submissionId) {
      onNeedHumanHelp();
      return;
    }

    let submission = null;
    try {
      submission = await localDB.getSubmission(submissionId);
    } catch (error) {
      console.warn("Failed to load submission before escalation:", error);
    }

    const formData = submission?.formData ?? {};
    const resolveField = (...keys: string[]) => {
      for (const key of keys) {
        const value = formData[key];
        if (typeof value === "string" && value.trim().length > 0) {
          return value.trim();
        }
      }
      return undefined;
    };

    const userEmail = resolveField(
      "email",
      "Email",
      "Email Address",
      "emailAddress",
      "contactEmail",
      "Your Email",
      "User Email"
    );

    const userName = resolveField(
      "name",
      "Name",
      "fullName",
      "Full Name",
      "contactName",
      "Your Name",
      "User Name"
    );

    try {
      await localDB.updateSubmission(submissionId, {
        userSatisfied: false,
        needsHumanReview: true,
        status: "escalated",
      });
    } catch (error) {
      console.error("Error updating submission:", error);
    }

    if (userEmail && userName) {
      try {
        const grantTeamEmailData: GrantTeamEmailData = {
          submissionId,
          queryType: "escalated",
          userEmail,
          userName,
          timestamp: new Date().toISOString(),
          formData,
        };

        const grantEmailSent = await emailService.sendGrantTeamNotification(grantTeamEmailData);
        if (!grantEmailSent) {
          console.warn("Grant team escalation email was not sent");
        }
      } catch (grantEmailError) {
        console.error("Grant team escalation email failed:", grantEmailError);
      }
    } else {
      console.warn("Grant team email skipped - missing user contact details", {
        submissionId,
        hasEmail: !!userEmail,
        hasName: !!userName,
      });
    }

    onNeedHumanHelp();
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

      <ChatBot 
        submissionId={submissionId}
        formId={formId}
        onSatisfied={handleSatisfied}
        onNeedHelp={handleNeedHelp}
      />
    </div>
  );
}

