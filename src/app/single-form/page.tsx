"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Clock, HelpCircle, User, Users } from "lucide-react";
import { useState } from "react";

const ReferralRequestForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    grantsTeam: [],
    stageOfQuery: [],
    queryType: [],
    grantsScheme: [],
    mriInvolvement: "",
    typeOfQuery: [],
    requestExplanation: "",
    isUrgent: "",
  });

  const [errors, setErrors] = useState({});

  const grantsTeamOptions = [
    { id: "health-medical", label: "Health and Medical" },
    { id: "international", label: "International" },
    { id: "arc-d", label: "ARC-D" },
    { id: "rds", label: "RDS" },
    { id: "research-infrastructure", label: "Research Infrastructure" },
  ];

  const stageOfQueryOptions = [
    { id: "pre-award", label: "Pre-Award" },
    { id: "post-award", label: "Post-Award" },
    { id: "other", label: "Other" },
  ];

  const queryTypeOptions = [
    { id: "simple", label: "Simple" },
    { id: "complex", label: "Complex" },
  ];

  const grantsSchemeOptions = [
    { id: "nhmrc", label: "NHMRC" },
    { id: "mrff", label: "MRFF" },
    { id: "arc", label: "ARC" },
    { id: "ecr", label: "ECR" },
    { id: "nih", label: "NIH" },
    { id: "other-scheme", label: "Other" },
  ];

  const typeOfQueryOptions = [
    { id: "contractual-clause", label: "Review of a contractual clause" },
    { id: "support-negotiations", label: "Support with negotiations" },
    { id: "advice-agreement", label: "Advice on appropriate agreement" },
    {
      id: "compliance-obligations",
      label: "Advice on compliance with grant obligations",
    },
    { id: "other-query", label: "Other" },
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

    if (formData.stageOfQuery.length === 0) {
      newErrors.stageOfQuery = "Please select at least one stage of query.";
    }

    if (formData.queryType.length === 0) {
      newErrors.queryType = "Please select at least one query type.";
    }

    // Additional validation for simple queries
    if (formData.queryType.includes("simple")) {
      if (formData.grantsScheme.length === 0) {
        newErrors.grantsScheme = "Please select at least one grants scheme.";
      }

      if (!formData.mriInvolvement) {
        newErrors.mriInvolvement = "Please select MRI involvement.";
      }

      if (formData.typeOfQuery.length === 0) {
        newErrors.typeOfQuery = "Please select at least one type of query.";
      }

      if (!formData.requestExplanation.trim()) {
        newErrors.requestExplanation = "Please provide request explanation.";
      }

      if (!formData.isUrgent) {
        newErrors.isUrgent = "Please indicate if there is urgency.";
      }
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

  const handleGrantsSchemeToggle = (schemeId) => {
    setFormData((prev) => ({
      ...prev,
      grantsScheme: prev.grantsScheme.includes(schemeId)
        ? prev.grantsScheme.filter((id) => id !== schemeId)
        : [...prev.grantsScheme, schemeId],
    }));

    if (errors.grantsScheme) {
      setErrors((prev) => ({
        ...prev,
        grantsScheme: "",
      }));
    }
  };

  const handleStageOfQueryToggle = (stageId) => {
    setFormData((prev) => ({
      ...prev,
      stageOfQuery: prev.stageOfQuery.includes(stageId)
        ? prev.stageOfQuery.filter((id) => id !== stageId)
        : [...prev.stageOfQuery, stageId],
    }));

    if (errors.stageOfQuery) {
      setErrors((prev) => ({
        ...prev,
        stageOfQuery: "",
      }));
    }
  };

  const handleQueryTypeToggle = (typeId) => {
    setFormData((prev) => ({
      ...prev,
      queryType: prev.queryType.includes(typeId)
        ? prev.queryType.filter((id) => id !== typeId)
        : [...prev.queryType, typeId],
    }));

    if (errors.queryType) {
      setErrors((prev) => ({
        ...prev,
        queryType: "",
      }));
    }
  };

  const handleTypeOfQueryToggle = (queryId) => {
    setFormData((prev) => ({
      ...prev,
      typeOfQuery: prev.typeOfQuery.includes(queryId)
        ? prev.typeOfQuery.filter((id) => id !== queryId)
        : [...prev.typeOfQuery, queryId],
    }));

    if (errors.typeOfQuery) {
      setErrors((prev) => ({
        ...prev,
        typeOfQuery: "",
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
                {stageOfQueryOptions.map((stage) => (
                  <div
                    key={stage.id}
                    className="flex items-center space-y-3 space-x-3"
                  >
                    <Checkbox
                      id={stage.id}
                      checked={formData.stageOfQuery.includes(stage.id)}
                      onCheckedChange={() => handleStageOfQueryToggle(stage.id)}
                      className="border-gray-300"
                    />
                    <Label
                      htmlFor={stage.id}
                      className="text-sm text-gray-700 font-normal cursor-pointer"
                    >
                      {stage.label}
                    </Label>
                  </div>
                ))}

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

                {queryTypeOptions.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center space-x-3 mt-3"
                  >
                    <Checkbox
                      id={option.id}
                      checked={formData.queryType === option.id}
                      onCheckedChange={() =>
                        handleInputChange("queryType", option.id)
                      }
                      className="border-gray-300"
                    />
                    <Label
                      htmlFor={option.id}
                      className="text-sm text-gray-700 font-normal cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}

                {errors.queryType && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.queryType}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {formData.queryType.includes("complex") && (
          <>
            {/* Grants Scheme Section */}
            <Card className="border border-gray-200 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-medium text-gray-900">
                    Grants Scheme (Complex)
                  </h2>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  Which grants scheme is your query related to?
                </p>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Grants Scheme <span className="text-red-500">*</span>
                  </Label>
                  <div className="mt-3 space-y-3">
                    {grantsSchemeOptions.map((scheme) => (
                      <div
                        key={scheme.id}
                        className="flex items-center space-x-3"
                      >
                        <Checkbox
                          id={scheme.id}
                          checked={formData.grantsScheme.includes(scheme.id)}
                          onCheckedChange={() =>
                            handleGrantsSchemeToggle(scheme.id)
                          }
                          className="border-gray-300"
                        />
                        <Label
                          htmlFor={scheme.id}
                          className="text-sm text-gray-700 font-normal cursor-pointer"
                        >
                          {scheme.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.grantsScheme && (
                    <p className="mt-2 text-sm text-red-500">
                      {errors.grantsScheme}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* MRI Involvement Section */}
            <Card className="border border-gray-200 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-medium text-gray-900">
                    MRI Involvement (Simple)
                  </h2>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  Does this involve an MRI?
                </p>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    MRI Involvement <span className="text-red-500">*</span>
                  </Label>
                  <RadioGroup
                    value={formData.mriInvolvement}
                    onValueChange={(value) =>
                      handleInputChange("mriInvolvement", value)
                    }
                    className="mt-3 space-y-3"
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem
                        value="yes"
                        id="mri-yes"
                        className="border-gray-300"
                      />
                      <Label
                        htmlFor="mri-yes"
                        className="text-sm text-gray-700 font-normal cursor-pointer"
                      >
                        Yes
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem
                        value="no"
                        id="mri-no"
                        className="border-gray-300"
                      />
                      <Label
                        htmlFor="mri-no"
                        className="text-sm text-gray-700 font-normal cursor-pointer"
                      >
                        No
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem
                        value="other-mri"
                        id="mri-other"
                        className="border-gray-300"
                      />
                      <Label
                        htmlFor="mri-other"
                        className="text-sm text-gray-700 font-normal cursor-pointer"
                      >
                        Other
                      </Label>
                    </div>
                  </RadioGroup>
                  {errors.mriInvolvement && (
                    <p className="mt-2 text-sm text-red-500">
                      {errors.mriInvolvement}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Type of Query Section */}
            <Card className="border border-gray-200 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-medium text-gray-900">
                    Type of Query (Simple)
                  </h2>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  Select all that apply for your query type
                </p>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Type of Query <span className="text-red-500">*</span>
                  </Label>
                  <div className="mt-3 space-y-3">
                    {typeOfQueryOptions.map((queryType) => (
                      <div
                        key={queryType.id}
                        className="flex items-center space-x-3"
                      >
                        <Checkbox
                          id={queryType.id}
                          checked={formData.typeOfQuery.includes(queryType.id)}
                          onCheckedChange={() =>
                            handleTypeOfQueryToggle(queryType.id)
                          }
                          className="border-gray-300"
                        />
                        <Label
                          htmlFor={queryType.id}
                          className="text-sm text-gray-700 font-normal cursor-pointer"
                        >
                          {queryType.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.typeOfQuery && (
                    <p className="mt-2 text-sm text-red-500">
                      {errors.typeOfQuery}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Request Details Section */}
            <Card className="border border-gray-200 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-medium text-gray-900">
                    Request Details (Simple)
                  </h2>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  Please provide details about your request
                </p>

                <div className="space-y-6">
                  <div>
                    <Label
                      htmlFor="requestExplanation"
                      className="text-sm font-medium text-gray-700"
                    >
                      Request Explanation{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="requestExplanation"
                      placeholder="Please explain your request in detail..."
                      value={formData.requestExplanation}
                      onChange={(e) =>
                        handleInputChange("requestExplanation", e.target.value)
                      }
                      className={`mt-1 min-h-[100px] bg-white text-gray-900 placeholder:text-gray-500 ${
                        errors.requestExplanation
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.requestExplanation && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.requestExplanation}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Is there urgency on this request?{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <RadioGroup
                      value={formData.isUrgent}
                      onValueChange={(value) =>
                        handleInputChange("isUrgent", value)
                      }
                      className="mt-3 space-y-3"
                    >
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem
                          value="yes"
                          id="urgent-yes"
                          className="border-gray-300"
                        />
                        <Label
                          htmlFor="urgent-yes"
                          className="text-sm text-gray-700 font-normal cursor-pointer"
                        >
                          Yes
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem
                          value="no"
                          id="urgent-no"
                          className="border-gray-300"
                        />
                        <Label
                          htmlFor="urgent-no"
                          className="text-sm text-gray-700 font-normal cursor-pointer"
                        >
                          No
                        </Label>
                      </div>
                    </RadioGroup>
                    {errors.isUrgent && (
                      <p className="mt-2 text-sm text-red-500">
                        {errors.isUrgent}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Conditional sections for Simple queries */}
        {formData.queryType.includes("simple") && (
          <>
            {/* Grants Scheme Section */}
            <Card className="border border-gray-200 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-medium text-gray-900">
                    Grants Scheme (Simple)
                  </h2>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  Which grants scheme is your query related to?
                </p>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Grants Scheme <span className="text-red-500">*</span>
                  </Label>
                  <div className="mt-3 space-y-3">
                    {grantsSchemeOptions.map((scheme) => (
                      <div
                        key={scheme.id}
                        className="flex items-center space-x-3"
                      >
                        <Checkbox
                          id={scheme.id}
                          checked={formData.grantsScheme.includes(scheme.id)}
                          onCheckedChange={() =>
                            handleGrantsSchemeToggle(scheme.id)
                          }
                          className="border-gray-300"
                        />
                        <Label
                          htmlFor={scheme.id}
                          className="text-sm text-gray-700 font-normal cursor-pointer"
                        >
                          {scheme.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.grantsScheme && (
                    <p className="mt-2 text-sm text-red-500">
                      {errors.grantsScheme}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* MRI Involvement Section */}
            <Card className="border border-gray-200 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-medium text-gray-900">
                    MRI Involvement (Simple)
                  </h2>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  Does this involve an MRI?
                </p>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    MRI Involvement <span className="text-red-500">*</span>
                  </Label>
                  <RadioGroup
                    value={formData.mriInvolvement}
                    onValueChange={(value) =>
                      handleInputChange("mriInvolvement", value)
                    }
                    className="mt-3 space-y-3"
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem
                        value="yes"
                        id="mri-yes"
                        className="border-gray-300"
                      />
                      <Label
                        htmlFor="mri-yes"
                        className="text-sm text-gray-700 font-normal cursor-pointer"
                      >
                        Yes
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem
                        value="no"
                        id="mri-no"
                        className="border-gray-300"
                      />
                      <Label
                        htmlFor="mri-no"
                        className="text-sm text-gray-700 font-normal cursor-pointer"
                      >
                        No
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem
                        value="other-mri"
                        id="mri-other"
                        className="border-gray-300"
                      />
                      <Label
                        htmlFor="mri-other"
                        className="text-sm text-gray-700 font-normal cursor-pointer"
                      >
                        Other
                      </Label>
                    </div>
                  </RadioGroup>
                  {errors.mriInvolvement && (
                    <p className="mt-2 text-sm text-red-500">
                      {errors.mriInvolvement}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Type of Query Section */}
            <Card className="border border-gray-200 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-medium text-gray-900">
                    Type of Query (Simple)
                  </h2>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  Select all that apply for your query type
                </p>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Type of Query <span className="text-red-500">*</span>
                  </Label>
                  <div className="mt-3 space-y-3">
                    {typeOfQueryOptions.map((queryType) => (
                      <div
                        key={queryType.id}
                        className="flex items-center space-x-3"
                      >
                        <Checkbox
                          id={queryType.id}
                          checked={formData.typeOfQuery.includes(queryType.id)}
                          onCheckedChange={() =>
                            handleTypeOfQueryToggle(queryType.id)
                          }
                          className="border-gray-300"
                        />
                        <Label
                          htmlFor={queryType.id}
                          className="text-sm text-gray-700 font-normal cursor-pointer"
                        >
                          {queryType.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.typeOfQuery && (
                    <p className="mt-2 text-sm text-red-500">
                      {errors.typeOfQuery}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Request Details Section */}
            <Card className="border border-gray-200 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-medium text-gray-900">
                    Request Details (Simple)
                  </h2>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  Please provide details about your request
                </p>

                <div className="space-y-6">
                  <div>
                    <Label
                      htmlFor="requestExplanation"
                      className="text-sm font-medium text-gray-700"
                    >
                      Request Explanation{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="requestExplanation"
                      placeholder="Please explain your request in detail..."
                      value={formData.requestExplanation}
                      onChange={(e) =>
                        handleInputChange("requestExplanation", e.target.value)
                      }
                      className={`mt-1 min-h-[100px] bg-white text-gray-900 placeholder:text-gray-500 ${
                        errors.requestExplanation
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.requestExplanation && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.requestExplanation}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Is there urgency on this request?{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <RadioGroup
                      value={formData.isUrgent}
                      onValueChange={(value) =>
                        handleInputChange("isUrgent", value)
                      }
                      className="mt-3 space-y-3"
                    >
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem
                          value="yes"
                          id="urgent-yes"
                          className="border-gray-300"
                        />
                        <Label
                          htmlFor="urgent-yes"
                          className="text-sm text-gray-700 font-normal cursor-pointer"
                        >
                          Yes
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem
                          value="no"
                          id="urgent-no"
                          className="border-gray-300"
                        />
                        <Label
                          htmlFor="urgent-no"
                          className="text-sm text-gray-700 font-normal cursor-pointer"
                        >
                          No
                        </Label>
                      </div>
                    </RadioGroup>
                    {errors.isUrgent && (
                      <p className="mt-2 text-sm text-red-500">
                        {errors.isUrgent}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

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
