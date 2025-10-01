"use client";

import ChatBot from "react-chatbotify";
import { useEffect, useState } from "react";

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

interface RICChatbotProps {
  faqs: FAQ[];
  formUrl?: string; // URL to redirect users to the form
}

const RICChatbot = ({ faqs, formUrl = "/form" }: RICChatbotProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const findAnswer = (userQuestion: string): string | null => {
    const normalizedUserQuestion = userQuestion.toLowerCase().trim();

    // Find the best match by checking if the FAQ question is contained in the user's question
    // or if the user's question is contained in the FAQ question
    for (const faq of faqs) {
      const normalizedFaqQuestion = faq.question.toLowerCase();

      // Check for keyword matches
      if (
        normalizedUserQuestion.includes(normalizedFaqQuestion) ||
        normalizedFaqQuestion.includes(normalizedUserQuestion)
      ) {
        return faq.answer;
      }

      // Check for significant word overlap
      const userWords = normalizedUserQuestion
        .split(/\s+/)
        .filter((w) => w.length > 3);
      const faqWords = normalizedFaqQuestion
        .split(/\s+/)
        .filter((w) => w.length > 3);

      const matchingWords = userWords.filter((word) =>
        faqWords.some(
          (faqWord) => faqWord.includes(word) || word.includes(faqWord)
        )
      );

      // If more than 50% of the words match, return this answer
      if (
        matchingWords.length > userWords.length * 0.5 &&
        userWords.length > 0
      ) {
        return faq.answer;
      }
    }

    return null;
  };

  const flow = {
    start: {
      message:
        "Hi there! Before sending a message off to the RIC staff, please let me see if I can help you with any of your queries.",
      path: "ask_question",
    },
    ask_question: {
      message: (params: any) => {
        const userInput = params.userInput;

        if (!userInput || userInput.trim() === "") {
          return "Please type your question below.";
        }

        const answer = findAnswer(userInput);

        if (answer) {
          return `We have an answer: ${answer}`;
        } else {
          return `Sorry, no answer available. Please fill out the survey so an RIC representative can help. [Click here to access the form](${formUrl})`;
        }
      },
      path: "ask_question", // Loop back to allow more questions
    },
  };

  const settings = {
    general: {
      primaryColor: "#2563eb",
      secondaryColor: "#1e40af",
      fontFamily: "Inter, sans-serif",
    },
    chatHistory: {
      storageKey: "ric_chatbot_history",
    },
    header: {
      title: "RIC Assistant",
      showAvatar: true,
    },
    chatButton: {
      icon: "💬",
    },
  };

  if (!mounted) {
    return null;
  }

  return <ChatBot flow={flow} settings={settings} />;
};

export default RICChatbot;
