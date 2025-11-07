"use client";

import { useState } from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { getAdminHeaders } from "@/lib/admin-token";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const MIN_PASSWORD_LENGTH = 8;

export function SettingsPanel() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    setError("");
    setSuccessMessage("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All password fields are required.");
      return;
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`New password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAdminHeaders(),
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || "Failed to update password.");
      }

      toast.success("Admin password updated.");
      setSuccessMessage("Password updated successfully.");
      resetForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update password.";
      toast.error(message);
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const renderPasswordField = ({
    id,
    label,
    value,
    onChange,
    show,
    onToggle,
    placeholder,
  }: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    show: boolean;
    onToggle: () => void;
    placeholder: string;
  }) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={isSaving}
          className="pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={onToggle}
          disabled={isSaving}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <CardTitle>Change Admin Password</CardTitle>
          </div>
          <CardDescription>
            Update the admin password without leaving the management console. Your current password
            is validated before changes are saved in Supabase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {renderPasswordField({
              id: "current-password",
              label: "Current Password",
              value: currentPassword,
              onChange: setCurrentPassword,
              show: showCurrent,
              onToggle: () => setShowCurrent((prev) => !prev),
              placeholder: "Enter current admin password",
            })}

            {renderPasswordField({
              id: "new-password",
              label: "New Password",
              value: newPassword,
              onChange: setNewPassword,
              show: showNew,
              onToggle: () => setShowNew((prev) => !prev),
              placeholder: `At least ${MIN_PASSWORD_LENGTH} characters`,
            })}

            {renderPasswordField({
              id: "confirm-password",
              label: "Confirm New Password",
              value: confirmPassword,
              onChange: setConfirmPassword,
              show: showConfirm,
              onToggle: () => setShowConfirm((prev) => !prev),
              placeholder: "Re-enter new password",
            })}

            <p className="text-sm text-muted-foreground">
              Tip: Use a unique passphrase with letters, numbers, and symbols for best security.
            </p>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert variant="default">
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={resetForm} disabled={isSaving}>
                Reset
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
