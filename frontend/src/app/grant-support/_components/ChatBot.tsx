"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { MessageCircle, User, Bot, ArrowLeft } from "lucide-react";
import { useState } from "react";

interface ChatBotProps {
  onBack: () => void;
}

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
}

export function ChatBot({ onBack }: ChatBotProps) {
  const [messages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content:
        "Hi! This is a sample response. Your simple query has been received and is being processed. How can I assist you further?",
      timestamp: new Date(),
    },
  ]);

  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just clear the input as this is a sample implementation
    setNewMessage("");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Form
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl">Referral Assistant</h1>
          <p className="text-muted-foreground">Your simple query has been submitted successfully</p>
        </div>
      </div>

      {/* Chat Interface */}
      <Card className="flex min-h-[600px] flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat Support
          </CardTitle>
          <CardDescription>Get instant responses to your queries</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col">
          {/* Messages */}
          <div className="mb-6 flex-1 space-y-4 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.type === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`rounded-full p-2 ${
                    message.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {message.type === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>

                <div
                  className={`max-w-[80%] ${message.type === "user" ? "text-right" : "text-left"}`}
                >
                  <div
                    className={`rounded-lg p-3 ${
                      message.type === "user"
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-muted"
                    }`}
                  >
                    <p>{message.content}</p>
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button type="submit" disabled={!newMessage.trim()}>
              Send
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
