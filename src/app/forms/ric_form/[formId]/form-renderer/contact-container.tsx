import React from "react";
import { Card, CardContent } from "@mui/material";
import { User } from "lucide-react";

interface ContactDetailsCardProps {
  contactName: string;
  contactEmail: string;
  onNameChange: (name: string) => void;
  onEmailChange: (email: string) => void;
}

const ContactDetailsCard: React.FC<ContactDetailsCardProps> = ({
  contactName,
  contactEmail,
  onNameChange,
  onEmailChange,
}) => {
  return (
    <Card className="border border-gray-200 bg-white w-full mb-4">
      <CardContent className="p-4 w-full">
        <div className="flex items-center gap-2 mb-3">
          <User className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-medium text-gray-900">Contact Details</h3>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col items-start w-full">
            <label
              htmlFor="contact-name"
              className="text-xs font-normal text-gray-800 mb-1"
            >
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              id="contact-name"
              type="text"
              placeholder="Enter your full name"
              value={contactName}
              onChange={(e) => onNameChange(e.target.value)}
              required
              className="w-full h-10 text-sm bg-white text-gray-700 placeholder:text-gray-400 rounded-lg border border-gray-300 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col items-start w-full">
            <label
              htmlFor="contact-email"
              className="text-xs font-normal text-gray-800 mb-1"
            >
              Email for Confirmation <span className="text-red-500">*</span>
            </label>
            <input
              id="contact-email"
              type="email"
              placeholder="your.email@example.com"
              value={contactEmail}
              onChange={(e) => onEmailChange(e.target.value)}
              required
              className="w-full h-10 text-sm bg-white text-gray-700 placeholder:text-gray-400 rounded-lg border border-gray-300 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactDetailsCard;
