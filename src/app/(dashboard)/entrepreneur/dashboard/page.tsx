import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Lightbulb, Users } from "lucide-react";
import Link from "next/link";

export default function EntrepreneurDashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-card p-6 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold">Welcome back, Sharad!</h1>
        <p className="text-muted-foreground">Ready to turn your vision into reality? Here's what you can do.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Post a New Idea</CardTitle>
                <CardDescription>Share your project with our network of investors.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Provide a summary, define your investment needs, and upload a prototype to attract the right partners.
            </p>
            <Button asChild>
              <Link href="/entrepreneur/ideas/new">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="bg-accent/10 p-3 rounded-lg">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <div>
                <CardTitle>Browse Investors</CardTitle>
                <CardDescription>Find and approach investors who align with your goals.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Explore profiles of verified investors, understand their interests, and make your pitch.
            </p>
            <Button asChild variant="secondary">
              <Link href="/entrepreneur/investors">
                Find Investors <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>You have no recent activity. Start by posting an idea!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Your submitted ideas and investor interactions will appear here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
