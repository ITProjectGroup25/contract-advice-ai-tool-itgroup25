import emailjs from "@emailjs/browser";
import { fetchEmailConfig, saveEmailConfig, EmailConfig as ApiEmailConfig } from "./api";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

const extractEmails = (value: string | string[] | undefined): string[] => {
  if (!value) return [];
  const values = Array.isArray(value) ? value : value.split(/[,;]+/);
  return values
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0 && EMAIL_REGEX.test(entry));
};

// 辅助函数：序列化表单值
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

// 辅助函数：格式化表单数据为可读文本
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

export interface EmailData {
  userEmail: string;
  userName: string;
  submissionId: string;
  queryType: "simple" | "complex";
  timestamp: string;
  formData?: Record<string, any>;
  submissionDate?: string;
  submissionTime?: string;
  to?: string;
  toName?: string;
}

export interface GrantTeamEmailData {
  submissionId: string;
  queryType: "complex" | "escalated";
  userEmail: string;
  userName: string;
  timestamp: string;
  formData: Record<string, any>;
  matchedSelections?: string[];
  submissionDate?: string;
  submissionTime?: string;
  grantTeamEmail?: string;
  grantTeamEmails?: string[];
  grantTeamName?: string;
  grantTeamNames?: string[];
}

export type EmailConfig = ApiEmailConfig;

class EmailService {
  private cache: EmailConfig | null = null;
  private emailJsInitialised = false;

  async getConfiguration(): Promise<EmailConfig | null> {
    if (this.cache) return this.cache;
    const response = await fetchEmailConfig();
    this.cache = response.config;
    return this.cache;
  }

  async saveConfiguration(config: EmailConfig): Promise<void> {
    this.cache = await saveEmailConfig(config);
    this.emailJsInitialised = false;
  }

  clearCache(): void {
    this.cache = null;
    this.emailJsInitialised = false;
  }

  private static formatTimestampParts(timestamp?: string) {
    const inputDate = timestamp ? new Date(timestamp) : new Date();
    const date = Number.isNaN(inputDate.getTime()) ? new Date() : inputDate;
    const locale = "en-AU";

    const formattedTimestamp = date.toLocaleString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const submissionDate = date.toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const submissionTime = date.toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return { formattedTimestamp, submissionDate, submissionTime };
  }

  private ensureEmailJs(config: EmailConfig, context: string): boolean {
    if (typeof window === "undefined") {
      console.warn(`[EmailJS] Attempted to send ${context} on the server. Skipping.`);
      return false;
    }

    if (!config.publicKey) {
      console.warn("[EmailJS] Public key missing. Skipping email send.");
      return false;
    }

    if (!config.serviceId || !config.templateId) {
      console.warn("[EmailJS] Service or template ID missing. Skipping email send.");
      return false;
    }

    if (!this.emailJsInitialised) {
      try {
        emailjs.init(config.publicKey);
        this.emailJsInitialised = true;
        console.info("[EmailJS] Initialised successfully.");
      } catch (error) {
        console.error("[EmailJS] Failed to initialise:", error);
        return false;
      }
    }

    return true;
  }

  async sendConfirmationEmail(data: EmailData): Promise<boolean> {
    const config = await this.getConfiguration();
    if (!config) {
      console.warn("Email configuration not set. Skipping confirmation email.", data);
      return false;
    }

    if (!this.ensureEmailJs(config, "confirmation email")) {
      return false;
    }

    const formattedFormData = formatFormData(data.formData ?? null);
    const { formattedTimestamp, submissionDate, submissionTime } =
      EmailService.formatTimestampParts(data.timestamp);

    const templateParams = {
      to_email: data.to ?? data.userEmail,
      toEmail: data.to ?? data.userEmail,
      to_name: data.toName ?? data.userName,
      toName: data.toName ?? data.userName,
      user_name: data.userName,
      userName: data.userName,
      submitter_name: data.userName,
      submitterName: data.userName,
      submitter_email: data.userEmail,
      submitterEmail: data.userEmail,
      submission_id: data.submissionId,
      submissionId: data.submissionId,
      query_type: data.queryType,
      queryType: data.queryType,
      timestamp: formattedTimestamp,
      date: formattedTimestamp,
      submission_date: data.submissionDate ?? submissionDate,
      submissionDate: data.submissionDate ?? submissionDate,
      submission_time: data.submissionTime ?? submissionTime,
      submissionTime: data.submissionTime ?? submissionTime,
      form_data: JSON.stringify(data.formData ?? {}, null, 2),
      form_data_pretty: formattedFormData,
      formData: formattedFormData,
      form_details: formattedFormData,
    };

    try {
      console.log("📧 [EmailJS] Sending confirmation email:", templateParams);
      const response = await emailjs.send(config.serviceId, config.templateId, templateParams);
      const success = response.status === 200;

      if (success) {
        console.info("✅ [EmailJS] Confirmation email sent successfully:", response);
      } else {
        console.warn("⚠️ [EmailJS] Confirmation email returned non-200 status:", response);
      }

      return success;
    } catch (error) {
      console.error("❌ [EmailJS] Failed to send confirmation email:", error);
      return false;
    }
  }

  async sendGrantTeamNotification(data: GrantTeamEmailData): Promise<boolean> {
    const config = await this.getConfiguration();
    if (!config) {
      console.warn("Email configuration not set. Skipping grant team notification.", data);
      return false;
    }

    if (!config.grantTeamTemplateId) {
      console.warn(
        "[EmailJS] Grant team template ID missing. Skipping grant team notification.",
        data
      );
      return false;
    }

    if (!this.ensureEmailJs(config, "grant team notification")) {
      return false;
    }

    const formattedFormData = formatFormData(data.formData ?? null);
    const { formattedTimestamp, submissionDate, submissionTime } =
      EmailService.formatTimestampParts(data.timestamp);

    const recipientEmails = Array.from(
      new Set<string>([
        ...extractEmails(data.grantTeamEmails),
        ...extractEmails(
          typeof data.grantTeamEmail === "string" ? data.grantTeamEmail : undefined
        ),
        ...extractEmails(config.grantTeamEmail),
      ])
    );

    if (recipientEmails.length === 0) {
      console.warn(
        "[EmailJS] No grant team recipient email detected. Skipping grant team notification.",
        {
          submissionId: data.submissionId,
          formRecipients: data.grantTeamEmails,
          configRecipient: config.grantTeamEmail,
        }
      );
      return false;
    }

    const [primaryRecipient, ...ccRecipients] = recipientEmails;
    const grantTeamNames = data.grantTeamNames ?? data.matchedSelections;
    const grantTeamDisplayName =
      data.grantTeamName ?? grantTeamNames?.join(", ") ?? "Grant Support Team";

    const templateParams = {
      grant_team_email: primaryRecipient,
      to_email: primaryRecipient,
      toEmail: primaryRecipient,
      to_name: grantTeamDisplayName,
      toName: grantTeamDisplayName,
      cc_emails: ccRecipients.join(", "),
      ccEmails: ccRecipients.join(", "),
      submission_id: data.submissionId,
      submissionId: data.submissionId,
      query_type: data.queryType,
      queryType: data.queryType,
      user_email: data.userEmail,
      user_name: data.userName,
      userName: data.userName,
      submitter_name: data.userName,
      submitterName: data.userName,
      submitter_email: data.userEmail,
      submitterEmail: data.userEmail,
      timestamp: formattedTimestamp,
      date: formattedTimestamp,
      form_data: JSON.stringify(data.formData ?? {}, null, 2),
      form_data_pretty: formattedFormData,
      formData: formattedFormData,
      form_details: formattedFormData,
      submission_date: data.submissionDate ?? submissionDate,
      submissionDate: data.submissionDate ?? submissionDate,
      submission_time: data.submissionTime ?? submissionTime,
      submissionTime: data.submissionTime ?? submissionTime,
      matched_selections: data.matchedSelections?.join(", "),
      matchedSelections: data.matchedSelections?.join(", "),
      grant_team_name: grantTeamDisplayName,
      grantTeamName: grantTeamDisplayName,
      grant_team_list: grantTeamNames?.join(", ") ?? "",
      grantTeamList: grantTeamNames?.join(", ") ?? "",
    };

    try {
      console.log("📧 [EmailJS] Sending grant team notification:", templateParams);
      console.log("📧 [EmailJS] Grant team email summary:", {
        submissionId: data.submissionId,
        queryType: data.queryType,
        userEmail: data.userEmail,
        userName: data.userName,
        matchedSelections: data.matchedSelections,
        to: primaryRecipient,
        cc: ccRecipients,
      });
      const response = await emailjs.send(
        config.serviceId,
        config.grantTeamTemplateId,
        templateParams
      );
      const success = response.status === 200;

      if (success) {
        console.info("✅ [EmailJS] Grant team notification sent successfully:", response);
      } else {
        console.warn("⚠️ [EmailJS] Grant team notification returned non-200 status:", response);
      }

      return success;
    } catch (error) {
      console.error("❌ [EmailJS] Failed to send grant team notification:", error);
      return false;
    }
  }

  generateEmailTemplate(): string {
    return `Subject: Referral Request Confirmation

Hi {{userName}},

We have received your referral request (ID: {{submissionId}}) with query type {{queryType}} on {{timestamp}}.
Our team will review your submission and get back to you shortly.

Thank you.`;
  }
}

export const emailService = new EmailService();
export const emailTemplate = emailService.generateEmailTemplate();
