'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Bot, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Watermark } from "@/components/watermark";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

type Idea = {
  id: string;
  title: string;
  summary: string;
  field: string;
  prototype_url: string;
};

export default function InvestorDashboard() {
  const [featuredIdeas, setFeaturedIdeas] = useState<Idea[]>([]);

  useEffect(() => {
    const fetchIdeas = async () => {
      const { data, error } = await supabase
        .from('ideas')
        .select('id, title, summary, field, prototype_url')
        .limit(2);

      if (error) {
        console.error('Error fetching featured ideas:', error);
      } else {
        setFeaturedIdeas(data as Idea[]);
      }
    };

    fetchIdeas();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-card p-6 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground">Discover the most promising ventures and fuel innovation.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Browse Ideas</CardTitle>
                <CardDescription>Explore a curated list of startup ideas.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Filter by sector, investment size, and more to find your next opportunity.
            </p>
            <Button asChild>
              <Link href="/investor/ideas">
                Explore Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="bg-accent/10 p-3 rounded-lg">
                <Bot className="h-6 w-6 text-accent" />
              </div>
              <div>
                <CardTitle>AI-Powered Matcher</CardTitle>
                <CardDescription>Let our AI find the best matches for you.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Define your investment thesis and get a list of perfectly aligned ventures.
            </p>
            <Button asChild variant="secondary">
              <Link href="/investor/ai-matcher">
                Find Matches <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Featured Ideas</CardTitle>
          <CardDescription>Check out some of the top-trending ideas on the platform.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          {featuredIdeas.map((idea) => (
            <Card key={idea.id} className="overflow-hidden">
              <div className="relative">
                <Watermark text="VentureLink">
                  <Image
                    src={idea.prototype_url || 'https://picsum.photos/seed/placeholder/600/400'}
                    alt={`Prototype for ${idea.title}`}
                    width={600}
                    height={400}
                    className="aspect-video w-full object-cover"
                  />
                </Watermark>
              </div>
              <div className="p-4">
                <h3 className="font-semibold">{idea.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{idea.summary}</p>
                <div className="flex justify-between items-center mt-4">
                    <span className="text-xs font-semibold bg-primary/10 text-primary py-1 px-2 rounded-full">{idea.field}</span>
                    <Button variant="link" size="sm" asChild>
                        <Link href="/investor/ideas">View Details</Link>
                    </Button>
                </div>
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
