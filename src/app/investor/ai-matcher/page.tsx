'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { InvestorPreferences, MatchResult } from './types';
import { investorPreferencesSchema } from './types';
import { getAiMatches } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Bot, Loader2, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import Image from 'next/image';
import { Watermark } from '@/components/watermark';

const investmentRanges = ['70K-5L', '5L-25L', '26L-1CR', '1CR+'];
const returnExpectations = ['Less', 'Medium', 'High'];
const sectors = ['Tech', 'Healthcare', 'Consumer Goods', 'Fintech', 'Sustainability', 'EdTech', 'Other'];

export default function AiMatcherPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<MatchResult[] | null>(null);
  const { toast } = useToast();

  const form = useForm<InvestorPreferences>({
    resolver: zodResolver(investorPreferencesSchema),
    defaultValues: {
      investorSector: '',
      investmentRange: '',
      expectedReturns: '',
    },
  });

  async function onSubmit(values: InvestorPreferences) {
    setIsLoading(true);
    setResults(null);
    try {
      const matches = await getAiMatches(values);
      setResults(matches);
      toast({
        title: 'Matching Complete!',
        description: `Found ${matches.length} potential matches for you.`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({
        variant: 'destructive',
        title: 'Matching Failed',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <CardTitle>AI Investor-Entrepreneur Matcher</CardTitle>
          </div>
          <CardDescription>
            Define your investment criteria and let our AI find the most suitable ventures for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="investorSector"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Sector</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a sector" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sectors.map((sector) => (
                            <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="investmentRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investment Range</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a range" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {investmentRanges.map((range) => (
                            <SelectItem key={range} value={range}>{range}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expectedReturns"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Returns</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select expectation" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {returnExpectations.map((exp) => (
                            <SelectItem key={exp} value={exp}>{exp}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Finding Matches...</>
                ) : (
                  <><Sparkles className="mr-2 h-4 w-4" /> Find My Matches</>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="text-center p-8">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Our AI is analyzing ventures... this may take a moment.</p>
        </div>
      )}

      {results && (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">Matching Results</h2>
            {results.map(({ idea, matchScore, matchReason }) => (
                <Card key={idea.id} className="overflow-hidden md:grid md:grid-cols-3 md:gap-4">
                    <div className="md:col-span-2">
                        <CardHeader>
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <CardTitle>{idea.title}</CardTitle>
                                    <CardDescription>Field: {idea.field}</CardDescription>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-sm font-medium text-muted-foreground">Match Score</p>
                                    <p className="text-2xl font-bold text-primary">{(matchScore * 100).toFixed(0)}%</p>
                                </div>
                            </div>
                            <Progress value={matchScore * 100} className="w-full mt-2" />
                        </CardHeader>
                        <CardContent>
                            <Alert>
                                <Bot className="h-4 w-4" />
                                <AlertTitle>AI Analysis</AlertTitle>
                                <AlertDescription>
                                    {matchReason}
                                </AlertDescription>
                            </Alert>
                            <Button asChild className="mt-4">
                                <Link href="/investor/subscriptions">Unlock Full Details</Link>
                            </Button>
                        </CardContent>
                    </div>
                     <div className="p-4 md:p-0 md:pr-4 md:py-4">
                        <Watermark text="VentureLink">
                           <Image
                                src={idea.prototype_url || 'https://picsum.photos/seed/placeholder/600/400'}
                                alt={`Prototype for ${idea.title}`}
                                width={600}
                                height={400}
                                className="aspect-video w-full object-cover rounded-lg"
                            />
                        </Watermark>
                    </div>
                </Card>
            ))}
        </div>
      )}
    </div>
  );
}
