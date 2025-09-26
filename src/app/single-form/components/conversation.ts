export const conversationConfig = {
  initialStep: "greeting",

  steps: {
    greeting: {
      type: "bot_message",
      message:
        "Hi there! Before we send your message off to the RIC staff, here are some pre-prepared FAQs so you can get your answers instantly!",
      delay: 1000,
      nextStep: "show_faqs",
    },

    show_faqs: {
      type: "bot_component",
      component: "faq_list",
      delay: 1500,
      nextStep: "ask_faq_question",
    },

    ask_faq_question: {
      type: "bot_message",
      message: "Is your query displayed in any of these pre-prepared FAQs?",
      delay: 1000,
      nextStep: "wait_for_faq_response",
    },

    wait_for_faq_response: {
      type: "user_input",
      responses: {
        no: {
          nextStep: "forward_to_staff",
        },
        faq_selection: {
          nextStep: "show_faq_answer",
        },
      },
    },

    show_faq_answer: {
      type: "bot_message",
      message: null, // Will be populated dynamically with FAQ answer
      delay: 1500,
      nextStep: "ask_follow_up",
    },

    ask_follow_up: {
      type: "bot_message",
      message:
        "Is there anything else I can help you with from our FAQs, or would you like to send a custom query to our staff?",
      delay: 2000,
      nextStep: "wait_for_follow_up",
    },

    wait_for_follow_up: {
      type: "user_input",
      responses: {
        custom_query: {
          keywords: ["custom", "staff", "unique", "send"],
          nextStep: "forward_to_staff",
        },
        more_faqs: {
          nextStep: "ask_follow_up",
          message:
            "Great! Feel free to select another FAQ above or let me know if you'd like to send a custom query to our staff.",
        },
      },
    },

    forward_to_staff: {
      type: "bot_message",
      message:
        "No problem, we'll send your unique query to the RIC staff then, thanks for your patience!",
      delay: 1500,
      nextStep: "completed",
    },

    completed: {
      type: "end_conversation",
      message: "Your query will be forwarded to the RIC staff",
    },
  },
};

export const faqData = [
  {
    id: 1,
    question: "What are your operating hours?",
    answer:
      "We're open Monday to Friday, 9:00 AM to 6:00 PM. We're closed on weekends and public holidays.",
  },
  {
    id: 2,
    question: "How can I reset my password?",
    answer:
      "You can reset your password by clicking the 'Forgot Password' link on the login page, or contact our support team for assistance.",
  },
  {
    id: 3,
    question: "What services do you offer?",
    answer:
      "We offer a comprehensive range of research and consultation services, including data analysis, strategic planning, and technical consulting.",
  },
  {
    id: 4,
    question: "How long does it take to get a response?",
    answer:
      "We typically respond to all enquiries within 2 business days. Urgent matters are usually addressed within 24 hours.",
  },
  {
    id: 5,
    question: "Do you offer student discounts?",
    answer:
      "Yes! We offer a 20% discount for students with valid student ID. Please contact us with your student credentials for more information.",
  },
];
