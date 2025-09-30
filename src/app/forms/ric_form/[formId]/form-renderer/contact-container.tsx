import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@mui/material";
import { User } from "lucide-react";

import React from "react";

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
          <h3 className="text-lg font-medium text-gray-900">Contact Details</h3>
        </div>

        <p className="text-sm text-left text-gray-600 mb-6">
          Please enter your contact details so we can confirm your support
          request
        </p>

        <div className="space-y-3">
          <div className="flex flex-col items-start w-full">
            <Label className="text-sm font-normal text-gray-800 mb-1">
              Contact Name
              <span className="text-red-500">*</span>
            </Label>
            <Input
              type={"text"}
              placeholder={"Please enter your name"}
              value={contactName}
              onChange={(e) => onNameChange(e.target.value)}
              required
              className="h-14 text-base bg-white text-gray-700 placeholder:text-gray-400 rounded-lg border-gray-300"
            />
          </div>
          <div className="flex flex-col items-start w-full">
            <Label className="text-sm font-normal text-gray-800 mb-1">
              Contact Email
              <span className="text-red-500">*</span>
            </Label>
            <Input
              type={"text"}
              placeholder={"Please enter your contact email"}
              value={contactEmail}
              onChange={(e) => onEmailChange(e.target.value)}
              required
              className="h-14 text-base bg-white text-gray-700 placeholder:text-gray-400 rounded-lg border-gray-300"
            />
          </div>{" "}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactDetailsCard;
