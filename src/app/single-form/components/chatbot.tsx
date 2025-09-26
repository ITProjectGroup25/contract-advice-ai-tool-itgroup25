import { Bot, ChevronRight, Send, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { conversationConfig, faqData } from "./conversation";

const ChatbotInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState(
    conversationConfig.initialStep
  );
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [conversationStarted, setConversationStarted] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!conversationStarted) {
      setConversationStarted(true);
      setTimeout(() => {
        executeStep(conversationConfig.initialStep);
      }, 500);
    }
  }, [conversationStarted]);

  const addMessage = (
    text,
    sender,
    isComponent = false,
    componentType = null
  ) => {
    const message = {
      id: Date.now() + Math.random(),
      text,
      sender,
      timestamp: new Date(),
      isComponent,
      componentType,
    };
    setMessages((prev) => [...prev, message]);
  };

  const executeStep = (stepName) => {
    const step = conversationConfig.steps[stepName];
    if (!step) {
      console.error(`Step '${stepName}' not found in configuration`);
      return;
    }

    switch (step.type) {
      case "bot_message":
        setIsTyping(true);
        setTimeout(() => {
          let message = step.message;
          if (selectedFaq && stepName === "show_faq_answer") {
            message = selectedFaq.answer;
          }
          addMessage(message, "bot");
          setIsTyping(false);
          if (step.nextStep) {
            setTimeout(() => {
              setCurrentStep(step.nextStep);
              executeStep(step.nextStep);
            }, step.delay || 1000);
          }
        }, step.delay || 1000);
        break;

      case "bot_component":
        setIsTyping(true);
        setTimeout(() => {
          addMessage("", "bot", true, step.component);
          setIsTyping(false);
          if (step.nextStep) {
            setTimeout(() => {
              setCurrentStep(step.nextStep);
              executeStep(step.nextStep);
            }, step.delay || 1000);
          }
        }, step.delay || 1000);
        break;

      case "user_input":
        setCurrentStep(stepName);
        break;

      case "end_conversation":
        setCurrentStep(stepName);
        break;

      default:
        console.warn(`Unknown step type: ${step.type}`);
    }
  };

  const handleFaqSelect = (faq) => {
    setSelectedFaq(faq);
    addMessage(`Yes - "${faq.question}"`, "user");
    setTimeout(() => {
      const nextStep =
        conversationConfig.steps[currentStep].responses["faq_selection"]
          .nextStep;
      setCurrentStep(nextStep);
      executeStep(nextStep);
    }, 500);
  };

  const handleUserResponse = (userInput) => {
    const step = conversationConfig.steps[currentStep];
    if (step.type !== "user_input") {
      console.warn(`Current step '${currentStep}' is not expecting user input`);
      return;
    }

    addMessage(userInput, "user");

    let responseType = "more_faqs";
    const lowerInput = userInput.toLowerCase().trim();

    if (lowerInput.includes("no")) {
      responseType = "no";
    } else if (
      step.responses.custom_query &&
      step.responses.custom_query.keywords
    ) {
      const keywords = step.responses.custom_query.keywords;
      const hasKeyword = keywords.some((keyword) =>
        lowerInput.includes(keyword.toLowerCase())
      );
      if (hasKeyword) {
        responseType = "custom_query";
      }
    }

    const response = step.responses[responseType];
    if (!response) return;

    if (response.message) {
      setIsTyping(true);
      setTimeout(() => {
        addMessage(response.message, "bot");
        setIsTyping(false);
        if (response.nextStep) {
          setTimeout(() => {
            setCurrentStep(response.nextStep);
            executeStep(response.nextStep);
          }, 1500);
        }
      }, 1500);
    } else if (response.nextStep) {
      setTimeout(() => {
        setCurrentStep(response.nextStep);
        executeStep(response.nextStep);
      }, 1000);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping || currentStep === "completed") return;
    handleUserResponse(inputValue);
    setInputValue("");
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInputPlaceholder = () => {
    switch (currentStep) {
      case "wait_for_faq_response":
        return "Type 'Yes' or 'No'...";
      case "wait_for_follow_up":
        return "Type your response...";
      case "completed":
        return "Conversation completed";
      default:
        return "Type your response...";
    }
  };

  const getStatusMessage = () => {
    if (currentStep === "completed") {
      return conversationConfig.steps[currentStep].message;
    }
    return "Click on any FAQ above or type your response";
  };

  const FAQComponent = () => (
    <div className="bg-gray-50 rounded-lg p-4 mt-2 space-y-2">
      {faqData.map((faq) => (
        <button
          key={faq.id}
          onClick={() => handleFaqSelect(faq)}
          className="w-full text-left p-3 bg-white rounded-lg hover:bg-purple-50 hover:border-purple-200 border border-gray-200 transition-all group"
          disabled={currentStep !== "wait_for_faq_response"}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-800">
              {faq.question}
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-500" />
          </div>
        </button>
      ))}
    </div>
  );

  const renderMessageContent = (message) => {
    if (message.isComponent && message.componentType === "faq_list") {
      return <FAQComponent />;
    }

    return (
      <>
        {message.text && <p className="text-sm">{message.text}</p>}
        <p
          className={`text-xs mt-1 ${
            message.sender === "user" ? "text-purple-100" : "text-gray-500"
          }`}
        >
          {formatTime(message.timestamp)}
        </p>
      </>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl bg-white border-none shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">RIC FAQ Assistant</h2>
            <p className="text-purple-100 text-sm">Get instant answers</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="h-96 overflow-y-auto p-4 bg-gray-50">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
                  message.sender === "user"
                    ? "flex-row-reverse space-x-reverse"
                    : ""
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === "user" ? "bg-purple-500" : "bg-gray-300"
                  }`}
                >
                  {message.sender === "user" ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-gray-600" />
                  )}
                </div>

                {/* Single bubble wrapper */}
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    message.sender === "user"
                      ? "bg-purple-500 text-white"
                      : "bg-white text-black shadow-sm border"
                  } ${message.isComponent ? "p-2" : ""}`}
                >
                  {renderMessageContent(message)}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2 max-w-xs">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-gray-600" />
                </div>
                <div className="bg-white text-black shadow-sm border rounded-2xl px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex space-x-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={getInputPlaceholder()}
            disabled={currentStep === "completed"}
            className="flex-1 px-4 py-3 bg-gray-100 border-none rounded-lg text-black placeholder:font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={
              !inputValue.trim() || isTyping || currentStep === "completed"
            }
            className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-2 text-xs text-center text-gray-500">
          {getStatusMessage()}
        </div>
      </div>
    </div>
  );
};

export default ChatbotInterface;
