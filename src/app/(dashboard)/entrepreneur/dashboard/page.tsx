'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FilePenLine, BarChart, MessageSquare, PlusCircle, IndianRupee, Eye, Zap, MapPin } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from '@/lib/supabase/client';
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

type Idea = {
  id: string;
  idea_title: string;
  anonymized_summary: string; 
  investment_required: string;
  views: number;
  location: string;
};

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

export default function EntrepreneurDashboard() {
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [stats, setStats] = useState({ activeIdeas: 0, totalViews: 0, investorInquiries: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIdeasAndStats = async () => {
            setLoading(true);
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.log("No user found, stopping fetch.");
                setLoading(false);
                return;
            }
            
            const { data: fetchedIdeas, error, count } = await supabase
                .from('ideas')
                .select('*', { count: 'exact' })
                .eq('entrepreneur_id', user.id);

            if (error) {
                console.error("Error fetching ideas:", error.message);
                setIdeas([]);
            } else if (fetchedIdeas) {
                const ideasWithDefaults = fetchedIdeas.map((idea, index) => ({
                    ...idea,
                    views: idea.views || Math.floor(Math.random() * 200),
                    location: idea.location || (index % 2 === 0 ? 'Bengaluru, India' : 'Mumbai, India'),
                }));
                setIdeas(ideasWithDefaults as Idea[]);
                
                const totalViews = ideasWithDefaults.reduce((acc, idea) => acc + (idea.views || 0), 0);
                const totalInquiries = 12; // Hardcoded for demo

                setStats({ activeIdeas: count || 0, totalViews, investorInquiries: totalInquiries });
            } else {
                 setIdeas([]);
            }
            
            setLoading(false);
        };

        fetchIdeasAndStats();
    }, []);


  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
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
      
      <motion.div 
        className="grid gap-4 md:grid-cols-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {loading ? <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
        </> : <>
            <StatCard title="Active Ideas" value={stats.activeIdeas} icon={<Zap className="h-4 w-4" />} color="text-blue-500" />
            <StatCard title="Total Views" value={stats.totalViews} icon={<Eye className="h-4 w-4" />} color="text-green-500" />
            <StatCard title="Investor Inquiries" value={stats.investorInquiries} icon={<MessageSquare className="h-4 w-4" />} color="text-purple-500" />
        </>
        }
      </motion.div>

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
            ideas.map((idea, index) => (
              <motion.div 
                key={idea.id} 
                className="flex flex-col md:flex-row md:items-center justify-between rounded-lg border p-4 gap-4 hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
              >
                <div className="flex-1 space-y-1">
                    <p className="font-semibold text-lg">{idea.idea_title}</p>
                    <p className="text-sm text-muted-foreground">{idea.anonymized_summary.split('. ')[0]}</p>
                    <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground pt-2">
                        <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4"/> {idea.location}</span>
                        <span className="flex items-center gap-1.5"><Eye className="h-4 w-4"/> {idea.views} views</span>
                        <span className="flex items-center gap-1.5"><IndianRupee className="h-4 w-4"/> {idea.investment_required}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100/80">Active</Badge>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/entrepreneur/ideas/${idea.id}/edit`}>
                            <FilePenLine className="h-4 w-4 mr-1" /> Edit
                        </Link>
                    </Button>
                    <Button variant="default" size="sm" asChild>
                        <Link href={`/entrepreneur/ideas/${idea.id}/analytics`}>
                             <BarChart className="h-4 w-4 mr-1" /> View Analytics
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/entrepreneur/ideas/${idea.id}/inquiries`}>
                            <MessageSquare className="h-4 w-4 mr-1" /> Inquiries
                        </Link>
                    </Button>
                </div>
              </motion.div>
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
    </motion.div>
  );
}
