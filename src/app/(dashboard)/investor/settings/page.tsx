'use client';

import { SettingsForm } from '@/components/settings-form';
import { Settings } from 'lucide-react';

export default function InvestorSettingsPage() {
  return (
    <div className="space-y-6">
       <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings, notifications, and preferences here.
            </p>
          </div>
        </div>
      <SettingsForm />
    </div>
  );
}
