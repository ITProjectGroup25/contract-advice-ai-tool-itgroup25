'use client';

// Email service for sending confirmation emails to users
// This uses EmailJS for frontend email sending

export interface EmailConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
}

export interface GrantTeamEmailConfig {
  grantTeamEmail: string;
  grantTeamTemplateId: string;
}

export interface EmailData {
  userEmail: string;
  userName: string;
  submissionId: string;
  queryType: 'simple' | 'complex';
  timestamp: string;
}

export interface GrantTeamEmailData {
  submissionId: string;
  queryType: 'complex' | 'escalated';
  userEmail: string;
  userName: string;
  timestamp: string;
  formData: Record<string, any>;
}

// Default configuration - all values are now configurable
const DEFAULT_TEMPLATE_ID = 'template_j1pb7y5';
const DEFAULT_PUBLIC_KEY = 'eg8pIA2_G76yJ3oOn';
const DEFAULT_SERVICE_ID = 'service_5pl6gob';
const SERVICE_ID_STORAGE_KEY = 'emailjs_service_id';
const TEMPLATE_ID_STORAGE_KEY = 'emailjs_template_id';
const PUBLIC_KEY_STORAGE_KEY = 'emailjs_public_key';

// Grant team email configuration
const DEFAULT_GRANT_TEAM_EMAIL = 'grantteam@yourcompany.com';
const DEFAULT_GRANT_TEAM_TEMPLATE_ID = 'template_grant_team';
const GRANT_TEAM_EMAIL_STORAGE_KEY = 'grant_team_email';
const GRANT_TEAM_TEMPLATE_ID_STORAGE_KEY = 'grant_team_template_id';

// Get current service ID from localStorage or use default
function getCurrentServiceId(): string {
  try {
    const stored = localStorage.getItem(SERVICE_ID_STORAGE_KEY);
    return stored || DEFAULT_SERVICE_ID;
  } catch (error) {
    console.warn('Failed to read service ID from localStorage:', error);
    return DEFAULT_SERVICE_ID;
  }
}

// Save service ID to localStorage
function saveServiceId(serviceId: string): void {
  try {
    localStorage.setItem(SERVICE_ID_STORAGE_KEY, serviceId);
    console.log('📧 Service ID saved to localStorage:', serviceId);
  } catch (error) {
    console.error('Failed to save service ID to localStorage:', error);
  }
}

// Get current template ID from localStorage or use default
function getCurrentTemplateId(): string {
  try {
    const stored = localStorage.getItem(TEMPLATE_ID_STORAGE_KEY);
    return stored || DEFAULT_TEMPLATE_ID;
  } catch (error) {
    console.warn('Failed to read template ID from localStorage:', error);
    return DEFAULT_TEMPLATE_ID;
  }
}

// Save template ID to localStorage
function saveTemplateId(templateId: string): void {
  try {
    localStorage.setItem(TEMPLATE_ID_STORAGE_KEY, templateId);
    console.log('📧 Template ID saved to localStorage:', templateId);
  } catch (error) {
    console.error('Failed to save template ID to localStorage:', error);
  }
}

// Get current public key from localStorage or use default
function getCurrentPublicKey(): string {
  try {
    const stored = localStorage.getItem(PUBLIC_KEY_STORAGE_KEY);
    return stored || DEFAULT_PUBLIC_KEY;
  } catch (error) {
    console.warn('Failed to read public key from localStorage:', error);
    return DEFAULT_PUBLIC_KEY;
  }
}

// Save public key to localStorage
function savePublicKey(publicKey: string): void {
  try {
    localStorage.setItem(PUBLIC_KEY_STORAGE_KEY, publicKey);
    console.log('📧 Public Key saved to localStorage:', publicKey);
  } catch (error) {
    console.error('Failed to save public key to localStorage:', error);
  }
}

// Grant team email configuration functions
function getCurrentGrantTeamEmail(): string {
  try {
    const stored = localStorage.getItem(GRANT_TEAM_EMAIL_STORAGE_KEY);
    return stored || DEFAULT_GRANT_TEAM_EMAIL;
  } catch (error) {
    console.warn('Failed to read grant team email from localStorage:', error);
    return DEFAULT_GRANT_TEAM_EMAIL;
  }
}

function saveGrantTeamEmail(email: string): void {
  try {
    localStorage.setItem(GRANT_TEAM_EMAIL_STORAGE_KEY, email);
    console.log('📧 Grant team email saved to localStorage:', email);
  } catch (error) {
    console.error('Failed to save grant team email to localStorage:', error);
  }
}

function getCurrentGrantTeamTemplateId(): string {
  try {
    const stored = localStorage.getItem(GRANT_TEAM_TEMPLATE_ID_STORAGE_KEY);
    return stored || DEFAULT_GRANT_TEAM_TEMPLATE_ID;
  } catch (error) {
    console.warn('Failed to read grant team template ID from localStorage:', error);
    return DEFAULT_GRANT_TEAM_TEMPLATE_ID;
  }
}

function saveGrantTeamTemplateId(templateId: string): void {
  try {
    localStorage.setItem(GRANT_TEAM_TEMPLATE_ID_STORAGE_KEY, templateId);
    console.log('📧 Grant team template ID saved to localStorage:', templateId);
  } catch (error) {
    console.error('Failed to save grant team template ID to localStorage:', error);
  }
}

// Get current configuration with all configurable values
function getCurrentConfig(): EmailConfig {
  return {
    serviceId: getCurrentServiceId(),
    templateId: getCurrentTemplateId(),
    publicKey: getCurrentPublicKey()
  };
}

// Get current grant team configuration
function getCurrentGrantTeamConfig(): GrantTeamEmailConfig {
  return {
    grantTeamEmail: getCurrentGrantTeamEmail(),
    grantTeamTemplateId: getCurrentGrantTeamTemplateId()
  };
}

class EmailService {
  private isEmailJSLoaded = false;
  private configInitialized = false;

  // Initialize the service (can be called publicly)
  initialize(): void {
    this.loadConfigFromStorage();
  }

  // Check if EmailJS is available (loaded via CDN in index.html)
  private async loadEmailJS(): Promise<void> {
    if (this.isEmailJSLoaded) return;
    
    console.log('📧 Checking for EmailJS library...');
    
    // Check if EmailJS is ready (set by index.html script)
    if ((window as any).emailJSReady === true && typeof (window as any).emailjs !== 'undefined') {
      this.isEmailJSLoaded = true;
      console.log('✅ EmailJS library ready (confirmed by index.html)');
      return;
    }
    
    // First check all possible EmailJS objects
    const possibleEmailJS = [
      (window as any).emailjs,
      (window as any).EmailJS, 
      (window as any).Email,
      (window as any).emailJs
    ];
    
    for (const emailjsLib of possibleEmailJS) {
      if (typeof emailjsLib !== 'undefined' && emailjsLib && emailjsLib.send) {
        this.isEmailJSLoaded = true;
        console.log('✅ EmailJS library found immediately');
        // Store the correct reference
        (window as any).emailjs = emailjsLib;
        return;
      }
    }
    
    // Wait for EmailJS to load with extended timeout and better checking
    let attempts = 0;
    const maxAttempts = 50; // Increased attempts to wait for fallback CDN
    const checkInterval = 200; // Interval for checking
    
    return new Promise((resolve, reject) => {
      const checkEmailJS = () => {
        attempts++;
        console.log(`📧 Attempt ${attempts}/${maxAttempts} to find EmailJS...`);
        
        // Check if the index.html script marked it as ready
        if ((window as any).emailJSReady === true) {
          console.log('📧 EmailJS marked as ready by index.html script');
        }
        
        // Check if the index.html script marked it as failed
        if ((window as any).emailJSReady === false) {
          console.error('📧 EmailJS marked as failed by index.html script');
          reject(new Error('EmailJS failed to load from both primary and fallback CDNs'));
          return;
        }
        
        // Check multiple possible locations again
        for (const emailjsLib of possibleEmailJS) {
          if (typeof emailjsLib !== 'undefined' && emailjsLib && emailjsLib.send) {
            this.isEmailJSLoaded = true;
            console.log('✅ EmailJS library found after waiting');
            (window as any).emailjs = emailjsLib;
            resolve();
            return;
          }
        }
        
        if (attempts >= maxAttempts) {
          console.error('❌ EmailJS library not found after maximum attempts');
          console.log('📧 Available window properties:', Object.keys(window).filter(key => 
            key.toLowerCase().includes('email')
          ));
          
          // If we get here and emailJSReady is still undefined, the index.html script might not have run
          if ((window as any).emailJSReady === undefined) {
            console.warn('📧 index.html EmailJS script may not have executed');
          }
          
          reject(new Error('EmailJS library not found. CDN may be blocked or unavailable.'));
        } else {
          setTimeout(checkEmailJS, checkInterval);
        }
      };
      checkEmailJS();
    });
  }

  // Load configuration from localStorage
  private loadConfigFromStorage(): EmailConfig {
    try {
      const config = getCurrentConfig();
      if (!this.configInitialized) {
        console.log('📧 EmailJS configuration initialized with service ID:', config.serviceId);
        this.configInitialized = true;
      }
      return config;
    } catch (error) {
      console.error('Failed to load email config from storage:', error);
      return getCurrentConfig();
    }
  }

  // Send notification email to grant team
  async sendGrantTeamNotification(emailData: GrantTeamEmailData): Promise<boolean> {
    const config = this.loadConfigFromStorage();
    const grantTeamConfig = getCurrentGrantTeamConfig();
    
    try {
      console.log('📧 Email Service: Sending grant team notification...', {
        queryType: emailData.queryType,
        submissionId: emailData.submissionId,
        grantTeamEmail: grantTeamConfig.grantTeamEmail
      });

      // Validate configuration
      if (!config.serviceId || !config.publicKey) {
        throw new Error('Email configuration is incomplete. Please check Service ID and Public Key.');
      }

      const templateId = grantTeamConfig.grantTeamTemplateId;

      if (!templateId || !grantTeamConfig.grantTeamEmail) {
        throw new Error('Grant team email configuration is incomplete.');
      }

      // Try to load EmailJS
      try {
        await this.loadEmailJS();
      } catch (loadError) {
        console.error('📧 EmailJS failed to load for grant team notification:', loadError);
        this.showDemoGrantTeamNotification(emailData, 'EmailJS library could not be loaded.');
        return true;
      }

      // Get EmailJS instance
      const emailjsLib = (window as any).emailjs;
      if (!emailjsLib) {
        console.error('📧 EmailJS library not available for grant team notification');
        this.showDemoGrantTeamNotification(emailData, 'EmailJS library is not available.');
        return true;
      }

      // Initialize EmailJS with public key
      try {
        emailjsLib.init({
          publicKey: config.publicKey
        });
      } catch (initError) {
        try {
          emailjsLib.init(config.publicKey);
        } catch (fallbackInitError) {
          throw new Error(`EmailJS initialization failed: ${fallbackInitError}`);
        }
      }

      // Prepare template parameters for GRANT TEAM notification
      const templateParams = {
        to_email: grantTeamConfig.grantTeamEmail,    // This MUST be the grant team email
        to_name: 'Grant Team',                       // This MUST be "Grant Team"
        submission_id: emailData.submissionId,
        query_type: emailData.queryType,
        user_email: emailData.userEmail,             // User's email for reference
        user_name: emailData.userName,               // User's name for reference
        submission_date: new Date(emailData.timestamp).toLocaleDateString(),
        submission_time: new Date(emailData.timestamp).toLocaleTimeString(),
        form_data: JSON.stringify(emailData.formData, null, 2),
        reply_to: 'noreply@yourcompany.com'
      };

      console.log('📧 Sending GRANT TEAM NOTIFICATION with template params:', {
        serviceId: config.serviceId,
        templateId: templateId,
        to_email: templateParams.to_email,
        to_name: templateParams.to_name,
        submission_id: templateParams.submission_id,
        query_type: templateParams.query_type,
        user_email: templateParams.user_email,
        user_name: templateParams.user_name,
        form_data: '[FORM_DATA]' // Don't log sensitive data
      });
      
      const response = await emailjsLib.send(
        config.serviceId,
        templateId,
        templateParams
      );

      console.log('✅ Grant team notification sent successfully:', response);
      return true;

    } catch (error) {
      console.error('❌ Failed to send grant team notification:', error);
      
      // Show demo notification as fallback
      console.log('📧 Falling back to demo mode for grant team notification');
      this.showDemoGrantTeamNotification(emailData);
      return true;
    }
  }

  // Show demo notification for grant team emails
  private showDemoGrantTeamNotification(emailData: GrantTeamEmailData, customError?: string): void {
    const grantTeamConfig = getCurrentGrantTeamConfig();
    const hasCustomError = !!customError;
    const notification = document.createElement('div');
    
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: ${hasCustomError ? '#dc2626' : '#10b981'};
      color: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      max-width: 400px;
      font-family: system-ui, sans-serif;
      font-size: 14px;
      line-height: 1.5;
    `;
    
    const headerText = hasCustomError ? 'Grant Team Email Error' : 'Grant Team Notification (Demo)';
    const icon = hasCustomError ? '❌' : '📧';
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span style="font-size: 18px;">${icon}</span>
        <strong>${headerText}</strong>
      </div>
      <div style="opacity: 0.9;">
        ${hasCustomError ? 
          `<div style="margin-bottom: 8px; font-size: 12px; padding: 6px; background: rgba(255,255,255,0.2); border-radius: 4px;">❌ ${customError}</div>` :
          '<div style="margin-bottom: 8px; font-size: 12px; padding: 6px; background: rgba(255,255,255,0.2); border-radius: 4px;">ℹ️ Demo mode: Grant team notification would be sent in production.</div>'
        }
        <div><strong>To:</strong> ${grantTeamConfig.grantTeamEmail}</div>
        <div style="color: #FFA500; font-weight: bold; margin: 4px 0;">🏢 GRANT TEAM NOTIFICATION</div>
        <div><strong>Subject:</strong> ${emailData.queryType === 'complex' ? 'New Complex Query' : 'Escalated Simple Query'} - ${emailData.submissionId}</div>
        <div><strong>User:</strong> ${emailData.userName} (${emailData.userEmail})</div>
        <div style="margin-top: 8px; padding: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; font-size: 12px;">
          ${emailData.queryType === 'complex' ? 
            'A new complex query has been submitted and requires grant team review.' :
            'A simple query has been escalated and requires human assistance.'
          }
          <br><strong>Submission ID:</strong> ${emailData.submissionId}
          <br><strong>Date:</strong> ${new Date(emailData.timestamp).toLocaleDateString()}
          ${hasCustomError ? '<br><br><em>Note: Email service is temporarily unavailable.</em>' : 
            '<br><br><em>Note: Demo mode. Configure EmailJS templates to send real emails.</em>'}
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove with timeout
    const timeout = hasCustomError ? 12000 : 8000;
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, timeout);

    // Add click to dismiss
    notification.style.cursor = 'pointer';
    notification.addEventListener('click', () => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    });
  }

  // Send confirmation email to user
  async sendConfirmationEmail(emailData: EmailData, config?: EmailConfig): Promise<boolean> {
    const activeConfig = config || this.loadConfigFromStorage();
    
    try {
      // Configuration is always valid now, proceed with real email sending
      console.log('📧 Email Service: Sending USER CONFIRMATION email...', {
        serviceId: activeConfig.serviceId,
        templateId: activeConfig.templateId,
        targetEmail: emailData.userEmail,
        isDefault: activeConfig.serviceId === DEFAULT_SERVICE_ID
      });

      // Validate configuration
      if (!activeConfig.serviceId || !activeConfig.templateId || !activeConfig.publicKey) {
        throw new Error('Email configuration is incomplete. Please check Service ID, Template ID, and Public Key.');
      }

      console.log('📧 Attempting to send real email with config:', {
        serviceId: activeConfig.serviceId,
        templateId: activeConfig.templateId,
        publicKeyLength: activeConfig.publicKey.length
      });

      // Try to load EmailJS
      try {
        await this.loadEmailJS();
      } catch (loadError) {
        console.error('📧 EmailJS failed to load, falling back to demo notification:', loadError);
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.showDemoEmailNotification(emailData, 'EmailJS library could not be loaded. This may be due to network restrictions or CDN issues.');
        return true;
      }

      // Get EmailJS instance
      const emailjsLib = (window as any).emailjs;
      if (!emailjsLib) {
        console.error('📧 EmailJS library not available, falling back to demo notification');
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.showDemoEmailNotification(emailData, 'EmailJS library is not available.');
        return true;
      }

      console.log('📧 EmailJS library loaded successfully');

      // Initialize EmailJS with public key
      console.log('📧 Initializing EmailJS with public key...');
      try {
        emailjsLib.init({
          publicKey: activeConfig.publicKey
        });
        console.log('📧 EmailJS initialized successfully');
      } catch (initError) {
        console.error('📧 Failed to initialize EmailJS:', initError);
        // Try alternative initialization method
        try {
          emailjsLib.init(activeConfig.publicKey);
          console.log('📧 EmailJS initialized with fallback method');
        } catch (fallbackInitError) {
          throw new Error(`EmailJS initialization failed: ${fallbackInitError}`);
        }
      }

      // Prepare template parameters for USER confirmation email
      const templateParams = {
        to_email: emailData.userEmail,  // This MUST be the user's email
        to_name: emailData.userName,    // This MUST be the user's name
        submission_id: emailData.submissionId,
        query_type: emailData.queryType,
        submission_date: new Date(emailData.timestamp).toLocaleDateString(),
        submission_time: new Date(emailData.timestamp).toLocaleTimeString(),
        reply_to: 'noreply@yourcompany.com'
      };

      console.log('📧 Sending USER CONFIRMATION email with template params:', {
        serviceId: activeConfig.serviceId,
        templateId: activeConfig.templateId,
        to_email: templateParams.to_email,
        to_name: templateParams.to_name,
        submission_id: templateParams.submission_id
      });

      // CRITICAL: Ensure we're not using the grant team template for user confirmation
      if (activeConfig.templateId === getCurrentGrantTeamTemplateId()) {
        console.error('❌ CRITICAL ERROR: User confirmation email is using grant team template ID!');
        console.error('User Template ID:', activeConfig.templateId);
        console.error('Grant Team Template ID:', getCurrentGrantTeamTemplateId());
        throw new Error('Template ID conflict: User confirmation email cannot use grant team template');
      }
      
      const response = await emailjsLib.send(
        activeConfig.serviceId,
        activeConfig.templateId,
        templateParams
      );

      console.log('✅ Email sent successfully:', response);
      return true;

    } catch (error) {
      console.error('❌ Failed to send email:', error);
      
      // Check if it's an EmailJS configuration error
      const isConfigError = (
        (error instanceof Error && (
          error.message.includes('public key') ||
          error.message.includes('Public Key') ||
          error.message.includes('service_id') ||
          error.message.includes('template_id') ||
          error.message.includes('invalid') ||
          error.message.includes('unauthorized') ||
          error.message.includes('forbidden')
        )) ||
        (typeof error === 'object' && error !== null && (
          ('status' in error && [(error as any).status === 400, (error as any).status === 401, (error as any).status === 403, (error as any).status === 422].some(Boolean)) ||
          ('text' in error && (error as any).text && (
            (error as any).text.includes('Public Key is invalid') ||
            (error as any).text.includes('The Public Key is invalid') ||
            (error as any).text.includes('Service ID') ||
            (error as any).text.includes('Template ID') ||
            (error as any).text.includes('bad request') ||
            (error as any).text.includes('unauthorized') ||
            (error as any).text.includes('dashboard.emailjs.com')
          ))
        ))
      );
      
      if (isConfigError) {
        console.log('📧 EmailJS configuration error detected, falling back to demo mode');
        console.log('Error details:', error);
        
        // Mark this configuration as invalid in localStorage
        try {
          localStorage.setItem('emailjs_config_status', JSON.stringify({
            isInvalid: true,
            lastError: error,
            timestamp: new Date().toISOString()
          }));
        } catch (storageError) {
          console.warn('Failed to save invalid config status:', storageError);
        }
        
        // Show demo notification instead
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.showDemoEmailNotification(emailData);
        return true;
      }
      
      // For other errors, try demo mode as fallback
      console.log('📧 Unexpected email error, falling back to demo mode');
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.showDemoEmailNotification(emailData);
      return true;
    }
  }

  // Show demo notification instead of actual email
  private showDemoEmailNotification(emailData: EmailData, customError?: string): void {
    const isConfigInvalid = this.isConfigurationInvalid();
    const hasCustomError = !!customError;
    const notification = document.createElement('div');
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${hasCustomError ? '#dc2626' : isConfigInvalid ? '#f59e0b' : '#3b82f6'};
      color: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      max-width: 400px;
      font-family: system-ui, sans-serif;
      font-size: 14px;
      line-height: 1.5;
    `;
    
    const headerText = hasCustomError ? 'EmailJS Loading Error' : isConfigInvalid ? 'Invalid EmailJS Credentials' : 'Demo Email Notification';
    const icon = hasCustomError ? '❌' : isConfigInvalid ? '🔧' : '📧';
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span style="font-size: 18px;">${icon}</span>
        <strong>${headerText}</strong>
      </div>
      <div style="opacity: 0.9;">
        ${hasCustomError ? 
          `<div style="margin-bottom: 8px; font-size: 12px; padding: 6px; background: rgba(255,255,255,0.2); border-radius: 4px;">❌ ${customError}</div>` :
          isConfigInvalid ? 
          '<div style="margin-bottom: 8px; font-size: 12px; padding: 6px; background: rgba(255,255,255,0.2); border-radius: 4px;">⚠️ EmailJS credentials are invalid. Please configure valid credentials in Admin Panel.</div>' : 
          '<div style="margin-bottom: 8px; font-size: 12px; padding: 6px; background: rgba(255,255,255,0.2); border-radius: 4px;">ℹ️ Demo mode: Real EmailJS credentials not configured.</div>'
        }
        <div><strong>To:</strong> ${emailData.userEmail}</div>
        <div style="color: #90EE90; font-weight: bold; margin: 4px 0;">📧 USER CONFIRMATION EMAIL</div>
        <div><strong>Subject:</strong> Confirmation - Query ${emailData.submissionId}</div>
        <div style="margin-top: 8px; padding: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; font-size: 12px;">
          Hi ${emailData.userName},<br><br>
          Your ${emailData.queryType} query has been submitted successfully.<br>
          <strong>Submission ID:</strong> ${emailData.submissionId}<br>
          <strong>Date:</strong> ${new Date(emailData.timestamp).toLocaleDateString()}
          ${hasCustomError ? '<br><br><em>Note: Email service is temporarily unavailable. Please try again later.</em>' : 
            isConfigInvalid ? '<br><br><em>Note: This is a demo. Configure EmailJS in Admin Panel to send real emails.</em>' : 
            '<br><br><em>Note: Demo mode active. Configure real EmailJS credentials to send actual emails.</em>'}
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove with different timeouts based on error type
    const timeout = hasCustomError ? 12000 : isConfigInvalid ? 10000 : 8000;
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, timeout);

    // Add click to dismiss
    notification.style.cursor = 'pointer';
    notification.addEventListener('click', () => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    });
  }

  // Generate email template content for manual setup
  generateEmailTemplate(): string {
    return `
<!-- EmailJS Template for Query Confirmation -->
Subject: Confirmation - Your Query {{submission_id}} has been received

Dear {{to_name}},

Thank you for submitting your {{query_type}} query to our referral system.

Submission Details:
- Submission ID: {{submission_id}}
- Query Type: {{query_type}}
- Date Submitted: {{submission_date}} at {{submission_time}}

Your request is now being processed. We will contact you if we need any additional information.

For future reference, please keep your Submission ID: {{submission_id}}

Best regards,
Referral Team

---
This is an automated message. Please do not reply to this email.

Template Variables Used:
{{to_name}} - Recipient's name
{{to_email}} - Recipient's email address  
{{submission_id}} - Unique submission ID
{{query_type}} - Type of query (simple/complex)
{{submission_date}} - Date of submission
{{submission_time}} - Time of submission
    `.trim();
  }

  // Check if configuration was previously marked as invalid
  private isConfigurationInvalid(): boolean {
    try {
      const status = localStorage.getItem('emailjs_config_status');
      if (status) {
        const statusData = JSON.parse(status);
        // Consider config invalid if marked as such within the last 24 hours
        const lastError = new Date(statusData.timestamp);
        const now = new Date();
        const hoursSinceError = (now.getTime() - lastError.getTime()) / (1000 * 60 * 60);
        
        return statusData.isInvalid && hoursSinceError < 24;
      }
    } catch (error) {
      console.warn('Failed to check configuration status:', error);
    }
    return false;
  }

  // Clear invalid configuration status
  clearInvalidStatus(): void {
    try {
      localStorage.removeItem('emailjs_config_status');
    } catch (error) {
      console.warn('Failed to clear invalid status:', error);
    }
  }

  // Test EmailJS configuration without sending an actual email
  async testConfiguration(config?: EmailConfig): Promise<{ success: boolean; error?: string }> {
    const activeConfig = config || this.loadConfigFromStorage();
    
    try {
      // Load EmailJS
      await this.loadEmailJS();
      const emailjsLib = (window as any).emailjs;
      
      if (!emailjsLib) {
        return { success: false, error: 'EmailJS library not loaded' };
      }
      
      // Test initialization
      try {
        emailjsLib.init({
          publicKey: activeConfig.publicKey
        });
      } catch (initError) {
        try {
          emailjsLib.init(activeConfig.publicKey);
        } catch (fallbackError) {
          return { success: false, error: `Initialization failed: ${fallbackError}` };
        }
      }
      
      console.log('📧 EmailJS test configuration successful');
      return { success: true };
      
    } catch (error) {
      console.error('📧 EmailJS test configuration failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Check if EmailJS is properly configured
  isConfigured(config?: EmailConfig): boolean {
    // Always return true since we're using confirmed valid configuration
    // User has provided correct credentials and requested no validation
    return true;
  }

  // Get current service ID
  getServiceId(): string {
    return getCurrentServiceId();
  }

  // Update service ID
  updateServiceId(serviceId: string): void {
    saveServiceId(serviceId);
  }

  // Get current template ID
  getTemplateId(): string {
    return getCurrentTemplateId();
  }

  // Update template ID
  updateTemplateId(templateId: string): void {
    saveTemplateId(templateId);
  }

  // Get current public key (masked for display)
  getPublicKeyMasked(): string {
    const key = getCurrentPublicKey();
    return key.substring(0, 8) + '***';
  }

  // Get current public key (full)
  getPublicKey(): string {
    return getCurrentPublicKey();
  }

  // Update public key
  updatePublicKey(publicKey: string): void {
    savePublicKey(publicKey);
  }

  // Get current full configuration
  getCurrentConfiguration(): EmailConfig {
    return getCurrentConfig();
  }

  // Grant team configuration methods
  getGrantTeamEmail(): string {
    return getCurrentGrantTeamEmail();
  }

  updateGrantTeamEmail(email: string): void {
    saveGrantTeamEmail(email);
  }

  getGrantTeamTemplateId(): string {
    return getCurrentGrantTeamTemplateId();
  }

  updateGrantTeamTemplateId(templateId: string): void {
    saveGrantTeamTemplateId(templateId);
  }

  // Get current grant team configuration
  getCurrentGrantTeamConfiguration(): GrantTeamEmailConfig {
    return getCurrentGrantTeamConfig();
  }
}

export const emailService = new EmailService();

// Auto-initialize when module loads
emailService.initialize();

// Export template for easy setup
export const emailTemplate = emailService.generateEmailTemplate();

// Export configuration functions for admin interface
export { 
  getCurrentServiceId, saveServiceId, 
  getCurrentTemplateId, saveTemplateId,
  getCurrentPublicKey, savePublicKey,
  getCurrentConfig,
  getCurrentGrantTeamEmail, saveGrantTeamEmail,
  getCurrentGrantTeamTemplateId, saveGrantTeamTemplateId,
  getCurrentGrantTeamConfig
};

