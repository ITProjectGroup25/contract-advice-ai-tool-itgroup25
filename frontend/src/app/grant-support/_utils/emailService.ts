import {
  fetchEmailConfig,
  saveEmailConfig,
  EmailConfig as ApiEmailConfig,
} from "./api";

export interface EmailData {
  userEmail: string;
  userName: string;
  submissionId: string;
  queryType: "simple" | "complex";
  timestamp: string;
}

export interface GrantTeamEmailData {
  submissionId: string;
  queryType: "complex" | "escalated";
  userEmail: string;
  userName: string;
  timestamp: string;
  formData: Record<string, any>;
}

export type EmailConfig = ApiEmailConfig;

class EmailService {
  private cache: EmailConfig | null = null;

  async getConfiguration(): Promise<EmailConfig | null> {
    if (this.cache) return this.cache;
    const response = await fetchEmailConfig();
    this.cache = response.config;
    return this.cache;
  }

  async saveConfiguration(config: EmailConfig): Promise<void> {
    this.cache = await saveEmailConfig(config);
  }

  clearCache(): void {
    this.cache = null;
  }

  async sendConfirmationEmail(data: EmailData): Promise<boolean> {
    const config = await this.getConfiguration();
    if (!config) {
      console.warn("Email configuration not set. Skipping confirmation email.", data);
      return false;
    }

    console.log("📧 [Mock] Sending confirmation email", {
      to: data.userEmail,
      templateId: config.templateId,
      submissionId: data.submissionId,
      queryType: data.queryType,
    });
    return true;
  }

  async sendGrantTeamNotification(data: GrantTeamEmailData): Promise<boolean> {
    const config = await this.getConfiguration();
    if (!config) {
      console.warn("Email configuration not set. Skipping grant team notification.", data);
      return false;
    }

    console.log("📧 [Mock] Sending grant team notification", {
      to: config.grantTeamEmail,
      templateId: config.grantTeamTemplateId,
      submissionId: data.submissionId,
      queryType: data.queryType,
    });
    return true;
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
