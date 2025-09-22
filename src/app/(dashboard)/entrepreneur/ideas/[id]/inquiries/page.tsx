import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import Link from "next/link";

export default function InquiriesPage({ params }: { params: { id: string }}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <Card className="max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <MessageSquare className="h-12 w-12 text-primary" />
          </div>
          <CardTitle>Investor Inquiries</CardTitle>
          <CardDescription>
            This is where you will manage all investor inquiries and messages for your idea (ID: {params.id}). This feature is currently under construction.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <Link href="/entrepreneur/dashboard" className="text-primary hover:underline">
            &larr; Back to Dashboard
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
