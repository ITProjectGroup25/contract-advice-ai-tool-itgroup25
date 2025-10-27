"use client";

import { ArrowLeft, Bot, Send, User, ThumbsUp, AlertCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { conversationFlow, generateFaqFoundMessage } from "./conversationFlow";
import { useGetFaq } from "./useGetFaq";

// Define the structure for conversation flow
interface ChatMessage {
  id: string;
  text: string;
  sender: "bot" | "user";
  timestamp: Date;
}

export interface ChatOption {
  id: string;
  text: string;
  nextNodeId?: string;
  action?: () => void;
}

interface ChatBotProps {
  onBack?: () => void;
  initialNodeId?: string;
  submissionId?: string;
  onSatisfied?: () => void;
  onNeedHelp?: () => void;
}

export function ChatBot({ onBack, initialNodeId = "start", submissionId, onSatisfied, onNeedHelp }: ChatBotProps) {
  const { matchedFaqs, submission, isLoading, error } = useGetFaq({
    submissionUid: submissionId,
    formId: 2,
  });

  console.log({ matchedFaqs, submission });

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

  // Initialize with FAQ-based flow when submission is loaded
  useEffect(() => {
    if (hasInitialized.current || isLoading || !submissionId) return;

    hasInitialized.current = true;

    // Check if we have matched FAQs
    if (matchedFaqs && matchedFaqs.length > 0) {
      // Use the highest scoring FAQ
      const topFaq = matchedFaqs[0];
      const faqMessage = generateFaqFoundMessage(topFaq);
      
      // Update the faq_found node message dynamically
      conversationFlow.faq_found.message = faqMessage;
      
      setCurrentNodeId("faq_found");
      addBotMessage(faqMessage);
    } else {
      // No FAQs found
      setCurrentNodeId("faq_not_found");
      addBotMessage(conversationFlow.faq_not_found.message);
    }
  }, [matchedFaqs, isLoading, submissionId]);

  // Fallback initialization for non-submission flow
  useEffect(() => {
    if (hasInitialized.current || submissionId) return;

    const initialNode = conversationFlow[initialNodeId];
    if (initialNode) {
      hasInitialized.current = true;
      addBotMessage(initialNode.message);
    }
  }, [initialNodeId, submissionId]);

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
    }, 500);
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

  // Custom handlers for FAQ buttons
  const handleSatisfied = () => {
    if (onSatisfied) {
      // Use parent callback if provided
      onSatisfied();
    } else {
      // Default behavior
      const option = conversationFlow.faq_found.options?.find(opt => opt.id === "opt1");
      if (option) handleOptionClick(option);
    }
  };

  const handleNeedHelp = () => {
    if (onNeedHelp) {
      // Use parent callback if provided
      onNeedHelp();
    } else {
      // Default behavior
      const option = conversationFlow.faq_found.options?.find(opt => opt.id === "opt2");
      if (option) handleOptionClick(option);
    }
  };

  const currentNode = conversationFlow[currentNodeId];

  if (isLoading) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <div className="text-center">
          <Bot className="mx-auto mb-4 h-12 w-12 animate-pulse text-blue-600" />
          <p className="text-gray-600">Loading your information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error: {error.message}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`mx-auto max-w-4xl`}>
      {onBack && (
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="mb-6 flex items-center gap-2 border border-white bg-green-700 px-4 py-2 text-white hover:bg-green-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      )}

      <div className="flex h-[600px] flex-col rounded-lg border bg-white shadow-sm">
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
                  <p className="whitespace-pre-line text-sm">
                    {message.text.split(/(\*\*.*?\*\*)/).map((part, index) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return (
                          <strong key={index} className="font-bold text-blue-700">
                            {part.slice(2, -2)}
                          </strong>
                        );
                      }
                      return part;
                    })}
                  </p>
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
          {/* Special styling for FAQ response buttons */}
          {currentNodeId === "faq_found" && currentNode?.options && currentNode.options.length > 0 && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={handleSatisfied}
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <ThumbsUp className="h-4 w-4" />
                Yes, this helped!
              </Button>

              <Button
                onClick={handleNeedHelp}
                variant="outline"
                className="flex items-center justify-center gap-2 border-orange-200 hover:bg-orange-50"
              >
                <AlertCircle className="h-4 w-4 text-orange-600" />
                I need human assistance
              </Button>
            </div>
          )}

          {/* Regular options for other nodes */}
          {currentNodeId !== "faq_found" && currentNode?.options && currentNode.options.length > 0 && !currentNode.allowFreeText && (
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
      </div>
    </div>
  );
}