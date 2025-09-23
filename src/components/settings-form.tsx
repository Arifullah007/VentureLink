'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { deleteAccountAction, updatePasswordAction } from '@/app/(dashboard)/settings/actions';
import { getProfileAction, updateProfileAction } from '@/app/(dashboard)/profile/actions';
import { Loader2, ShieldAlert, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Label } from './ui/label';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { createClient } from '@/lib/supabase/client';

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters.'),
    confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters.'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function SettingsForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const supabase = createClient();

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: '' },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      const { data: userData, error: authError } = await supabase.auth.getUser();
      if(userData.user?.email) {
        setEmail(userData.user.email);
      }

      const { data, error } = await getProfileAction();
      if (error) {
        toast({ title: 'Error Loading Profile', description: error.message, variant: 'destructive' });
      } else if (data) {
        profileForm.reset({ fullName: data.full_name || '' });
      }
      setLoading(false);
    }
    loadProfile();
  }, [profileForm, toast, supabase]);


  async function onPasswordSubmit(data: PasswordFormValues) {
    const { error } = await updatePasswordAction(data);
    if (error) {
      toast({
        title: 'Error updating password',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Password Updated',
        description: 'Your password has been changed successfully.',
      });
      passwordForm.reset();
    }
  }

  async function onProfileSubmit(data: ProfileFormValues) {
    const { error } = await updateProfileAction({ fullName: data.fullName });
    if (error) {
      toast({ title: 'Error updating profile', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Profile Updated', description: 'Your name has been updated successfully.' });
    }
  }
  
  async function handleDeleteAccount() {
    const { error } = await deleteAccountAction();
    if (error) {
        toast({
            title: 'Error Deleting Account',
            description: error.message,
            variant: 'destructive',
        });
    } else {
        toast({
            title: 'Account Deleted',
            description: 'Your account has been permanently deleted.',
        });
        router.push('/');
    }
  }

  if (loading) {
    return (
      <div className="space-y-10">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-10">
      
      {/* My Account Section */}
      <Card>
          <CardHeader>
              <CardTitle>My Account</CardTitle>
              <CardDescription>Update your account information.</CardDescription>
          </CardHeader>
          <CardContent>
             <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4 max-w-lg">
                    <FormField
                    control={profileForm.control}
                    name="fullName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={email} readOnly disabled />
                    </div>
                    <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                        {profileForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save
                    </Button>
                </form>
            </Form>
          </CardContent>
      </Card>

      {/* Change Password Section */}
      <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Choose a strong password to protect your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-lg">
                <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                        <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                        <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                        <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                {passwordForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Change Password
                </Button>
            </form>
            </Form>
          </CardContent>
      </Card>

      {/* Notification Settings Section */}
      <Card>
          <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage how you receive notifications from VentureLink.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-w-lg">
            <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                <Label>Investor Inquiries</Label>
                <p className="text-sm text-muted-foreground">Receive an email when an investor shows interest in your pitch.</p>
                </div>
                <Switch />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                <Label>New Messages</Label>
                <p className="text-sm text-muted-foreground">Get notified about new messages in your deal rooms.</p>
                </div>
                <Switch />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                <Label>Platform Updates</Label>
                <p className="text-sm text-muted-foreground">Receive news and updates about the VentureLink platform.</p>
                </div>
                <Switch defaultChecked/>
            </div>
        </CardContent>
      </Card>
      
      {/* Delete Account Section */}
       <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>These actions are permanent and cannot be undone.</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="max-w-lg">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Delete Your Account</AlertTitle>
            <AlertDescription>
                Permanently delete your account and all associated data, including your profile and pitches.
            </AlertDescription>
            </Alert>
            <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" className="mt-4">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete My Account
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                    className="bg-destructive hover:bg-destructive/90"
                    onClick={handleDeleteAccount}
                >
                    Yes, Delete Account
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
            </AlertDialog>
          </CardContent>
      </Card>
    </div>
  );
}
