import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { investors } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send } from "lucide-react";

export default function BrowseInvestorsPage() {
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
                <AvatarFallback>{investor.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <CardTitle>{investor.name}</CardTitle>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                <Badge>{investor.sector}</Badge>
                <Badge variant="secondary">{investor.investmentRange}</Badge>
                <Badge variant="outline">{investor.expectedReturns} Returns</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground text-center">
                {investor.bio}
              </p>
            </CardContent>
            <div className="p-4 border-t">
              <Button className="w-full">
                <Send className="mr-2 h-4 w-4" /> Approach
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
