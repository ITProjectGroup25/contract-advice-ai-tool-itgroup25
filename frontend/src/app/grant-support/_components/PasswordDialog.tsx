"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";
import { Lock, Eye, EyeOff } from "lucide-react";
import { setAdminToken } from "@/lib/admin-token";

interface PasswordDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PasswordDialog({ open, onClose, onSuccess }: PasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError("");

    try {
      // verify password
      const response = await fetch("/api/admin/verify-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        // Store admin token for subsequent API requests
        if (data.token) {
          setAdminToken(data.token);
        }
        setPassword("");
        setIsVerifying(false);
        onSuccess();
        onClose();
      } else {
        setError(data.error || "Incorrect password. Please try again.");
        setPassword("");
        setIsVerifying(false);
      }
    } catch (error) {
      console.error("Password verification error:", error);
      setError("Failed to verify password. Please try again.");
      setPassword("");
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    setError("");
    setShowPassword(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Admin Access Required
          </DialogTitle>
          <DialogDescription>
            Please enter the administrator password to access the admin panel.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-password">Password</Label>
            <div className="relative">
              <Input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="pr-10"
                autoFocus
                disabled={isVerifying}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isVerifying}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isVerifying}>
              Cancel
            </Button>
            <Button type="submit" disabled={!password.trim() || isVerifying}>
              {isVerifying ? "Verifying..." : "Access Admin Panel"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
