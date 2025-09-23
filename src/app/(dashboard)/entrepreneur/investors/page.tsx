'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

type Investor = {
  id: string;
  full_name: string | null;
  bio: string | null;
  preferred_sector: string | null;
  investment_range: string | null;
  expected_returns: string | null;
}

export default function BrowseInvestorsPage() {
  const { toast } = useToast();
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [approached, setApproached] = useState<Set<string>>(new Set());
  const supabase = createClient();

  useEffect(() => {
    const fetchInvestors = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, bio, preferred_sector, investment_range, expected_returns')
        .eq('role', 'investor');

      if (error) {
        toast({ title: "Error", description: "Could not fetch investors.", variant: "destructive" });
      } else {
        setInvestors(data as Investor[]);
      }
      setLoading(false);
    }
    fetchInvestors();
  }, [supabase, toast]);

  const handleApproach = async (investor: Investor) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Authentication Error", description: "You must be logged in to approach an investor.", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from('notifications').insert({
      recipient_id: investor.id,
      sender_id: user.id,
      type: 'APPROACH',
      content: `An entrepreneur has shown interest in connecting with you.`,
    });

    if (error) {
      toast({
        title: "Failed to Send",
        description: `Could not send approach to ${investor.full_name}. ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Approach Initiated",
        description: `Your interest has been sent to ${investor.full_name}. You'll be notified if they accept.`,
      });
      setApproached(prev => new Set(prev).add(investor.id));
    }
  };

  return (
    <div className="space-y-6">
       <Card>
        <CardHeader>
          <CardTitle>Browse Investors</CardTitle>
          <CardDescription>Find the right investment partner for your venture. Explore profiles and make a connection.</CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
           Array.from({ length: 3 }).map((_, index) => (
             <Card key={index}><CardContent className="p-4"><Skeleton className="h-72 w-full" /></CardContent></Card>
           ))
        ) : investors.map((investor) => (
          <Card key={investor.id} className="flex flex-col hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarFallback>{investor.full_name?.charAt(0) || 'I'}</AvatarFallback>
              </Avatar>
              <CardTitle>{investor.full_name}</CardTitle>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {investor.preferred_sector && <Badge>{investor.preferred_sector}</Badge>}
                {investor.investment_range && <Badge variant="secondary">{investor.investment_range}</Badge>}
                {investor.expected_returns && <Badge variant="outline">{investor.expected_returns} Returns</Badge>}
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground text-center">
                {investor.bio || 'This investor has not provided a bio.'}
              </p>
            </CardContent>
            <div className="p-4 border-t">
              <Button 
                className="w-full" 
                onClick={() => handleApproach(investor)}
                disabled={approached.has(investor.id)}
              >
                {approached.has(investor.id) ? <Check className="mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />}
                {approached.has(investor.id) ? 'Approached' : 'Approach'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
