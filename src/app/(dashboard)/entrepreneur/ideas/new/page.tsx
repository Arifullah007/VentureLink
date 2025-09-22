'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Lightbulb, UploadCloud, ShieldCheck, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const pitchSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  field: z.string().min(1, 'Please select a field.'),
  summary: z.string().min(20, 'Summary must be at least 20 characters.').max(1000, 'Summary cannot exceed 1000 characters.'),
  requiredInvestment: z.string().min(1, 'Please select an investment range.'),
  estimatedReturns: z.string().min(1, 'Please select an estimated return.'),
  prototype: z.any().refine((files) => files?.length == 1, 'A prototype file is required.')
    .refine((files) => files?.[0]?.size <= 10000000, `Max file size is 10MB.`),
});

type PitchFormValues = z.infer<typeof pitchSchema>;

const investmentRanges = ['70K-5L', '5L-25L', '26L-1CR', '1CR+'];
const returnExpectations = ['Less', 'Medium', 'High'];
const fields = ['Tech', 'Healthcare', 'Consumer Goods', 'Fintech', 'Sustainability', 'EdTech', 'Other'];


export default function NewPitchPage() {
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<PitchFormValues>({
        resolver: zodResolver(pitchSchema),
        defaultValues: {
            title: '',
            field: '',
            summary: '',
            requiredInvestment: '',
            estimatedReturns: '',
        }
    });

    async function onSubmit(data: PitchFormValues) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated.");

            const file = data.prototype[0];
            const fileExtension = file.name.split('.').pop();
            const fileName = `${uuidv4()}.${fileExtension}`;
            const filePath = `${user.id}/${fileName}`;

            // 1. Get a signed URL from our Edge Function
            const { data: signedUrlData, error: signedUrlError } = await supabase.functions.invoke('get-signed-upload-url', {
                body: { filePath },
            });
            if (signedUrlError) throw new Error(`Failed to get signed URL: ${signedUrlError.message}`);
            
            const { signedUrl } = signedUrlData;

            // 2. Upload the file to Supabase Storage using the signed URL
            const { error: uploadError } = await fetch(signedUrl, {
                method: 'PUT',
                headers: { 'Content-Type': file.type },
                body: file,
            });
            if (uploadError) throw new Error(`File upload failed: ${(uploadError as any).message}`);
            
            // 3. Create the pitch in the database
            const { data: pitchData, error: pitchError } = await supabase
                .from('pitches')
                .insert({
                    entrepreneur_id: user.id,
                    pitch_title: data.title,
                    anonymized_summary: data.summary,
                    full_text: data.summary,
                    sector: data.field,
                    investment_required: data.requiredInvestment,
                    estimated_returns: data.estimatedReturns,
                })
                .select()
                .single();

            if (pitchError) throw pitchError;
            if (!pitchData) throw new Error("Failed to create pitch record.");

            // 4. Create a record in pitch_files to trigger the processing webhook
            const { error: fileRecordError } = await supabase
                .from('pitch_files')
                .insert({
                    pitch_id: pitchData.id,
                    file_path: filePath,
                    file_name: file.name,
                });
            
            if (fileRecordError) throw fileRecordError;
            
            toast({
                title: 'Pitch Submitted!',
                description: 'Your pitch is being processed and will be available to investors shortly.',
            });
            router.push('/entrepreneur/dashboard');

        } catch (error: any) {
             toast({
                title: 'Submission Failed',
                description: error.message,
                variant: 'destructive'
            });
        }
    }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
            <Lightbulb className="h-6 w-6 text-primary"/>
            <CardTitle>Submit Your New Pitch</CardTitle>
        </div>
        <CardDescription>Fill out the details below to get your pitch in front of investors. Be clear and concise.</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6 border-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200">
            <ShieldCheck className="h-4 w-4 !text-blue-600" />
            <AlertTitle className="font-semibold">Protect Your Pitch</AlertTitle>
            <AlertDescription>
                Your security is important. Our system will automatically process and watermark your uploaded file. Do not include personal contact information in your descriptions or uploads.
            </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pitch Title</FormLabel>
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
                  <FormLabel>Pitch Summary</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Briefly describe your idea, its purpose, and target audience. Do not include contact details." {...field} />
                  </FormControl>
                   <FormDescription>
                    This summary will be visible to investors. Our system will scan it for contact information.
                  </FormDescription>
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
             <FormField
              control={form.control}
              name="prototype"
              render={({ field }) => {
                 const file = form.watch('prototype')?.[0];
                 return (
                <FormItem>
                  <FormLabel>Pitch Document/Prototype</FormLabel>
                  <FormControl>
                    <div className="relative flex justify-center w-full h-32 px-6 pt-5 pb-6 border-2 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            <UploadCloud className="w-12 h-12 mx-auto text-gray-400" />
                             <div className="flex text-sm text-gray-600">
                                <label
                                htmlFor="file-upload"
                                className="relative font-medium text-primary bg-white rounded-md cursor-pointer hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                                >
                                <span>Upload a file</span>
                                <Input id="file-upload" type="file" className="sr-only" 
                                    onChange={(e) => field.onChange(e.target.files)} 
                                    accept=".pdf,.png,.jpg,.jpeg"
                                    />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            {file ? (
                                <p className="text-sm text-muted-foreground font-medium">{file.name}</p>
                            ) : (
                                <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                            )}
                        </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    To protect your intellectual property, our system will automatically watermark your upload.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}}
            />
            
            <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                    </>
                ) : 'Submit My Pitch'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
