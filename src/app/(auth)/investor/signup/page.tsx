'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useState, type FormEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function InvestorSignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      toast({ title: 'Sign Up Failed', description: 'Please fill out all fields.', variant: 'destructive'});
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          role: 'investor',
          full_name: fullName,
        },
      }
    });
    if (error) {
      toast({
        title: 'Sign Up Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'OTP Sent!',
        description: 'Please check your email for the verification code.',
      });
      router.push(`/investor/verify-otp?email=${encodeURIComponent(email)}`);
    }
    setLoading(false);
  };

  return (
    <Card className="shadow-2xl">
        <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Create Investor Account</CardTitle>
        <CardDescription>Join our network to find your next investment.</CardDescription>
        </CardHeader>
        <CardContent>
        <form onSubmit={handleSignUp} className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input id="full-name" type="text" placeholder="Priya Patel" required value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="name@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
            </div>
        </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
        <Button className="w-full" type="submit" onClick={handleSignUp} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
        </Button>
         <p className="text-xs text-muted-foreground text-center">
            Access is subject to verification and our platform's terms.
        </p>
        <Button variant="link" size="sm" className="w-full" asChild>
            <Link href="/investor/login">Already have an account? Login</Link>
        </Button>
        </CardFooter>
    </Card>
  );
}
