import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User } from "lucide-react";

export default function EntrepreneurProfilePage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <User className="h-6 w-6 text-primary" />
          <CardTitle>My Profile</CardTitle>
        </div>
        <CardDescription>
          This is where your profile information will be displayed and can be edited.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center items-center h-48 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">Profile editing functionality is coming soon!</p>
        </div>
      </CardContent>
    </Card>
  );
}
