'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { User, Linkedin, Link as LinkIcon } from 'lucide-react';
import { type Profile, getProfileAction, updateProfileAction } from '@/app/(dashboard)/profile/actions';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters.'),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters.').optional(),
  linkedinUrl: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
  websiteUrl: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function InvestorProfilePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      bio: '',
      linkedinUrl: '',
      websiteUrl: '',
    },
  });

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      const { data, error } = await getProfileAction();
      if (error) {
        toast({
          title: 'Error Loading Profile',
          description: error.message,
          variant: 'destructive',
        });
      } else if (data) {
        form.reset({
          fullName: data.full_name || '',
          bio: data.bio || '',
          linkedinUrl: data.linkedin_url || '',
          websiteUrl: data.website_url || '',
        });
      }
      setLoading(false);
    }
    loadProfile();
  }, [form, toast]);


  async function onSubmit(data: ProfileFormValues) {
    try {
      const { error } = await updateProfileAction({
        fullName: data.fullName,
        bio: data.bio,
        linkedinUrl: data.linkedinUrl,
        websiteUrl: data.websiteUrl,
      });

      if (error) throw new Error(error.message);

      toast({
        title: 'Profile Updated!',
        description: 'Your changes have been saved successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <User className="h-6 w-6 text-primary" />
          <CardTitle>My Profile</CardTitle>
        </div>
        <CardDescription>
          Keep your profile updated to build trust and attract the right entrepreneurs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="space-y-8">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-20 w-full" />
                </div>
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-11 w-32" />
            </div>
        ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Priya Patel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Investor Bio</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your investment focus, experience, and what you look for in a venture." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid md:grid-cols-2 gap-8">
               <FormField
                control={form.control}
                name="linkedinUrl"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="flex items-center gap-2"><Linkedin className="h-4 w-4"/> LinkedIn Profile</FormLabel>
                    <FormControl>
                        <Input placeholder="https://linkedin.com/in/yourprofile" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="websiteUrl"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="flex items-center gap-2"><LinkIcon className="h-4 w-4"/> Company / Personal Website</FormLabel>
                    <FormControl>
                        <Input placeholder="https://yourcompany.com" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </Form>
        )}
      </CardContent>
    </Card>
  );
}
