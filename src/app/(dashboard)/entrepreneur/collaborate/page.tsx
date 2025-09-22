import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Handshake, PlusCircle, Users } from "lucide-react";

const projectGroups = [
  {
    name: "Sustainable Futures",
    members: 2,
    idea: "Developing a new line of plant-based materials.",
    skillsNeeded: "Material Science, Marketing",
  },
  {
    name: "EdTech Disruptors",
    members: 4,
    idea: "Building an adaptive learning platform for coding.",
    skillsNeeded: "AI/ML, Pedagogy, UI/UX",
  },
];

export default function CombineGrowPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
            <div className="flex items-center gap-3">
                <Handshake className="h-8 w-8 text-primary" />
                <div>
                    <CardTitle>Combine &amp; Grow</CardTitle>
                    <CardDescription>Team up with fellow entrepreneurs to work on a single idea or create something new together.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between rounded-lg border p-4">
            <p className="max-w-2xl text-sm text-muted-foreground">
              Collaboration can lead to bigger and better outcomes. Find a team that complements your skills and shares your vision.
            </p>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Group
            </Button>
        </CardContent>
      </Card>
      
      <div>
        <h2 className="text-2xl font-semibold mb-4">Open Groups</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {projectGroups.map((group) => (
            <Card key={group.name} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{group.name}</CardTitle>
                <CardDescription>Skills needed: {group.skillsNeeded}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium mb-3">"{group.idea}"</p>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{group.members} Members</span>
                </div>
                 <div className="flex -space-x-2 overflow-hidden mt-4">
                  <Avatar className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                    <AvatarFallback>C</AvatarFallback>
                  </Avatar>
                  <Avatar className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                    <AvatarFallback>D</AvatarFallback>
                  </Avatar>
                   {group.members > 2 && <Avatar className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                     <AvatarFallback>+ {group.members-2}</AvatarFallback>
                   </Avatar>}
                </div>
              </CardContent>
              <div className="border-t p-4">
                <Button className="w-full">Request to Join Group</Button>              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
