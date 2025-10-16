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
import type { EmailConfig } from "../_utils/api";

const EMPTY_CONFIG: EmailConfig = {
  serviceId: "",
  templateId: "",
  publicKey: "",
  grantTeamEmail: "",
  grantTeamTemplateId: "",
};

export function EmailConfiguration() {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [config, setConfig] = useState<EmailConfig>(EMPTY_CONFIG);
  const [savedConfig, setSavedConfig] = useState<EmailConfig | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const loaded = await emailService.getConfiguration();
        if (loaded) {
          setConfig(loaded);
          setSavedConfig(loaded);
        }
      } catch (error) {
        console.error("Failed to load email configuration", error);
        toast.error("Unable to load email configuration");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const configSummary = savedConfig ?? config;

  const validate = () => {
    const { serviceId, templateId, publicKey, grantTeamEmail, grantTeamTemplateId } = config;
    if (!serviceId.trim() || !templateId.trim() || !publicKey.trim()) {
      toast.error("Service, template, and public key are required");
      return false;
    }
    if (!grantTeamEmail.trim() || !grantTeamTemplateId.trim()) {
      toast.error("Grant team email and template are required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(grantTeamEmail.trim())) {
      toast.error("Grant team email is invalid");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      await emailService.saveConfiguration({
        serviceId: config.serviceId.trim(),
        templateId: config.templateId.trim(),
        publicKey: config.publicKey.trim(),
        grantTeamEmail: config.grantTeamEmail.trim(),
        grantTeamTemplateId: config.grantTeamTemplateId.trim(),
      });
      emailService.clearCache();
      setSavedConfig({
        serviceId: config.serviceId.trim(),
        templateId: config.templateId.trim(),
        publicKey: config.publicKey.trim(),
        grantTeamEmail: config.grantTeamEmail.trim(),
        grantTeamTemplateId: config.grantTeamTemplateId.trim(),
      });
      toast.success("Email configuration saved");
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save configuration", error);
      toast.error("Unable to save configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (savedConfig) {
      setConfig(savedConfig);
    } else {
      setConfig(EMPTY_CONFIG);
    }
    setIsEditing(false);
  };

  const handleTestEmail = async () => {
    if (isEditing) {
      toast.error("Please save configuration before sending a test email.");
      return;
    }
    if (!savedConfig) {
      toast.error("Configure email settings before testing.");
      return;
    }
    if (!testEmail.trim()) {
      toast.error("Enter a test email address");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail.trim())) {
      toast.error("Test email address is invalid");
      return;
    }

    setIsTesting(true);
    try {
      const success = await emailService.sendConfirmationEmail({
        userEmail: testEmail.trim(),
        userName: "Test User",
        submissionId: `test_${Date.now()}`,
        queryType: "simple",
        timestamp: new Date().toISOString(),
      });
      if (success) {
        toast.success("Test email sent (mock). Check server logs for details.");
      } else {
        toast.error("Test email failed. Check configuration.");
      }
    } catch (error) {
      console.error("Test email failed", error);
      toast.error("Test email failed");
    } finally {
      setIsTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertDescription>Loading email configuration…</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Configuration
          </h2>
          <p className="text-muted-foreground">
            Manage credentials used for confirmation emails and grant team notifications.
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
            {savedConfig ? "Configured" : "Not Configured"}
          </Badge>
        </div>
      </div>

      <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="text-green-800 dark:text-green-200">
              <strong>Email Notifications:</strong> configuration values are stored in Supabase.
            </p>
            <p className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <span className="block">Service ID: {configSummary.serviceId || "—"}</span>
              <span className="block">User Template ID: {configSummary.templateId || "—"}</span>
              <span className="block">Grant Team Email: {configSummary.grantTeamEmail || "—"}</span>
              <span className="block">Grant Team Template ID: {configSummary.grantTeamTemplateId || "—"}</span>
            </p>
          </div>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Current Configuration</CardTitle>
          <CardDescription>Update the EmailJS credentials used by the application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service-id">Service ID</Label>
              {isEditing ? (
                <Input
                  id="service-id"
                  value={config.serviceId}
                  onChange={(event) => setConfig((prev) => ({ ...prev, serviceId: event.target.value }))}
                  placeholder="EmailJS service ID"
                  className="font-mono"
                />
              ) : (
                <div className="p-2 bg-muted rounded border text-sm font-mono">{configSummary.serviceId || "—"}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="public-key">Public Key</Label>
              {isEditing ? (
                <Input
                  id="public-key"
                  value={config.publicKey}
                  onChange={(event) => setConfig((prev) => ({ ...prev, publicKey: event.target.value }))}
                  placeholder="Public key"
                  className="font-mono"
                />
              ) : (
                <div className="p-2 bg-muted rounded border text-sm font-mono">
                  {configSummary.publicKey ? `${configSummary.publicKey.slice(0, 6)}***` : "—"}
                </div>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="template-id">User Confirmation Template ID</Label>
              {isEditing ? (
                <Input
                  id="template-id"
                  value={config.templateId}
                  onChange={(event) => setConfig((prev) => ({ ...prev, templateId: event.target.value }))}
                  placeholder="EmailJS template ID"
                  className="font-mono"
                />
              ) : (
                <div className="p-2 bg-muted rounded border text-sm font-mono">{configSummary.templateId || "—"}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="grant-team-email">Grant Team Email</Label>
              {isEditing ? (
                <Input
                  id="grant-team-email"
                  type="email"
                  value={config.grantTeamEmail}
                  onChange={(event) => setConfig((prev) => ({ ...prev, grantTeamEmail: event.target.value }))}
                  placeholder="grant-team@example.com"
                />
              ) : (
                <div className="p-2 bg-muted rounded border text-sm font-mono">{configSummary.grantTeamEmail || "—"}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="grant-team-template-id">Grant Team Template ID</Label>
              {isEditing ? (
                <Input
                  id="grant-team-template-id"
                  value={config.grantTeamTemplateId}
                  onChange={(event) =>
                    setConfig((prev) => ({ ...prev, grantTeamTemplateId: event.target.value }))
                  }
                  placeholder="EmailJS template ID for grant notifications"
                  className="font-mono"
                />
              ) : (
                <div className="p-2 bg-muted rounded border text-sm font-mono">
                  {configSummary.grantTeamTemplateId || "—"}
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Configuration"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Template</CardTitle>
          <CardDescription>Copy the template used for notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              This template is a starting point; update it to match your EmailJS setup.
            </p>
            <Button variant="outline" size="sm" onClick={() => {
              void navigator.clipboard.writeText(emailTemplate);
              toast.success("Template copied to clipboard");
            }} className="flex items-center gap-2">
              <Copy className="h-4 w-4" />
              Copy Template
            </Button>
          </div>
          <Textarea value={emailTemplate} readOnly className="h-72 font-mono text-sm" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Email</CardTitle>
          <CardDescription>Send a mock confirmation email using the saved configuration.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="test@example.com"
              value={testEmail}
              onChange={(event) => setTestEmail(event.target.value)}
              type="email"
            />
            <Button onClick={handleTestEmail} disabled={isTesting || !testEmail.trim()}>
              {isTesting ? "Sending..." : "Send Test"}
            </Button>
          </div>
          <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
            <AlertDescription>
              Test emails log their output to the console. Integrate your preferred email provider to send actual mail.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
