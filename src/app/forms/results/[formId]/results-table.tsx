"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@mui/material";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  Trash2,
} from "lucide-react";
import React, { useState, useTransition } from "react";
import { FormResult } from "../../edit/[formId]/form-builder-components/types/FormTemplateTypes";
import { deleteSubmission } from "@/app/actions/deleteSubmission";

interface FormResultsPageProps {
  formName: string;
  results: FormResult[];
}

const FormResultsPage: React.FC<FormResultsPageProps> = ({
  formName,
  results,
}) => {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const toggleRow = (id: number) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getContactDetails = (result: FormResult) => {
    const contactDetails = result.results["Contact Details"];
    if (!contactDetails) return { name: "N/A", email: "N/A" };

    const nameObj = contactDetails.find((item) => "Name" in item);
    const emailObj = contactDetails.find((item) => "Email" in item);

    return {
      name: nameObj?.Name || "N/A",
      email: emailObj?.Email || "N/A",
    };
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this submission?")) {
      return;
    }

    setDeletingId(id);
    startTransition(async () => {
      try {
        await deleteSubmission(id);
        // Refresh will happen automatically via Next.js revalidation
      } catch (error) {
        console.error("Failed to delete submission:", error);
        alert("Failed to delete submission. Please try again.");
      } finally {
        setDeletingId(null);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {formName}
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    View and manage form submissions
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border border-gray-200 bg-white/80 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Submissions</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {results.length}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-white/80 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Latest Submission</p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                      {results.length > 0
                        ? formatDate(results[0].submittedAt ?? "").split(",")[0]
                        : "N/A"}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-white/80 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">This Week</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {
                        results.filter((r) => {
                          const weekAgo = new Date();
                          weekAgo.setDate(weekAgo.getDate() - 7);
                          return new Date(r.submittedAt ?? "") > weekAgo;
                        }).length
                      }
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Results Table */}
        <Card className="border border-gray-200 bg-white/80 backdrop-blur shadow-lg">
          <CardContent className="p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                All Submissions
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Click on any row to view detailed responses
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-[80px] font-semibold">ID</TableHead>
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">
                      Submitted At
                    </TableHead>
                    <TableHead className="text-right font-semibold">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-32 text-center text-gray-500"
                      >
                        No submissions yet. Submissions will appear here once
                        users fill out the form.
                      </TableCell>
                    </TableRow>
                  ) : (
                    results.map((result) => {
                      const contact = getContactDetails(result);
                      const isExpanded = expandedRow === result.id;
                      const isDeleting = deletingId === result.id;

                      return (
                        <React.Fragment key={result.id}>
                          <TableRow className="hover:bg-gray-50 transition-colors">
                            <TableCell className="font-medium">
                              #{result.id}
                            </TableCell>
                            <TableCell>{contact.name}</TableCell>
                            <TableCell className="text-gray-600">
                              {contact.email}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {formatDate(result.submittedAt ?? "")}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => toggleRow(result.id)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                >
                                  {isExpanded ? (
                                    <>
                                      Hide
                                      <ChevronUp className="w-4 h-4" />
                                    </>
                                  ) : (
                                    <>
                                      View
                                      <ChevronDown className="w-4 h-4" />
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleDelete(result.id)}
                                  disabled={isDeleting || isPending}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  {isDeleting ? "Deleting..." : "Delete"}
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>

                          {/* Expanded Details */}
                          {isExpanded && (
                            <TableRow>
                              <TableCell colSpan={5} className="bg-gray-50 p-6">
                                <div className="space-y-4">
                                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                                    Detailed Responses
                                  </h3>
                                  {Object.entries(result.results).map(
                                    ([containerName, responses]) => (
                                      <div
                                        key={containerName}
                                        className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                                      >
                                        <h4 className="text-sm font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-100">
                                          {containerName}
                                        </h4>
                                        <div className="space-y-3">
                                          {responses.map((response, idx) => (
                                            <div
                                              key={idx}
                                              className="space-y-2"
                                            >
                                              {Object.entries(response).map(
                                                ([field, value]) => (
                                                  <div
                                                    key={field}
                                                    className="flex gap-4"
                                                  >
                                                    <span className="text-sm text-gray-600 font-medium min-w-[150px]">
                                                      {field}:
                                                    </span>
                                                    <span className="text-sm text-gray-900">
                                                      {Array.isArray(value)
                                                        ? value.join(", ")
                                                        : String(value)}
                                                    </span>
                                                  </div>
                                                )
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FormResultsPage;
