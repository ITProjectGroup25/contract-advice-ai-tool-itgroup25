// import emailjs from '@emailjs/browser';
import { FormData, EmailData, GrantTeamEmailData } from "@shared";

// EmailJS configuration - these should be environment variables in production
const EMAILJS_CONFIG = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "your_service_id",
  templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "your_template_id",
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "your_public_key",
  grantTeamTemplateId:
    process.env.NEXT_PUBLIC_EMAILJS_GRANT_TEAM_TEMPLATE_ID || "grant_team_template_id",
};

class EmailService {
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (typeof window !== "undefined" && EMAILJS_CONFIG.publicKey) {
        // emailjs.init(EMAILJS_CONFIG.publicKey);
        this.initialized = false; // Set to false until EmailJS is properly installed
        console.log("📧 EmailJS not available - install @emailjs/browser package");
      }
    } catch (error) {
      console.error("❌ EmailJS initialization failed:", error);
    }
  }

  async sendConfirmationEmail(data: EmailData): Promise<boolean> {
    if (!this.initialized) {
      console.warn("⚠️ EmailJS not initialized");
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
      };

      console.log("📧 Sending confirmation email with params:", templateParams);

      // const response = await emailjs.send(
      //   EMAILJS_CONFIG.serviceId,
      //   EMAILJS_CONFIG.templateId,
      //   templateParams
      // );

      // Mock response for development
      const response = { status: 200, text: "OK" };

      console.log("✅ Confirmation email sent successfully:", response);
      return true;
    } catch (error) {
      console.error("❌ Failed to send confirmation email:", error);
      return false;
    }
  }

  async sendGrantTeamNotification(data: GrantTeamEmailData): Promise<boolean> {
    if (!this.initialized) {
      console.warn("⚠️ EmailJS not initialized");
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
        form_data: JSON.stringify(data.formData, null, 2),
      };

      console.log("📧 Sending grant team notification with params:", templateParams);

      // const response = await emailjs.send(
      //   EMAILJS_CONFIG.serviceId,
      //   EMAILJS_CONFIG.grantTeamTemplateId,
      //   templateParams
      // );

      // Mock response for development
      const response = { status: 200, text: "OK" };

      console.log("✅ Grant team notification sent successfully:", response);
      return true;
    } catch (error) {
      console.error("❌ Failed to send grant team notification:", error);
      return false;
    }
  }

  async sendCustomEmail(
    templateParams: Record<string, any>,
    templateId?: string
  ): Promise<boolean> {
    if (!this.initialized) {
      console.warn("⚠️ EmailJS not initialized");
      return false;
    }

    try {
      // const response = await emailjs.send(
      //   EMAILJS_CONFIG.serviceId,
      //   templateId || EMAILJS_CONFIG.templateId,
      //   templateParams
      // );

      // Mock response for development
      const response = { status: 200, text: "OK" };

      console.log("✅ Custom email sent successfully:", response);
      return true;
    } catch (error) {
      console.error("❌ Failed to send custom email:", error);
      return false;
    }
  }

  isConfigured(): boolean {
    return !!(
      EMAILJS_CONFIG.serviceId &&
      EMAILJS_CONFIG.templateId &&
      EMAILJS_CONFIG.publicKey &&
      EMAILJS_CONFIG.serviceId !== "your_service_id"
    );
  }

  getConfig() {
    return {
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
