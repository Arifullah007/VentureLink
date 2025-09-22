import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage({ params }: { params: { id: string }}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <Card className="max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <BarChart className="h-12 w-12 text-primary" />
          </div>
          <CardTitle>Analytics Coming Soon</CardTitle>
          <CardDescription>
            We are building a comprehensive analytics dashboard for your pitch (ID: {params.id}). You will soon be able to see detailed metrics like investor views, engagement time, and more.
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
