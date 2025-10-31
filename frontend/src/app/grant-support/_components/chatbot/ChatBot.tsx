"use client";

import { AlertCircle, ArrowLeft, Bot, Send, ThumbsUp, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { conversationFlow, generateFaqFoundMessage } from "./conversationFlow";
import { useGetFaq } from "./useGetFaq";

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
  formId?: number;
}

const REDIRECT_COUNTDOWN = 15;
const NO_MATCH_REDIRECT_DELAY = 12;

export function ChatBot({
  onBack,
  initialNodeId = "start",
  submissionId,
  onSatisfied,
  onNeedHelp,
  formId = 2,
}: ChatBotProps) {
  const logSequenceRef = useRef(0);
  const debug = (...args: any[]) => {
    logSequenceRef.current += 1;
    console.debug(`[ChatBot][${logSequenceRef.current}]`, ...args);
  };

  const { matchedFaqs, isLoading, error } = useGetFaq({
    submissionUid: submissionId,
    formId,
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState(initialNodeId);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showContent, setShowContent] = useState(!submissionId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const loadingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasLoggedStuckProgressRef = useRef(false);
  const autoEscalatedRef = useRef(false);
  const hasNotifiedGrantTeamRef = useRef(false);

  useEffect(() => {
    autoEscalatedRef.current = false;
    hasNotifiedGrantTeamRef.current = false;
  }, [submissionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      countdownTimerRef.current = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsRedirecting(true);
      const currentNode = conversationFlow[currentNodeId];
      if (currentNode) {
        if (currentNodeId === "faq_satisfied" && onSatisfied) {
          debug("Countdown completed at faq_satisfied; notifying parent");
          onSatisfied();
        } else if (currentNodeId === "faq_escalate" || currentNodeId === "faq_not_found") {
          debug("Countdown completed; escalating to grants team");
          notifyGrantTeam();
        }
      }
    }

    return () => {
      if (countdownTimerRef.current) {
        clearTimeout(countdownTimerRef.current);
      }
    };
  }, [countdown, currentNodeId, onSatisfied, onNeedHelp]);

  useEffect(() => {
    if (!submissionId) {
      debug("No submission ID; presenting default chat");
      setProgress(100);
      setShowContent(true);
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
        loadingIntervalRef.current = null;
      }
      return;
    }

    if (isLoading) {
      setShowContent(false);
      setProgress(10);
      hasLoggedStuckProgressRef.current = false;
      debug("FAQ lookup started", { submissionId, formId });
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
      }
      loadingIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          const increment = Math.random() * 15 + 5;
          const nextProgress = Math.min(prev + increment, 90);
          if (Math.floor(nextProgress / 10) !== Math.floor(prev / 10)) {
            debug("Progress updated", { previous: prev, next: nextProgress });
          }
          return nextProgress;
        });
      }, 180);
      return () => {
        if (loadingIntervalRef.current) {
          clearInterval(loadingIntervalRef.current);
          loadingIntervalRef.current = null;
        }
      };
    }

    if (loadingIntervalRef.current) {
      clearInterval(loadingIntervalRef.current);
      loadingIntervalRef.current = null;
    }
    debug("FAQ lookup completed", {
      submissionId,
      matchedFaqs: matchedFaqs?.length ?? 0,
    });
    setProgress(100);
  }, [isLoading, submissionId, matchedFaqs?.length, formId]);

  useEffect(() => {
    if (!submissionId) {
      return;
    }

    if (!isLoading && messages.length > 0) {
      const timeout = setTimeout(() => setShowContent(true), 50);
      debug("Initial bot response ready; revealing chat");
      return () => clearTimeout(timeout);
    }

    return undefined;
  }, [isLoading, messages.length, submissionId]);

  useEffect(() => {
    if (!error) {
      return;
    }

    debug("FAQ lookup error", error);
    setShowContent(true);
    if (loadingIntervalRef.current) {
      clearInterval(loadingIntervalRef.current);
      loadingIntervalRef.current = null;
    }
  }, [error]);

  useEffect(() => {
    return () => {
      if (loadingIntervalRef.current) {
        debug("Cleaning progress interval on unmount");
        clearInterval(loadingIntervalRef.current);
        loadingIntervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (hasInitialized.current || isLoading || !submissionId) return;

    hasInitialized.current = true;

    if (matchedFaqs && matchedFaqs.length > 0) {
      const topFaq = matchedFaqs[0];
      const faqMessage = generateFaqFoundMessage(topFaq);
      debug("Matched FAQ found", {
        submissionId,
        matchedCount: matchedFaqs.length,
        topFaqId: topFaq.id,
        matchScore: topFaq.matchScore,
      });

      conversationFlow.faq_found.message = faqMessage;

      setCurrentNodeId("faq_found");
      addBotMessage(faqMessage);
    } else {
      debug("No matching FAQs; displaying escalation notice", { submissionId });
      setCurrentNodeId("faq_not_found");
      addBotMessage(conversationFlow.faq_not_found.message);
      if (!autoEscalatedRef.current) {
        autoEscalatedRef.current = true;
        notifyGrantTeam();
        debug("Scheduling automatic escalation", { delaySeconds: NO_MATCH_REDIRECT_DELAY });
        setCountdown(NO_MATCH_REDIRECT_DELAY);
      }
    }
  }, [matchedFaqs, isLoading, submissionId]);

  useEffect(() => {
    if (hasInitialized.current || submissionId) return;

    const initialNode = conversationFlow[initialNodeId];
    if (initialNode) {
      hasInitialized.current = true;
      debug("Bootstrapping conversation with initial node", { nodeId: initialNodeId });
      addBotMessage(initialNode.message);
    }
  }, [initialNodeId, submissionId]);

  const addBotMessage = (text: string) => {
    debug("Queueing bot message", { preview: text.slice(0, 80) });
    setIsTyping(true);
    setTimeout(() => {
      const newMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        text,
        sender: "bot",
        timestamp: new Date(),
      };
      debug("Bot message added", { messageId: newMessage.id });
      setMessages((prev) => [...prev, newMessage]);
      setIsTyping(false);
    }, 200);
  };

  const notifyGrantTeam = () => {
    if (hasNotifiedGrantTeamRef.current) {
      return;
    }
    if (onNeedHelp) {
      hasNotifiedGrantTeamRef.current = true;
      onNeedHelp();
    }
  };

  const addUserMessage = (text: string) => {
    const newMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text,
      sender: "user",
      timestamp: new Date(),
    };
    debug("User message added", { messageId: newMessage.id });
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleOptionClick = (option: ChatOption) => {
    addUserMessage(option.text);
    debug("User selected option", { optionId: option.id, nextNodeId: option.nextNodeId });

    if (option.action) {
      debug("Executing option action", { optionId: option.id });
      option.action();
    }

    if (option.nextNodeId) {
      setTimeout(() => {
        const nextNode = conversationFlow[option.nextNodeId!];
        if (nextNode) {
          debug("Navigating to node", { nodeId: option.nextNodeId });
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
    debug("User submitted free text", { nodeId: currentNodeId, text: userInput });

    const input = userInput;
    setUserInput("");

    if (currentNode.onUserInput) {
      setTimeout(() => {
        const nextNodeId = currentNode.onUserInput!(input);
        if (nextNodeId && typeof nextNodeId === "string") {
          const nextNode = conversationFlow[nextNodeId];
          if (nextNode) {
            debug("Free-text navigation", { from: currentNodeId, to: nextNodeId });
            setCurrentNodeId(nextNodeId);
            addBotMessage(nextNode.message);
          }
        }
      }, 600);
    }
  };

  const handleSatisfied = async () => {
    debug("User indicated FAQ was helpful");
    const option = conversationFlow.faq_found.options?.find((opt) => opt.id === "opt1");
    if (option) {
      handleOptionClick(option);
      setTimeout(() => {
        debug("Starting satisfaction countdown", { seconds: 10 });
        setCountdown(10);
      }, 600);
    }
  };

  const handleNeedHelp = async () => {
    debug("User requested human assistance after FAQ");
    const option = conversationFlow.faq_found.options?.find((opt) => opt.id === "opt2");
    if (option) {
      handleOptionClick(option);
      notifyGrantTeam();
      setTimeout(() => {
        debug("Starting escalation countdown", { seconds: REDIRECT_COUNTDOWN });
        setCountdown(REDIRECT_COUNTDOWN);
      }, 600);
    }
  };

  useEffect(() => {
    if (!submissionId) return;
    if (progress === 100 && !showContent && !isLoading && !hasLoggedStuckProgressRef.current) {
      hasLoggedStuckProgressRef.current = true;
      debug("Progress reached 100% but content still hidden", {
        messagesCount: messages.length,
        isLoading,
      });
    }
    if (showContent) {
      hasLoggedStuckProgressRef.current = false;
    }
  }, [progress, showContent, submissionId, messages.length, isLoading]);

  const currentNode = conversationFlow[currentNodeId];

  if (!showContent) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <div className="w-full max-w-lg space-y-4 rounded-lg border border-green-200 bg-white p-8 text-center shadow-sm">
          <Bot className="mx-auto h-12 w-12 text-green-600" />
          <h2 className="text-xl font-semibold text-green-700">Generating recommendations...</h2>
          <p className="text-muted-foreground text-sm">
            We&apos;re matching your submission with relevant guidance.
          </p>
          <div className="mx-auto h-2 w-full max-w-md rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-green-600 transition-all duration-150 ease-linear"
              style={{ width: `${Math.round(progress)}%` }}
            />
          </div>
          <p className="text-xs font-medium text-muted-foreground">{Math.round(progress)}% complete</p>
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
                    message.sender === "user" ? "bg-green-100" : "bg-blue-100"
                  }`}
                >
                  {message.sender === "user" ? (
                    <User className="h-4 w-4 text-green-700" />
                  ) : (
                    <Bot className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <div
                  className={`rounded-lg px-4 py-2 text-sm ${
                    message.sender === "user" ? "bg-green-600 text-white" : "bg-gray-100 text-black"
                  }`}
                >
                  {message.text.split("\n").map((line, index) => (
                    <p key={index} className={line.startsWith("**") ? "font-semibold" : ""}>
                      {line.replace(/\*\*/g, "")}
                    </p>
                  ))}
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

          {countdown !== null && (
            <div className="flex justify-center">
              <div className="rounded-lg border-2 border-orange-300 bg-orange-50 px-6 py-4 text-center">
                <p className="text-sm font-semibold text-orange-800">
                  {isRedirecting ? (
                    "Redirecting now..."
                  ) : (
                    <>
                      We are going to redirect you to the debrief page in{" "}
                      <span className="text-lg font-bold">{countdown}</span> seconds
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="border-t bg-gray-50 p-4">
          {currentNodeId === "faq_found" && currentNode?.options && currentNode.options.length > 0 && (
            <div className="space-y-4">
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

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> If you selected &quot;I need human assistance,&quot; your
                  original form submission will be forwarded to our grants team for manual review.
                  You&apos;ll receive a response within 1-2 business days.
                </p>
              </div>
            </div>
          )}

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
