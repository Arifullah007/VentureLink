import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function EntrepreneurSettingsPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-primary" />
          <CardTitle>Settings</CardTitle>
        </div>
        <CardDescription>
          Manage your account settings, notifications, and preferences here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center items-center h-48 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">Account settings are coming soon!</p>
        </div>
      </CardContent>
    </Card>
  );
}
