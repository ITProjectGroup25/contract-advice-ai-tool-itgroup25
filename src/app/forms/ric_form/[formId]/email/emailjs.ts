import emailjs from "@emailjs/browser";

type TemplateParams = {
  to_name: string;
  from_name: string;
  subject: string;  
  message: string;
}

type Args = {
  data: any;
  templateParams: TemplateParams
};

const sendEmail = async ({ data, templateParams }: Args) => {

  const serviceId = "service_010xydf";
  const templateName = "template_1dcm4rn";
  const publicKey = "Yd6r5t5etWEKD3GNh";
  return emailjs.send(serviceId, templateName, templateParams, publicKey);
};

export default sendEmail;
