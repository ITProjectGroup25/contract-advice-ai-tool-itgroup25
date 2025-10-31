import emailjs from "@emailjs/browser";
import { fetchEmailConfig, saveEmailConfig, EmailConfig as ApiEmailConfig } from "./api";

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
}

export interface GrantTeamEmailData {
  submissionId: string;
  queryType: "complex" | "escalated";
  userEmail: string;
  userName: string;
  timestamp: string;
  formData: Record<string, any>;
  matchedSelections?: string[];
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
      to_email: data.userEmail,
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
      grant_team_email: config.grantTeamEmail,
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
      matched_selections: data.matchedSelections?.join(", "),
      matchedSelections: data.matchedSelections?.join(", "),
    };

    try {
      console.log("📧 [EmailJS] Sending grant team notification:", templateParams);
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
