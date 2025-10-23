'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { investors as predefinedInvestors } from "@/lib/data";
import type { Investor } from "@/lib/types";


export default function BrowseInvestorsPage() {
  const { toast } = useToast();
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [approached, setApproached] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    const fetchInvestors = () => {
      setLoading(true);
      setInvestors(predefinedInvestors);
      setLoading(false);
    }
    fetchInvestors();
  }, []);

  const handleApproach = async (investor: Investor) => {
    // await new Promise(resolve => setTimeout(resolve, 500));
    
    toast({
      title: "Approach Initiated",
      description: `Your interest has been sent to ${investor.name}. You'll be notified if they accept.`,
    });
    setApproached(prev => new Set(prev).add(investor.id));
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
                <AvatarFallback>{investor.name?.charAt(0) || 'I'}</AvatarFallback>
              </Avatar>
              <CardTitle>{investor.name}</CardTitle>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {investor.sector && <Badge>{investor.sector}</Badge>}
                {investor.investmentRange && <Badge variant="secondary">{investor.investmentRange}</Badge>}
                {investor.expectedReturns && <Badge variant="outline">{investor.expectedReturns} Returns</Badge>}
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
