import { ChatOption } from "./ChatBot";
import { MatchedFAQ } from "./useGetFaq";
import { extractFaqFieldInfo } from "./utils/extractFaqFieldInfo";

interface ChatNode {
  id: string;
  message: string;
  options?: ChatOption[];
  allowFreeText?: boolean;
  onUserInput?: (input: string) => string | void;
}

export const conversationFlow: Record<string, ChatNode> = {
  start: {
    id: "start",
    message: "Hello! I'm your Grants Assistant. How can I help you today?",
    options: [
      { id: "opt1", text: "I have a question about eligibility", nextNodeId: "eligibility" },
      { id: "opt2", text: "I need help with my application", nextNodeId: "application" },
      { id: "opt3", text: "I want to check application status", nextNodeId: "status" },
      { id: "opt4", text: "Other inquiry", nextNodeId: "other" },
    ],
  },
  eligibility: {
    id: "eligibility",
    message: "What type of eligibility question do you have?",
    options: [
      { id: "opt1", text: "Who can apply?", nextNodeId: "who_can_apply" },
      { id: "opt2", text: "What are the requirements?", nextNodeId: "requirements" },
      { id: "opt3", text: "Go back", nextNodeId: "start" },
    ],
  },
  who_can_apply: {
    id: "who_can_apply",
    message:
      "Our grants are available to registered non-profit organizations, educational institutions, and community groups that have been operating for at least 2 years. Would you like more specific information?",
    options: [
      { id: "opt1", text: "Tell me about non-profit requirements", nextNodeId: "nonprofit_req" },
      { id: "opt2", text: "Tell me about educational institution requirements", nextNodeId: "edu_req" },
      { id: "opt3", text: "Start over", nextNodeId: "start" },
    ],
  },
  nonprofit_req: {
    id: "nonprofit_req",
    message:
      "For non-profit organizations, you must:\n• Have valid 501(c)(3) status\n• Have been operational for 2+ years\n• Have an annual budget under $5M\n• Serve the local community\n\nWould you like to know anything else?",
    options: [
      { id: "opt1", text: "Ask another question", nextNodeId: "start" },
      { id: "opt2", text: "How do I apply?", nextNodeId: "application" },
    ],
  },
  edu_req: {
    id: "edu_req",
    message:
      "For educational institutions, you must:\n• Be an accredited institution\n• Have a program that benefits underserved communities\n• Provide matching funds of at least 25%\n• Submit a detailed curriculum plan\n\nWould you like to know anything else?",
    options: [
      { id: "opt1", text: "Ask another question", nextNodeId: "start" },
      { id: "opt2", text: "How do I apply?", nextNodeId: "application" },
    ],
  },
  requirements: {
    id: "requirements",
    message:
      "General requirements include:\n• Completed application form\n• Proof of organizational status\n• Project budget and timeline\n• Letters of support\n• Financial statements (last 2 years)\n\nWhat else can I help with?",
    options: [
      { id: "opt1", text: "Where do I find the application?", nextNodeId: "application" },
      { id: "opt2", text: "Ask something else", nextNodeId: "start" },
    ],
  },
  application: {
    id: "application",
    message: "I can help you with your application. What do you need assistance with?",
    options: [
      { id: "opt1", text: "Where do I find the application form?", nextNodeId: "find_form" },
      { id: "opt2", text: "What's the deadline?", nextNodeId: "deadline" },
      { id: "opt3", text: "How long does it take?", nextNodeId: "timeline" },
      { id: "opt4", text: "Go back", nextNodeId: "start" },
    ],
  },
  find_form: {
    id: "find_form",
    message:
      "You can find the application form on our website at grants.example.com/apply. The form includes:\n• Basic organization information\n• Project description\n• Budget breakdown\n• Supporting documents upload\n\nIs there anything else I can help with?",
    options: [
      { id: "opt1", text: "What's the deadline?", nextNodeId: "deadline" },
      { id: "opt2", text: "Ask another question", nextNodeId: "start" },
    ],
  },
  deadline: {
    id: "deadline",
    message:
      "Our grant application deadlines are:\n• Spring cycle: March 31st\n• Fall cycle: September 30th\n\nApplications are reviewed on a rolling basis within each cycle. Would you like to know more?",
    options: [
      { id: "opt1", text: "How long does review take?", nextNodeId: "timeline" },
      { id: "opt2", text: "Ask something else", nextNodeId: "start" },
    ],
  },
  timeline: {
    id: "timeline",
    message:
      "Our typical timeline is:\n• Initial review: 2-3 weeks\n• Committee review: 4-6 weeks\n• Final decision: 8-10 weeks from submission\n\nYou'll receive email updates at each stage. What else can I help with?",
    options: [
      { id: "opt1", text: "Check application status", nextNodeId: "status" },
      { id: "opt2", text: "Ask another question", nextNodeId: "start" },
    ],
  },
  status: {
    id: "status",
    message:
      "To check your application status, please provide your application ID (format: APP-XXXXX):",
    allowFreeText: true,
    onUserInput: (input: string) => {
      if (input.toUpperCase().startsWith("APP-")) {
        return "status_found";
      }
      return "status_not_found";
    },
  },
  status_found: {
    id: "status_found",
    message:
      "Thank you! Your application is currently under review by our grants committee. You should receive an update within the next 2 weeks. We'll notify you by email once a decision has been made.\n\nIs there anything else I can help with?",
    options: [
      { id: "opt1", text: "Ask another question", nextNodeId: "start" },
      { id: "opt2", text: "I need human assistance", nextNodeId: "escalate" },
    ],
  },
  status_not_found: {
    id: "status_not_found",
    message:
      "I couldn't find an application with that ID. Please make sure you're using the correct format (APP-XXXXX). Would you like to try again or speak with someone?",
    options: [
      { id: "opt1", text: "Try again", nextNodeId: "status" },
      { id: "opt2", text: "Speak with someone", nextNodeId: "escalate" },
      { id: "opt3", text: "Go back", nextNodeId: "start" },
    ],
  },
  other: {
    id: "other",
    message:
      "I'm here to help! Could you briefly describe what you need assistance with?",
    allowFreeText: true,
    onUserInput: () => "other_received",
  },
  other_received: {
    id: "other_received",
    message:
      "Thank you for sharing that. For complex or specific inquiries, I recommend speaking with a member of our grants team who can provide personalized assistance.",
    options: [
      { id: "opt1", text: "Contact grants team", nextNodeId: "escalate" },
      { id: "opt2", text: "Ask a different question", nextNodeId: "start" },
    ],
  },
  escalate: {
    id: "escalate",
    message:
      "I'll connect you with our grants team. Please provide your email address so they can reach you:",
    allowFreeText: true,
    onUserInput: (input: string) => {
      if (input.includes("@")) {
        return "escalate_complete";
      }
      return "escalate_invalid";
    },
  },
  escalate_invalid: {
    id: "escalate_invalid",
    message: "That doesn't appear to be a valid email address. Please try again:",
    allowFreeText: true,
    onUserInput: (input: string) => {
      if (input.includes("@")) {
        return "escalate_complete";
      }
      return "escalate_invalid";
    },
  },
  escalate_complete: {
    id: "escalate_complete",
    message:
      "Perfect! Your request has been forwarded to our grants team. You'll receive a response at the email address you provided soon. Is there anything else I can help with right now?",
    options: [
      { id: "opt1", text: "Ask another question", nextNodeId: "start" },
      { id: "opt2", text: "No, I'm all set", nextNodeId: "end" },
    ],
  },
  end: {
    id: "end",
    message:
      "Thank you for using our Grants Assistant! If you have any other questions in the future, feel free to start a new chat. Have a great day!",
    options: [],
  },

  // New FAQ-based flow nodes
  faq_found: {
    id: "faq_found",
    message: "", // Will be dynamically set
    options: [
      { id: "opt1", text: "Yes, this answers my question", nextNodeId: "faq_satisfied" },
      { id: "opt2", text: "No, I need further human assistance", nextNodeId: "faq_escalate" },
    ],
  },
  faq_satisfied: {
    id: "faq_satisfied",
    message:
      "Great! I'm glad I could help. If you have any other questions in the future, feel free to reach out. Have a great day!",
    options: [],
  },
  faq_escalate: {
    id: "faq_escalate",
    message:
      "No problem! Your original form submission will be forwarded to our grants team for manual review. You'll receive a response soon.\n",
    options: [],
  },
  faq_not_found: {
    id: "faq_not_found",
    message:
      "Unfortunately, we have not found any pre-prepared answers for your form selections. We have forwarded your form to the RIC staff who will contact you at their earliest availability.\n",
    options: [],
  },
};

// Helper function to generate FAQ found message with better formatting
export function generateFaqFoundMessage(faq: MatchedFAQ): string {
  const fieldInfo = extractFaqFieldInfo(faq);

  let selectionsText = "";
  if (fieldInfo.length > 0) {
    selectionsText = fieldInfo
      .map(({ question, answer }) => `**${question}:** ${answer}`)
      .join("\n");
  } else {
    selectionsText = "your selections";
  }

  return `Good news! We have found pre-prepared answers for your form selections provided by the RIC Staff.\n\n**Your Selections:**\n${selectionsText}\n\n**Answer from RIC Staff:**\n${faq.answer}\n\nDoes this answer your question?`;
}