'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FilePenLine, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ideas as predefinedIdeas } from '@/lib/data';

const ideaSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  field: z.string().min(1, 'Please select a field.'),
  summary: z.string().min(20, 'Summary must be at least 20 characters.').max(1000, 'Summary cannot exceed 1000 characters.'),
  requiredInvestment: z.string().min(1, 'Please select an investment range.'),
  estimatedReturns: z.string().min(1, 'Please select an estimated return.'),
});

type IdeaFormValues = z.infer<typeof ideaSchema>;

const investmentRanges = ['70K-5L', '5L-25L', '26L-1CR', '1CR+'];
const returnExpectations = ['Less', 'Medium', 'High'];
const fields = ['Tech', 'Healthcare', 'Consumer Goods', 'Fintech', 'Sustainability', 'EdTech', 'Other'];


export default function EditIdeaPage() {
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const ideaId = params.id as string;
    const [loading, setLoading] = useState(true);

    const form = useForm<IdeaFormValues>({
        resolver: zodResolver(ideaSchema),
    });

    useEffect(() => {
        if (!ideaId) return;

        const fetchIdea = () => {
            setLoading(true);
            const data = predefinedIdeas.find(idea => idea.id === ideaId);
            
            if (!data) {
                toast({
                    title: 'Error',
                    description: 'Could not find idea details.',
                    variant: 'destructive'
                });
                router.push('/entrepreneur/dashboard');
                return;
            }

            form.reset({
                title: data.title,
                summary: data.summary,
                field: data.field,
                requiredInvestment: data.requiredInvestment,
                estimatedReturns: data.estimatedGuaranteedReturns,
            });
            setLoading(false);
        };
        fetchIdea();
    }, [ideaId, form, router, toast]);

    async function onSubmit(data: IdeaFormValues) {
        form.formState.isSubmitting = true;
        
        await new Promise(resolve => setTimeout(resolve, 1000));
            
        toast({
            title: 'Idea Updated! (Simulation)',
            description: 'Your changes have been saved successfully.',
        });
        
        form.formState.isSubmitting = false;
        router.push('/entrepreneur/dashboard');
    }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
            <FilePenLine className="h-6 w-6 text-primary"/>
            <CardTitle>Edit Your Idea</CardTitle>
        </div>
        <CardDescription>Update the details of your idea below. Clear and concise information attracts more investors.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
             <div className="space-y-8">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
                <div className="grid md:grid-cols-3 gap-8">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-11 w-32" />
            </div>
        ) : (
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Idea Title</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Eco-Friendly Packaging Solution" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Idea Summary</FormLabel>
                    <FormControl>
                        <Textarea placeholder="Briefly describe your idea, its purpose, and target audience. Do not include contact details." {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <div className="grid md:grid-cols-3 gap-8">
                    <FormField
                    control={form.control}
                    name="field"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Field / Sector</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select a field" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {fields.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="requiredInvestment"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Required Investment</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select a range" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {investmentRanges.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="estimatedReturns"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Estimated Guaranteed Returns</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select return level" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {returnExpectations.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                
                <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                        </>
                    ) : 'Save Changes'}
                </Button>
            </form>
            </Form>
        )}
      </CardContent>
    </Card>
  );
}
