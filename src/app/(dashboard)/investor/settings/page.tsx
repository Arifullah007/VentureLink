'use client';

import { SettingsForm } from '@/components/settings-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export default function InvestorSettingsPage() {
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
        <SettingsForm />
      </CardContent>
    </Card>
  );
}
