// Dynamic Form Types for Contract Advice AI Tool

export interface Question {
  id: string;
  type: 'text' | 'email' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
  conditional?: {
    dependsOn: string;
    showWhen: string[];
  };
  visible: boolean;
  order: number;
  sectionId: string;
  helpText?: string;
  defaultValue?: any;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  visible: boolean;
  conditional?: {
    dependsOn: string;
    showWhen: string[];
  };
  icon?: string;
}

export interface FormData {
  [key: string]: any;
}

export interface FormSubmission {
  id: string;
  formData: FormData;
  submittedAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'escalated';
  queryType: 'simple' | 'complex';
  submitterEmail?: string;
  submitterName?: string;
}

export interface EmailData {
  to: string;
  subject: string;
  message?: string;
  submissionId?: string;
  formData?: FormData;
  submitterName?: string;
  submitterEmail?: string;
  queryType?: string;
  timestamp?: string;
}

export interface GrantTeamEmailData extends EmailData {
  grantTeam: string[];
  urgency: boolean;
}

// Default form configuration
export interface FormConfig {
  questions: Question[];
  sections: FormSection[];
  emailSettings?: {
    serviceId: string;
    templateId: string;
    publicKey: string;
  };
}

// Admin interface types
export interface AdminSettings {
  emailConfiguration: {
    serviceId: string;
    templateId: string;
    publicKey: string;
    enabled: boolean;
  };
  formSettings: {
    allowFileUploads: boolean;
    maxFileSize: number;
    allowedFileTypes: string[];
  };
}

export type AppState = 'form' | 'simple-response' | 'success' | 'admin' | 'chatbot';

export interface SimpleQueryResponse {
  submissionId: string;
  response: string;
  confidence: number;
  needsHumanReview: boolean;
  suggestedActions?: string[];
}
