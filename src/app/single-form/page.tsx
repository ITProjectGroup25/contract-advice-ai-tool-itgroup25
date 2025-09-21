"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Clock, HelpCircle, User, Users } from "lucide-react";
import { useState } from "react";

const ReferralRequestForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    grantsTeam: [],
    stageOfQuery: "",
    queryType: "",
  });

  const [errors, setErrors] = useState({});

  const grantsTeamOptions = [
    { id: "health-medical", label: "Health and Medical" },
    { id: "international", label: "International" },
    { id: "arc-d", label: "ARC-D" },
    { id: "rds", label: "RDS" },
    { id: "research-infrastructure", label: "Research Infrastructure" },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (formData.grantsTeam.length === 0) {
      newErrors.grantsTeam = "Please select at least one grants team.";
    }

    if (!formData.stageOfQuery) {
      newErrors.stageOfQuery = "Please select a stage of query.";
    }

    if (!formData.queryType) {
      newErrors.queryType = "Please select a query type.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Referral request submitted:", formData);
      alert("Referral request submitted successfully! Check console for data.");
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleGrantsTeamToggle = (teamId) => {
    setFormData((prev) => ({
      ...prev,
      grantsTeam: prev.grantsTeam.includes(teamId)
        ? prev.grantsTeam.filter((id) => id !== teamId)
        : [...prev.grantsTeam, teamId],
    }));

    if (errors.grantsTeam) {
      setErrors((prev) => ({
        ...prev,
        grantsTeam: "",
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Referral Request Form
          </h1>
          <p className="text-gray-600">
            Please complete this form to submit your referral request
          </p>
        </div>

        <div className="space-y-6">
          {/* Basic Information Section */}
          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-medium text-gray-900">
                  Basic Information
                </h2>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Please provide your contact details
              </p>

              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-700"
                  >
                    Your Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`mt-1 bg-white text-gray-900 placeholder:text-gray-500 ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Your Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`mt-1 bg-white text-gray-900 placeholder:text-gray-500 ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grants Team Section */}
          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-medium text-gray-900">
                  Grants Team
                </h2>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Select the relevant grants team(s) for your query
              </p>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Grants Team <span className="text-red-500">*</span>
                </Label>
                <div className="mt-3 space-y-3">
                  {grantsTeamOptions.map((team) => (
                    <div key={team.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={team.id}
                        checked={formData.grantsTeam.includes(team.id)}
                        onCheckedChange={() => handleGrantsTeamToggle(team.id)}
                        className="border-gray-300"
                      />
                      <Label
                        htmlFor={team.id}
                        className="text-sm text-gray-700 font-normal cursor-pointer"
                      >
                        {team.label}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.grantsTeam && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.grantsTeam}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stage of Query Section */}
          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-medium text-gray-900">
                  Stage of Query
                </h2>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                What stage is your query related to?
              </p>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Stage of Query <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                  value={formData.stageOfQuery}
                  onValueChange={(value) =>
                    handleInputChange("stageOfQuery", value)
                  }
                  className="mt-3 space-y-3"
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem
                      value="pre-award"
                      id="pre-award"
                      className="border-gray-300"
                    />
                    <Label
                      htmlFor="pre-award"
                      className="text-sm text-gray-700 font-normal cursor-pointer"
                    >
                      Pre-Award
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem
                      value="post-award"
                      id="post-award"
                      className="border-gray-300"
                    />
                    <Label
                      htmlFor="post-award"
                      className="text-sm text-gray-700 font-normal cursor-pointer"
                    >
                      Post-Award
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem
                      value="other"
                      id="other"
                      className="border-gray-300"
                    />
                    <Label
                      htmlFor="other"
                      className="text-sm text-gray-700 font-normal cursor-pointer"
                    >
                      Other
                    </Label>
                  </div>
                </RadioGroup>
                {errors.stageOfQuery && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.stageOfQuery}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Query Type Section */}
          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-medium text-gray-900">
                  Query Type
                </h2>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Is this a simple query or complex referral?
              </p>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Query Type <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                  value={formData.queryType}
                  onValueChange={(value) =>
                    handleInputChange("queryType", value)
                  }
                  className="mt-3 space-y-3"
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem
                      value="simple"
                      id="simple"
                      className="border-gray-300"
                    />
                    <Label
                      htmlFor="simple"
                      className="text-sm text-gray-700 font-normal cursor-pointer"
                    >
                      Simple
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem
                      value="complex"
                      id="complex"
                      className="border-gray-300"
                    />
                    <Label
                      htmlFor="complex"
                      className="text-sm text-gray-700 font-normal cursor-pointer"
                    >
                      Complex
                    </Label>
                  </div>
                </RadioGroup>
                {errors.queryType && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.queryType}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleSubmit}
            className="bg-black hover:bg-gray-800 text-white px-8 py-2 rounded-md"
          >
            Submit Referral Request
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReferralRequestForm;
