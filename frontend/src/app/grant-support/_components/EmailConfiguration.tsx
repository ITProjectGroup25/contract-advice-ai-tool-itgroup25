"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Label } from "./ui/label";
import { Mail, CheckCircle, Copy, Settings, Save } from "lucide-react";
import { toast } from "sonner";
import { emailService, emailTemplate } from "../_utils/emailService";

export function EmailConfiguration() {
  const [testEmail, setTestEmail] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [serviceId, setServiceId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [grantTeamEmail, setGrantTeamEmail] = useState("");
  const [grantTeamTemplateId, setGrantTeamTemplateId] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setServiceId(emailService.getServiceId());
    setTemplateId(emailService.getTemplateId());
    setPublicKey(emailService.getPublicKey());
    setGrantTeamEmail(emailService.getGrantTeamEmail());
    setGrantTeamTemplateId(emailService.getGrantTeamTemplateId());
  }, []);

  const configSummary = {
    serviceId: emailService.getServiceId(),
    templateId: emailService.getTemplateId(),
    publicKey: emailService.getPublicKeyMasked(),
    grantTeamEmail: emailService.getGrantTeamEmail(),
    grantTeamTemplateId: emailService.getGrantTeamTemplateId(),
  };

  const testEmailService = async () => {
    if (!testEmail) {
      toast.error("Please enter a test email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsTesting(true);
    try {
      const testData = {
        userEmail: testEmail,
        userName: "Test User",
        submissionId: `test_${Date.now()}`,
        queryType: "simple" as const,
        timestamp: new Date().toISOString(),
      };

      const success = await emailService.sendConfirmationEmail(
        testData,
        emailService.getCurrentConfiguration()
      );
      if (success) {
        toast.success("Test email sent successfully. Please check your inbox.");
      } else {
        toast.error("Failed to send test email.");
      }
    } catch (error) {
      console.error("Test email failed:", error);
      toast.error(`Test failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsTesting(false);
    }
  };

  const validateConfiguration = () => {
    if (!serviceId.trim()) {
      toast.error("Service ID cannot be empty");
      return false;
    }
    if (!templateId.trim()) {
      toast.error("User Confirmation Template ID cannot be empty");
      return false;
    }
    if (!publicKey.trim()) {
      toast.error("Public Key cannot be empty");
      return false;
    }
    if (!grantTeamEmail.trim()) {
      toast.error("Grant Team Email cannot be empty");
      return false;
    }
    if (!grantTeamTemplateId.trim()) {
      toast.error("Grant Team Template ID cannot be empty");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(grantTeamEmail.trim())) {
      toast.error("Please enter a valid grant team email address");
      return false;
    }

    if (templateId.trim() === grantTeamTemplateId.trim()) {
      toast.error("User and grant team template IDs must be different");
      return false;
    }

    return true;
  };

  const handleSaveConfiguration = async () => {
    if (!validateConfiguration()) {
      return;
    }

    setIsSaving(true);
    try {
      emailService.updateServiceId(serviceId.trim());
      emailService.updateTemplateId(templateId.trim());
      emailService.updatePublicKey(publicKey.trim());
      emailService.updateGrantTeamEmail(grantTeamEmail.trim());
      emailService.updateGrantTeamTemplateId(grantTeamTemplateId.trim());
      toast.success("Email configuration updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save configuration:", error);
      toast.error("Failed to save configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setServiceId(emailService.getServiceId());
    setTemplateId(emailService.getTemplateId());
    setPublicKey(emailService.getPublicKey());
    setGrantTeamEmail(emailService.getGrantTeamEmail());
    setGrantTeamTemplateId(emailService.getGrantTeamTemplateId());
    setIsEditing(false);
  };

  const copyTemplate = () => {
    void navigator.clipboard.writeText(emailTemplate);
    toast.success("Email template copied to clipboard");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Configuration
          </h2>
          <p className="text-muted-foreground">
            Manage the EmailJS credentials used for user confirmations and grant team notifications.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => (isEditing ? handleCancelEdit() : setIsEditing(true))}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            {isEditing ? "Cancel Edit" : "Edit Configuration"}
          </Button>
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Configured
          </Badge>
        </div>
      </div>

      <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="text-green-800 dark:text-green-200">
              <strong>EmailJS Configuration Active:</strong> Email notifications are enabled for
              users and the grant team.
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              - Service ID: {configSummary.serviceId}
              <br />- User Confirmation Template ID: {configSummary.templateId}
              <br />- Public Key: {configSummary.publicKey}
              <br />- Grant Team Email: {configSummary.grantTeamEmail}
              <br />- Grant Team Template ID: {configSummary.grantTeamTemplateId}
            </p>
          </div>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Current Configuration</CardTitle>
          <CardDescription>Update your EmailJS service credentials.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="service-id">Service ID</Label>
              {isEditing ? (
                <Input
                  id="service-id"
                  value={serviceId}
                  onChange={(event) => setServiceId(event.target.value)}
                  placeholder="e.g. service_1234567"
                  className="font-mono"
                />
              ) : (
                <div className="bg-muted rounded border p-2 font-mono text-sm">{serviceId}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="public-key">Public Key</Label>
              {isEditing ? (
                <Input
                  id="public-key"
                  value={publicKey}
                  onChange={(event) => setPublicKey(event.target.value)}
                  placeholder="e.g. abcd1234_eFgHiJ-5K"
                  className="font-mono"
                />
              ) : (
                <div className="bg-muted rounded border p-2 font-mono text-sm">
                  {configSummary.publicKey}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-id">User Confirmation Template ID</Label>
              {isEditing ? (
                <Input
                  id="template-id"
                  value={templateId}
                  onChange={(event) => setTemplateId(event.target.value)}
                  placeholder="EmailJS template ID"
                  className="font-mono"
                />
              ) : (
                <div className="bg-muted rounded border p-2 font-mono text-sm">{templateId}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="grant-team-email">Grant Team Email</Label>
              {isEditing ? (
                <Input
                  id="grant-team-email"
                  type="email"
                  value={grantTeamEmail}
                  onChange={(event) => setGrantTeamEmail(event.target.value)}
                  placeholder="grants-team@example.com"
                />
              ) : (
                <div className="bg-muted rounded border p-2 font-mono text-sm">
                  {grantTeamEmail}
                </div>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="grant-team-template-id">Grant Team Template ID</Label>
              {isEditing ? (
                <Input
                  id="grant-team-template-id"
                  value={grantTeamTemplateId}
                  onChange={(event) => setGrantTeamTemplateId(event.target.value)}
                  placeholder="EmailJS template ID for grant notifications"
                  className="font-mono"
                />
              ) : (
                <div className="bg-muted rounded border p-2 font-mono text-sm">
                  {grantTeamTemplateId}
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSaveConfiguration} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Saving..." : "Save Configuration"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Template</CardTitle>
          <CardDescription>Copy the template used for grant team notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              This unified template handles both complex queries and escalated simple queries.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={copyTemplate}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy Template
            </Button>
          </div>
          <Textarea value={emailTemplate} readOnly className="h-96 font-mono text-sm" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Email</CardTitle>
          <CardDescription>Send a test email to verify the current configuration.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="test@example.com"
              value={testEmail}
              onChange={(event) => setTestEmail(event.target.value)}
              type="email"
            />
            <Button onClick={testEmailService} disabled={isTesting || !testEmail}>
              {isTesting ? "Sending..." : "Send Test"}
            </Button>
          </div>
          <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
            <AlertDescription>
              Test emails use Service ID{" "}
              <code className="rounded bg-blue-100 px-1 dark:bg-blue-900">
                {configSummary.serviceId}
              </code>
              and the current template settings.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-muted-foreground text-sm">
            EmailJS credentials are stored locally and can be updated at any time. Users receive
            confirmation emails after submission and the grant team is notified for complex or
            escalated queries.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
