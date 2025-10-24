'use server';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FilePenLine, BarChart, MessageSquare, PlusCircle, IndianRupee, Eye, Zap, MapPin } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ideas as predefinedIdeas } from "@/lib/data";
import type { Idea } from "@/lib/types";

// Mock stats - in a real app, these would come from the database
const stats = { activeIdeas: 2, totalViews: 842, investorInquiries: 15 };

type IdeaWithStats = Idea & {
    views: number;
    location: string;
};

async function getEntrepreneurIdeas(): Promise<IdeaWithStats[]> {
    // In a real app, you would fetch ideas belonging to the logged-in user.
    // For now, we simulate this with mock data and add random stats.
    const ideasWithRandomStats = predefinedIdeas.map((idea, index) => ({
        ...idea,
        views: Math.floor(Math.random() * 200),
        location: (index % 2 === 0 ? 'Bengaluru, India' : 'Mumbai, India'),
    }));
    return ideasWithRandomStats;
}

const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode, color: string }) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className={color}>
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

export default async function EntrepreneurDashboard() {
    const ideas = await getEntrepreneurIdeas();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-body tracking-wider">Entrepreneur Dashboard</h1>
            <p className="text-muted-foreground">Manage your startup ideas and connect with potential investors</p>
          </div>
          <Link href="/entrepreneur/ideas/new">
            <Button size="lg">
              <PlusCircle className="mr-2 h-5 w-5" /> Submit New Idea
            </Button>
          </Link>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Active Ideas" value={ideas.length} icon={<Zap className="h-4 w-4" />} color="text-blue-500" />
        <StatCard title="Total Views" value={stats.totalViews} icon={<Eye className="h-4 w-4" />} color="text-green-500" />
        <StatCard title="Investor Inquiries" value={stats.investorInquiries} icon={<MessageSquare className="h-4 w-4" />} color="text-purple-500" />
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Your Startup Ideas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
        {ideas.length > 0 ? (
            ideas.map((idea, index) => (
              <div 
                key={idea.id} 
                className="flex flex-col md:flex-row md:items-center justify-between rounded-lg border p-4 gap-4 hover:shadow-md transition-shadow"
              >
                <div className="flex-1 space-y-1">
                    <p className="font-semibold text-lg">{idea.title}</p>
                    <p className="text-sm text-muted-foreground">{idea.summary.split('. ')[0]}</p>
                    <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground pt-2">
                        <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4"/> {idea.location}</span>
                        <span className="flex items-center gap-1.5"><Eye className="h-4 w-4"/> {idea.views} views</span>
                        <span className="flex items-center gap-1.5"><IndianRupee className="h-4 w-4"/> {idea.requiredInvestment}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100/80">Active</Badge>
                    <Link href={`/entrepreneur/ideas/${idea.id}/edit`} passHref>
                        <Button variant="outline" size="sm">
                            <FilePenLine className="h-4 w-4 mr-1" /> Edit
                        </Button>
                    </Link>
                    <Link href={`/entrepreneur/ideas/${idea.id}/analytics`} passHref>
                        <Button variant="default" size="sm">
                             <BarChart className="h-4 w-4 mr-1" /> View Analytics
                        </Button>
                    </Link>
                    <Link href={`/entrepreneur/ideas/${idea.id}/inquiries`} passHref>
                        <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4 mr-1" /> Inquiries
                        </Button>
                    </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>You haven't submitted any ideas yet.</p>
                <Link href="/entrepreneur/ideas/new">
                   <Button className="mt-4">
                    <PlusCircle className="mr-2 h-4 w-4" /> Submit Your First Idea
                  </Button>
                </Link>
            </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
