import emailjs from "@emailjs/browser";
import { EmailData, GrantTeamEmailData } from "@shared";

const toBoolean = (value?: string | null): boolean => {
  if (!value) {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return ["1", "true", "yes", "on"].includes(normalized);
};

// EmailJS configuration - these should be environment variables in production
const EMAILJS_CONFIG = {
  enabled: toBoolean(process.env.NEXT_PUBLIC_EMAILJS_ENABLED),
  serviceId: (process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? "").trim(),
  templateId: (process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "").trim(),
  publicKey: (process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? "").trim(),
  grantTeamTemplateId: (
    process.env.NEXT_PUBLIC_EMAILJS_GRANT_TEAM_TEMPLATE_ID ?? ""
  ).trim(),
};

class EmailService {
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.initialized || !EMAILJS_CONFIG.enabled) {
      return;
    }

    if (typeof window === "undefined") {
      // Running on the server; defer initialisation to the client.
      return;
    }

    if (!EMAILJS_CONFIG.publicKey) {
      console.warn("[EmailJS] Public key missing - initialisation skipped.");
      return;
    }

    try {
      emailjs.init(EMAILJS_CONFIG.publicKey);
      this.initialized = true;
      console.info("[EmailJS] Initialised successfully.");
    } catch (error) {
      this.initialized = false;
      console.error("[EmailJS] Initialisation failed:", error);
    }
  }

  private ensureReady(context: string): boolean {
    if (!EMAILJS_CONFIG.enabled) {
      console.warn(`[EmailJS] Disabled via NEXT_PUBLIC_EMAILJS_ENABLED - skipping ${context}.`);
      return false;
    }

    if (!this.initialized) {
      this.init();
    }

    if (!this.initialized) {
      console.warn(`[EmailJS] Not initialised - skipping ${context}.`);
      return false;
    }

    if (!this.isConfigured()) {
      console.warn(`[EmailJS] Configuration incomplete - skipping ${context}.`);
      return false;
    }

    return true;
  }

  async sendConfirmationEmail(data: EmailData): Promise<boolean> {
    if (!this.ensureReady("confirmation email")) {
      return false;
    }

    try {
      const templateParams = {
        to_email: data.to,
        user_name: data.submitterName || "User",
        submission_id: data.submissionId || "N/A",
        query_type: data.queryType || "general",
        timestamp: new Date().toLocaleString(),
        subject: data.subject || "Referral Request Confirmation",
        form_data: JSON.stringify(data.formData ?? {}, null, 2),
      };

      console.log("[EmailJS] Sending confirmation email with params:", templateParams);

      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        templateParams
      );

      const success = response.status === 200;
      if (success) {
        console.info("[EmailJS] Confirmation email sent successfully:", response);
      } else {
        console.warn("[EmailJS] Confirmation email returned non-200 status:", response);
      }

      return success;
    } catch (error) {
      console.error("[EmailJS] Failed to send confirmation email:", error);
      return false;
    }
  }

  async sendGrantTeamNotification(data: GrantTeamEmailData): Promise<boolean> {
    if (!this.ensureReady("grant team notification")) {
      return false;
    }

    if (!EMAILJS_CONFIG.grantTeamTemplateId) {
      console.warn("[EmailJS] Grant team template ID missing - skipping grant team notification.");
      return false;
    }

    try {
      const templateParams = {
        user_name: data.submitterName || "Unknown User",
        user_email: data.submitterEmail || "No email provided",
        submission_id: data.submissionId || "N/A",
        query_type: data.queryType || "general",
        grant_teams: Array.isArray(data.grantTeam) ? data.grantTeam.join(", ") : data.grantTeam,
        urgency: data.urgency ? "URGENT" : "Normal",
        timestamp: new Date().toLocaleString(),
        form_data: JSON.stringify(data.formData ?? {}, null, 2),
      };

      console.log("[EmailJS] Sending grant team notification with params:", templateParams);

      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.grantTeamTemplateId,
        templateParams
      );

      const success = response.status === 200;
      if (success) {
        console.info("[EmailJS] Grant team notification sent successfully:", response);
      } else {
        console.warn("[EmailJS] Grant team notification returned non-200 status:", response);
      }

      return success;
    } catch (error) {
      console.error("[EmailJS] Failed to send grant team notification:", error);
      return false;
    }
  }

  async sendCustomEmail(
    templateParams: Record<string, any>,
    templateId?: string
  ): Promise<boolean> {
    if (!this.ensureReady("custom email")) {
      return false;
    }

    const resolvedTemplateId = templateId || EMAILJS_CONFIG.templateId;
    if (!resolvedTemplateId) {
      console.warn("[EmailJS] Template ID missing - skipping custom email.");
      return false;
    }

    try {
      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        resolvedTemplateId,
        templateParams
      );

      const success = response.status === 200;
      if (success) {
        console.info("[EmailJS] Custom email sent successfully:", response);
      } else {
        console.warn("[EmailJS] Custom email returned non-200 status:", response);
      }

      return success;
    } catch (error) {
      console.error("[EmailJS] Failed to send custom email:", error);
      return false;
    }
  }

  isConfigured(): boolean {
    return (
      EMAILJS_CONFIG.enabled &&
      !!EMAILJS_CONFIG.serviceId &&
      !!EMAILJS_CONFIG.templateId &&
      !!EMAILJS_CONFIG.publicKey
    );
  }

  getConfig() {
    return {
      enabled: EMAILJS_CONFIG.enabled,
      serviceId: EMAILJS_CONFIG.serviceId,
      templateId: EMAILJS_CONFIG.templateId,
      publicKey: EMAILJS_CONFIG.publicKey ? "***" + EMAILJS_CONFIG.publicKey.slice(-4) : "Not set",
      grantTeamTemplateId: EMAILJS_CONFIG.grantTeamTemplateId,
      initialized: this.initialized,
      configured: this.isConfigured(),
    };
  }
}

// Create and export a singleton instance
export const emailService = new EmailService();

// Export types for use in other files
export type { EmailData, GrantTeamEmailData };
