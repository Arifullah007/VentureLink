'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FilePenLine, BarChart, MessageSquare, PlusCircle, IndianRupee, Eye, MapPin, Zap, EyeIcon, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

type Idea = {
  id: string;
  title: string;
  summary: string; // The short description under the title
  location: string; // e.g. Bengaluru, India
  views: number;
  required_investment: string; // The amount like 5,00,000
};

// Mock data for initial display
const mockIdeas: Idea[] = [
  {
    id: 'idea1',
    title: 'Smart Kirana Network',
    summary: 'Digitizing neighbourhood stores for last-mile delivery',
    location: 'Bengaluru, India',
    views: 85,
    required_investment: '5,00,000',
  },
  {
    id: 'idea2',
    title: 'AI Health Advisor',
    summary: 'AI-powered telemedicine for preventive care',
    location: 'Mumbai, India',
    views: 64,
    required_investment: '12,00,000',
  },
];


const StatCard = ({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

export default function EntrepreneurDashboard() {
    const [ideas, setIdeas] = useState<Idea[]>(mockIdeas);
    const [stats, setStats] = useState({ activeIdeas: 3, totalViews: 149, investorInquiries: 12 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIdeasAndStats = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // In a real scenario, you would fetch these stats from your backend/DB
                // For now, we'll use a mix of mock data and fetched data count
                const { data: fetchedIdeas, error, count } = await supabase
                    .from('ideas')
                    .select('*', { count: 'exact' })
                    .eq('entrepreneur_id', user.id);

                if (!error && fetchedIdeas) {
                    const formattedIdeas: Idea[] = fetchedIdeas.map(idea => ({
                        id: idea.id,
                        title: idea.title,
                        summary: idea.summary.split('. ')[0], // Simple summary logic
                        location: 'Remote', // Placeholder
                        views: Math.floor(Math.random() * 200), // Placeholder
                        required_investment: idea.required_investment,
                    }));
                    setIdeas(formattedIdeas);
                    setStats(prev => ({ ...prev, activeIdeas: count || 0 }));
                }
            }
            // Keep mock data for visual representation if fetch fails or returns empty
            if(ideas.length === 0) setIdeas(mockIdeas);

            setLoading(false);
        };

        // Using a timeout to simulate loading
        setTimeout(fetchIdeasAndStats, 1000);
    }, []);


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Entrepreneur Dashboard</h1>
            <p className="text-muted-foreground">Manage your startup ideas and connect with potential investors</p>
          </div>
          <Button asChild size="lg">
              <Link href="/entrepreneur/ideas/new">
                <PlusCircle className="mr-2 h-5 w-5" /> Submit New Idea
              </Link>
            </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        {loading ? <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
        </> : <>
            <StatCard title="Active Ideas" value={stats.activeIdeas} icon={<Zap className="h-4 w-4 text-muted-foreground" />} />
            <StatCard title="Total Views" value={stats.totalViews} icon={<EyeIcon className="h-4 w-4 text-muted-foreground" />} />
            <StatCard title="Investor Inquiries" value={stats.investorInquiries} icon={<MessageCircle className="h-4 w-4 text-muted-foreground" />} />
        </>
        }
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Your Startup Ideas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
        {loading ? (
            Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="space-y-2 flex-grow">
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-20" />
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-9 w-20" />
                    </div>
                </div>
            ))
        ) : ideas.length > 0 ? (
            ideas.map((idea) => (
              <div key={idea.id} className="flex flex-col md:flex-row md:items-center justify-between rounded-lg border p-4 gap-4">
                <div className="flex-1 space-y-1">
                    <p className="font-semibold text-lg">{idea.title}</p>
                    <p className="text-sm text-muted-foreground">{idea.summary}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                        <span className="flex items-center gap-1"><MapPin className="h-4 w-4"/> {idea.location}</span>
                        <span className="flex items-center gap-1"><Eye className="h-4 w-4"/> {idea.views} views</span>
                        <span className="flex items-center gap-1"><IndianRupee className="h-4 w-4"/> {idea.required_investment}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100/80">Active</Badge>
                    <Button variant="outline" size="sm"><FilePenLine className="h-4 w-4 mr-1" /> Edit</Button>
                    <Button variant="default" size="sm"><BarChart className="h-4 w-4 mr-1" /> View Analytics</Button>
                    <Button variant="outline" size="sm"><MessageSquare className="h-4 w-4 mr-1" /> Inquiries</Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>You haven&apos;t submitted any ideas yet.</p>
               <Button asChild className="mt-4">
                  <Link href="/entrepreneur/ideas/new">
                    <PlusCircle className="mr-2 h-4 w-4" /> Submit Your First Idea
                  </Link>
                </Button>
            </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
