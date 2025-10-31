import emailjs from "@emailjs/browser";
import { EmailData, GrantTeamEmailData } from "@shared";

const serializeFormValue = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value.map((item) => serializeFormValue(item)).join(", ");
  }

  if (value && typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }

  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
};

const formatFormData = (formData?: Record<string, unknown> | null): string => {
  if (!formData || typeof formData !== "object") {
    return "No additional form data provided.";
  }

  const entries = Object.entries(formData);
  if (entries.length === 0) {
    return "No additional form data provided.";
  }

  return entries
    .map(([key, value]) => `${key}: ${serializeFormValue(value)}`)
    .join("\n");
};

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
      const formattedFormData = formatFormData(data.formData ?? null);
      
      // 格式化时间戳为可读格式
      const formattedTimestamp = data.timestamp 
        ? new Date(data.timestamp).toLocaleString('en-AU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })
        : new Date().toLocaleString('en-AU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
      
      const templateParams = {
        to_email: data.to,
        user_name: data.submitterName || "User",
        userName: data.submitterName || "User",
        submitter_name: data.submitterName || "User",
        submitterName: data.submitterName || "User",
        submitter_email: data.submitterEmail || data.to,
        submitterEmail: data.submitterEmail || data.to,
        submission_id: data.submissionId || "N/A",
        submissionId: data.submissionId || "N/A",
        query_type: data.queryType || "general",
        queryType: data.queryType || "general",
        timestamp: formattedTimestamp,
        date: formattedTimestamp,
        subject: data.subject || "Referral Request Confirmation",
        form_data: JSON.stringify(data.formData ?? {}, null, 2),
        form_data_pretty: formattedFormData,
        formData: formattedFormData,
        form_details: formattedFormData,
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
      const grantTeams = Array.isArray(data.grantTeam)
        ? data.grantTeam
        : typeof data.grantTeam === "string"
          ? [data.grantTeam]
          : [];
      const formattedFormData = formatFormData(data.formData ?? null);
      
      // 格式化时间戳为可读格式
      const formattedTimestamp = data.timestamp 
        ? new Date(data.timestamp).toLocaleString('en-AU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })
        : new Date().toLocaleString('en-AU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
      
      const templateParams = {
        user_name: data.submitterName || "Unknown User",
        userName: data.submitterName || "Unknown User",
        submitter_name: data.submitterName || "Unknown User",
        submitterName: data.submitterName || "Unknown User",
        user_email: data.submitterEmail || "No email provided",
        submitter_email: data.submitterEmail || "No email provided",
        submitterEmail: data.submitterEmail || "No email provided",
        submission_id: data.submissionId || "N/A",
        submissionId: data.submissionId || "N/A",
        query_type: data.queryType || "general",
        queryType: data.queryType || "general",
        grant_teams: grantTeams.join(", "),
        grant_team_list: grantTeams.join("\n"),
        grantTeams: grantTeams.join(", "),
        urgency: data.urgency ? "URGENT" : "Normal",
        urgency_status: data.urgency ? "URGENT" : "Normal",
        timestamp: formattedTimestamp,
        date: formattedTimestamp,
        form_data: JSON.stringify(data.formData ?? {}, null, 2),
        form_data_pretty: formattedFormData,
        formData: formattedFormData,
        form_details: formattedFormData,
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
