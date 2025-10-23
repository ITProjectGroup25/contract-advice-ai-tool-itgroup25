"use client";

import {
  Database,
  Download,
  Trash2,
  Eye,
  RefreshCw,
  BarChart3,
  Users,
  FileText,
  Clock,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { localDB, FormSubmission } from "../_utils/localDatabase";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export function DatabaseManagement() {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    simple: 0,
    complex: 0,
    processed: 0,
    escalated: 0,
    satisfied: 0,
  });
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [submissionsData, statsData] = await Promise.all([
        localDB.getAllSubmissions(),
        localDB.getSubmissionStats(),
      ]);

      setSubmissions(
        submissionsData.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
      );
      setStats(statsData);
    } catch (error) {
      console.error("Error loading database data:", error);
      toast.error("Failed to load database data");
    } finally {
      setLoading(false);
    }
  };

  const handleExportAll = async () => {
    try {
      const sqlContent = await localDB.exportAllToSQL();
      const blob = new Blob([sqlContent], { type: "application/sql" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `all_submissions_${new Date().toISOString().split("T")[0]}.sql`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      toast.success("Database exported successfully");
    } catch (error) {
      console.error("Error exporting database:", error);
      toast.error("Failed to export database");
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    try {
      await localDB.deleteSubmission(id);
      await loadData();
      toast.success("Submission deleted successfully");
    } catch (error) {
      console.error("Error deleting submission:", error);
      toast.error("Failed to delete submission");
    }
  };

  const handleClearAll = async () => {
    try {
      await localDB.clearAllSubmissions();
      await loadData();
      toast.success("All submissions cleared successfully");
    } catch (error) {
      console.error("Error clearing submissions:", error);
      toast.error("Failed to clear submissions");
    }
  };

  const handleUpdateStatus = async (id: string, status: FormSubmission["status"]) => {
    try {
      await localDB.updateSubmission(id, { status });
      await loadData();
      toast.success("Status updated successfully");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status: FormSubmission["status"]) => {
    switch (status) {
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "processed":
        return "bg-green-100 text-green-800";
      case "escalated":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <p>Loading database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Management
          </h2>
          <p className="text-muted-foreground">Manage and export form submission data</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleExportAll} size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardContent className="flex items-center gap-2 p-4">
            <FileText className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-2xl font-medium">{stats.total}</p>
              <p className="text-muted-foreground text-sm">Total</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-2 p-4">
            <Users className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-2xl font-medium">{stats.simple}</p>
              <p className="text-muted-foreground text-sm">Simple</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-2 p-4">
            <BarChart3 className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-2xl font-medium">{stats.complex}</p>
              <p className="text-muted-foreground text-sm">Complex</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-2 p-4">
            <Clock className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-2xl font-medium">{stats.processed}</p>
              <p className="text-muted-foreground text-sm">Processed</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-2 p-4">
            <Users className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-2xl font-medium">{stats.escalated}</p>
              <p className="text-muted-foreground text-sm">Escalated</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-2 p-4">
            <Users className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-2xl font-medium">{stats.satisfied}</p>
              <p className="text-muted-foreground text-sm">Satisfied</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Form Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              <Database className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>No submissions found</p>
              <p className="text-sm">Submissions will appear here after forms are submitted</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Satisfied</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-mono text-xs">
                          {submission.id.substring(0, 20)}...
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(submission.timestamp)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={submission.queryType === "complex" ? "default" : "secondary"}
                          >
                            {submission.queryType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(submission.status)}>
                            {submission.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {submission.userSatisfied === true
                            ? "✅"
                            : submission.userSatisfied === false
                              ? "❌"
                              : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedSubmission(submission)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Submission</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this submission? This action
                                    cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteSubmission(submission.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {submissions.length > 0 && (
                <div className="flex items-center justify-between border-t pt-4">
                  <p className="text-muted-foreground text-sm">
                    Showing {submissions.length} submissions
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear All Data
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Clear All Submissions</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete all form submissions? This action cannot
                          be undone and will permanently remove all data from the local database.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearAll}>
                          Clear All Data
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submission Detail Dialog */}
      <Dialog open={selectedSubmission !== null} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-h-[80vh] max-w-4xl">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
            <DialogDescription>{selectedSubmission?.id}</DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <Tabs defaultValue="data" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="data">Form Data</TabsTrigger>
                <TabsTrigger value="sql">Generated SQL</TabsTrigger>
                <TabsTrigger value="metadata">Metadata</TabsTrigger>
              </TabsList>

              <TabsContent value="data">
                <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                  <div className="space-y-4">
                    {Object.entries(selectedSubmission.formData).map(([key, value]) => (
                      <div key={key} className="border-b pb-2">
                        <p className="text-muted-foreground text-sm font-medium">{key}</p>
                        <p className="text-sm">
                          {Array.isArray(value) ? value.join(", ") : String(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="sql">
                <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                  <pre className="whitespace-pre-wrap font-mono text-xs">
                    {selectedSubmission.sqlStatement}
                  </pre>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="metadata">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Submission ID</p>
                      <p className="text-muted-foreground font-mono text-sm">
                        {selectedSubmission.id}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Timestamp</p>
                      <p className="text-muted-foreground text-sm">
                        {formatDate(selectedSubmission.timestamp)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Query Type</p>
                      <Badge
                        variant={
                          selectedSubmission.queryType === "complex" ? "default" : "secondary"
                        }
                      >
                        {selectedSubmission.queryType}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <Badge className={getStatusColor(selectedSubmission.status)}>
                        {selectedSubmission.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium">User Satisfied</p>
                      <p className="text-muted-foreground text-sm">
                        {selectedSubmission.userSatisfied === true
                          ? "Yes ✅"
                          : selectedSubmission.userSatisfied === false
                            ? "No ❌"
                            : "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Needs Human Review</p>
                      <p className="text-muted-foreground text-sm">
                        {selectedSubmission.needsHumanReview === true
                          ? "Yes"
                          : selectedSubmission.needsHumanReview === false
                            ? "No"
                            : "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(selectedSubmission.id, "processed")}
                      disabled={selectedSubmission.status === "processed"}
                    >
                      Mark Processed
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(selectedSubmission.id, "escalated")}
                      disabled={selectedSubmission.status === "escalated"}
                    >
                      Mark Escalated
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
