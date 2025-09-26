import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import { 
  Download, 
  Trash2, 
  Eye, 
  Database, 
  FileSpreadsheet, 
  RefreshCw,
  Calendar,
  User,
  HelpCircle
} from "lucide-react";
import { LocalDatabase, FormSubmission } from "../utils/localStorage";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";

export function DataManagement() {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);

  const loadSubmissions = () => {
    const allSubmissions = LocalDatabase.getAllSubmissions();
    setSubmissions(allSubmissions);
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const handleExportSQL = () => {
    try {
      const sqlContent = LocalDatabase.exportToSQL();
      const blob = new Blob([sqlContent], { type: 'text/sql' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `form_submissions_${new Date().toISOString().split('T')[0]}.sql`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('SQL export downloaded successfully!');
    } catch (error) {
      toast.error('Failed to export SQL file');
    }
  };

  const handleExportCSV = () => {
    try {
      const csvContent = LocalDatabase.exportToCSV();
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `form_submissions_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('CSV export downloaded successfully!');
    } catch (error) {
      toast.error('Failed to export CSV file');
    }
  };

  const handleDeleteSubmission = (id: string) => {
    try {
      LocalDatabase.deleteSubmission(id);
      loadSubmissions();
      toast.success('Submission deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete submission');
    }
  };

  const handleClearAllData = () => {
    try {
      LocalDatabase.clearAllData();
      loadSubmissions();
      toast.success('All data cleared successfully!');
    } catch (error) {
      toast.error('Failed to clear data');
    }
  };

  const handleViewSubmission = (submission: FormSubmission) => {
    setSelectedSubmission(submission);
    setShowViewDialog(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderFormData = (formData: Record<string, any>) => {
    return Object.entries(formData).map(([key, value]) => {
      if (value === null || value === undefined || value === '') return null;
      
      let displayValue: string;
      if (Array.isArray(value)) {
        displayValue = value.join(', ');
      } else if (typeof value === 'object') {
        displayValue = JSON.stringify(value, null, 2);
      } else {
        displayValue = String(value);
      }

      return (
        <div key={key} className="grid grid-cols-3 gap-4 py-2">
          <div className="text-sm text-muted-foreground capitalize">
            {key.replace(/[-_]/g, ' ')}:
          </div>
          <div className="col-span-2 text-sm break-words">
            {displayValue}
          </div>
        </div>
      );
    }).filter(Boolean);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">Data Management</h2>
          <p className="text-muted-foreground">
            View and manage all form submissions
          </p>
        </div>
        <Button onClick={loadSubmissions} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total Submissions</p>
                <p className="text-2xl">{submissions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Simple Queries</p>
                <p className="text-2xl">{submissions.filter(s => s.queryType === 'simple').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Complex Queries</p>
                <p className="text-2xl">{submissions.filter(s => s.queryType === 'complex').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Today</p>
                <p className="text-2xl">
                  {submissions.filter(s => 
                    new Date(s.timestamp).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
          <CardDescription>
            Export all submissions in different formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={handleExportSQL} variant="outline">
              <Database className="h-4 w-4 mr-2" />
              Export SQL
            </Button>
            <Button onClick={handleExportCSV} variant="outline">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={submissions.length === 0}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all
                    form submissions from the local database.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAllData}>
                    Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
          <CardDescription>
            All form submissions stored locally
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="text-center py-8">
              <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No submissions found</p>
              <p className="text-sm text-muted-foreground">
                Submit some forms to see data here
              </p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-mono text-xs">
                        {submission.id}
                      </TableCell>
                      <TableCell>
                        {formatDate(submission.timestamp)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          submission.queryType === 'simple' 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'bg-purple-50 text-purple-700'
                        }>
                          {submission.queryType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(submission.status)}>
                          {submission.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewSubmission(submission)}
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
                                  Are you sure you want to delete this submission? This action cannot be undone.
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
          )}
        </CardContent>
      </Card>

      {/* View Submission Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
            <DialogDescription>
              {selectedSubmission && `ID: ${selectedSubmission.id} • ${formatDate(selectedSubmission.timestamp)}`}
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Badge variant="outline" className={
                    selectedSubmission.queryType === 'simple' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'bg-purple-50 text-purple-700'
                  }>
                    {selectedSubmission.queryType} query
                  </Badge>
                  <Badge className={getStatusColor(selectedSubmission.status)}>
                    {selectedSubmission.status}
                  </Badge>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h4>Form Data:</h4>
                  <div className="bg-muted p-4 rounded-lg">
                    {renderFormData(selectedSubmission.formData)}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}