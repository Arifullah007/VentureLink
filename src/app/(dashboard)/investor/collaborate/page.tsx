import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Handshake, PlusCircle, Users } from "lucide-react";

const investmentGroups = [
  {
    name: "Tech Titans Syndicate",
    members: 3,
    target: "Early-stage SaaS",
    idea: "Smart Logistics Platform",
  },
  {
    name: "Healthcare Innovators",
    members: 2,
    target: "Digital Health",
    idea: "AI-Powered Health Monitoring App",
  },
];

export default function CombineInvestPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
            <div className="flex items-center gap-3">
                <Handshake className="h-8 w-8 text-primary" />
                <div>
                    <CardTitle>Combine Invest</CardTitle>
                    <CardDescription>Pool resources with other investors to fund larger projects and diversify risk.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between rounded-lg border p-4">
            <p className="max-w-2xl text-sm text-muted-foreground">
              Form or join an investment syndicate to collectively invest in a single idea. The entrepreneur must approve the group investment proposal.
            </p>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Syndicate
            </Button>
        </CardContent>
      </Card>
      
      <div>
        <h2 className="text-2xl font-semibold mb-4">Active Syndicates</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {investmentGroups.map((group) => (
            <Card key={group.name} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{group.name}</CardTitle>
                <CardDescription>Targeting: {group.target}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{group.members} Members</span>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="font-semibold">Current Target Idea:</span>
                  <span className="text-primary">{group.idea}</span>
                </div>
                <div className="flex -space-x-2 overflow-hidden mt-4">
                  <Avatar className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                    <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                  <Avatar className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                    <AvatarFallback>B</AvatarFallback>
                  </Avatar>
                   {group.members > 2 && <Avatar className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                     <AvatarFallback>+ {group.members-2}</AvatarFallback>
                   </Avatar>}
                </div>
              </CardContent>
              <div className="border-t p-4">
                <Button className="w-full">Request to Join</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
