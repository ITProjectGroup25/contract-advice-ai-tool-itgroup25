"use client";

import { ArrowLeft, Bot, Send, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { conversationFlow } from "./conversationFlow";
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


// Define your conversation flow here


interface ChatBotProps {
  onBack?: () => void;
  initialNodeId?: string;
  submissionId?: string;
}

export function ChatBot({ onBack, initialNodeId = "start", submissionId }: ChatBotProps) {

  const { matchedFaqs, submission, isLoading, error } = useGetFaq({
    submissionUid: submissionId,
    formId: 2,
  });

  console.log({matchedFaqs, submission})

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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className={`mx-auto max-w-4xl space-y-6 p-6`}>
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