import sendEmail from "./emailjs";

type Args = {
  data: any;
  senderName: string;
};

export const sendEmailToSender = async ({ data, senderName }: Args) => {
  const templateParams = {
    to_name: senderName,
    from_name: "RIC Staff",
    subject: "We have received your request",
    message: `We have received your request with the following details ${JSON.stringify(
      data
    )} We will be in contact shortly!`,
  };

  return sendEmail({ data, templateParams });
};
