import sendEmail from "./emailjs";

type Args = {
  data: any;
};

export const sendEmailToRICStaff = async ({ data }: Args) => {
  const templateParams = {
    to_name: "RIC Staff",
    from_name: "IT_Project Group 25",
    subject: "You have received a new request",
    message: `New From Contact Us, details: ${JSON.stringify(data)}`,
  };

  return sendEmail({ data, templateParams });
};
