'use server';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Check } from "lucide-react";
import { investors as predefinedInvestors } from "@/lib/data";
import type { Investor } from "@/lib/types";
import { ApproachButton } from "./_components/approach-button";

async function getInvestors(): Promise<Investor[]> {
    // In a real application, you would fetch this from your database.
    // For now, we'll use the predefined mock data.
    return predefinedInvestors;
}

export default async function BrowseInvestorsPage() {
  const investors = await getInvestors();

  return (
    <div className="space-y-6">
       <Card>
        <CardHeader>
          <CardTitle>Browse Investors</CardTitle>
          <CardDescription>Find the right investment partner for your venture. Explore profiles and make a connection.</CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {investors.map((investor) => (
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
                <ApproachButton investor={investor} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
