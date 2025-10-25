"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Bot, User, Send, ArrowLeft } from "lucide-react";

// Define the structure for conversation flow
interface ChatMessage {
  id: string;
  text: string;
  sender: "bot" | "user";
  timestamp: Date;
}

interface ChatOption {
  id: string;
  text: string;
  nextNodeId?: string;
  action?: () => void;
}

interface ChatNode {
  id: string;
  message: string;
  options?: ChatOption[];
  allowFreeText?: boolean;
  onUserInput?: (input: string) => string | void; // Returns next node ID or void
}

// Define your conversation flow here
const conversationFlow: Record<string, ChatNode> = {
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
      // Simple validation for demo purposes
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
      "I'll connect you with our grants team. They typically respond within 1-2 business days. Please provide your email address so they can reach you:",
    allowFreeText: true,
    onUserInput: (input: string) => {
      // Basic email validation
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
      "Perfect! Your request has been forwarded to our grants team. You'll receive a response at the email address you provided within 1-2 business days. Is there anything else I can help with right now?",
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
};

interface ChatBotProps {
  onBack?: () => void;
  initialNodeId?: string;
  className?: string;
}

export function ChatBot({ onBack, initialNodeId = "start", className = "" }: ChatBotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState(initialNodeId);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with first message
  useEffect(() => {
    if (hasInitialized.current) return;
    
    const initialNode = conversationFlow[initialNodeId];
    if (initialNode) {
      hasInitialized.current = true;
      addBotMessage(initialNode.message);
    }
  }, [initialNodeId]);

  const addBotMessage = (text: string) => {
    setIsTyping(true);
    setTimeout(() => {
      const newMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        text,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
      setIsTyping(false);
    }, 500); // Simulate typing delay
  };

  const addUserMessage = (text: string) => {
    const newMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleOptionClick = (option: ChatOption) => {
    addUserMessage(option.text);

    if (option.action) {
      option.action();
    }

    if (option.nextNodeId) {
      setTimeout(() => {
        const nextNode = conversationFlow[option.nextNodeId!];
        if (nextNode) {
          setCurrentNodeId(option.nextNodeId!);
          addBotMessage(nextNode.message);
        }
      }, 600);
    }
  };

  const handleUserInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const currentNode = conversationFlow[currentNodeId];
    addUserMessage(userInput);

    const input = userInput;
    setUserInput("");

    if (currentNode.onUserInput) {
      setTimeout(() => {
        const nextNodeId = currentNode.onUserInput!(input);
        if (nextNodeId && typeof nextNodeId === "string") {
          const nextNode = conversationFlow[nextNodeId];
          if (nextNode) {
            setCurrentNodeId(nextNodeId);
            addBotMessage(nextNode.message);
          }
        }
      }, 600);
    }
  };

  const currentNode = conversationFlow[currentNodeId];

  return (
    <div className={`mx-auto max-w-4xl space-y-6 p-6 ${className}`}>
      {onBack && (
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2 border border-white bg-green-700 px-4 py-2 text-white hover:bg-green-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      )}

      <Card className="flex h-[600px] flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="text-primary h-5 w-5" />
            Grants Assistant Chat
          </CardTitle>
          <CardDescription>Get instant answers to your grant-related questions</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
          {/* Messages Container */}
          <div
            ref={chatContainerRef}
            className="flex-1 space-y-4 overflow-y-auto p-6"
            style={{ scrollBehavior: "smooth" }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex max-w-[80%] items-start gap-2 ${
                    message.sender === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      message.sender === "bot" ? "bg-blue-100" : "bg-green-100"
                    }`}
                  >
                    {message.sender === "bot" ? (
                      <Bot className="h-4 w-4 text-blue-600" />
                    ) : (
                      <User className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      message.sender === "bot"
                        ? "bg-gray-100 text-gray-900"
                        : "bg-green-600 text-white"
                    }`}
                  >
                    <p className="whitespace-pre-line text-sm">{message.text}</p>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="rounded-lg bg-gray-100 px-4 py-2">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Options or Input Area */}
          <div className="border-t bg-gray-50 p-4">
            {currentNode?.options && currentNode.options.length > 0 && !currentNode.allowFreeText && (
              <div className="flex flex-wrap gap-2">
                {currentNode.options.map((option) => (
                  <Button
                    key={option.id}
                    onClick={() => handleOptionClick(option)}
                    variant="outline"
                    className="bg-white transition-colors hover:border-green-600 hover:bg-green-600 hover:text-white"
                  >
                    {option.text}
                  </Button>
                ))}
              </div>
            )}

            {currentNode?.allowFreeText && (
              <form onSubmit={handleUserInputSubmit} className="flex gap-2">
                <Input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type your response..."
                  className="flex-1"
                  autoFocus
                />
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                  disabled={!userInput.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            )}

            {currentNode?.options && currentNode.options.length > 0 && currentNode.allowFreeText && (
              <div className="mt-3 flex flex-wrap gap-2">
                {currentNode.options.map((option) => (
                  <Button
                    key={option.id}
                    onClick={() => handleOptionClick(option)}
                    variant="outline"
                    size="sm"
                    className="bg-white transition-colors hover:border-green-600 hover:bg-green-600 hover:text-white"
                  >
                    {option.text}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}