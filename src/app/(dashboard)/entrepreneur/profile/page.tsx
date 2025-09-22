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
import { User } from 'lucide-react';
import { getProfileAction, updateProfileAction } from '@/app/(dashboard)/profile/actions';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters.'),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters.').optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function EntrepreneurProfilePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      bio: '',
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
          Update your personal and professional information here. This helps investors get to know you better.
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
                    <Input placeholder="e.g., John Doe" {...field} />
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
                  <FormLabel>Your Bio</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tell us a little about your background and passion." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
