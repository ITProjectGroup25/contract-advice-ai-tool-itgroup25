import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { CheckCircle, ArrowLeft, FileText, Clock } from "lucide-react";

interface SuccessPageProps {
  onBack: () => void;
}

export function SuccessPage({ onBack }: SuccessPageProps) {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Form
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl">Referral Request</h1>
          <p className="text-muted-foreground">
            Your complex referral has been submitted successfully
          </p>
        </div>
      </div>

      {/* Success Message */}
      <Card className="text-center">
        <CardContent className="pt-8 pb-8">
          <div className="flex flex-col items-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl text-green-700">Successfully Submitted!</h2>
              <p className="text-muted-foreground max-w-md">
                Your complex referral request has been received and will be processed by our team.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mt-8">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5" />
                    What's Next?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Our team will review your complex referral and get back to you with detailed guidance and support.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    You can expect a response within 3-5 business days. Urgent requests will be prioritized accordingly.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <Button onClick={onBack} size="lg">
                Submit Another Request
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}