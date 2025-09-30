import emailjs from "@emailjs/browser";

type Args = {
  data: any;
};

const sendEmail = async ({ data }: Args) => {
  const templateParams = {
    to_name: "RIC Staff",
    from_name: "IT_Project Group 25",
    subject: "You have received a new request",
    message: `New From Contact Us, details: ${JSON.stringify(data)}`,
  };

  const serviceId = "service_010xydf";
  const templateName = "template_1dcm4rn";
  const publicKey = "Yd6r5t5etWEKD3GNh";
  return emailjs.send(serviceId, templateName, templateParams, publicKey);
};

export default sendEmail;
