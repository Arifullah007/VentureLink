'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/icons';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function InvestorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({
        title: 'Login Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Login Successful',
        description: 'Redirecting to your dashboard...',
      });
      router.push('/investor/dashboard');
      router.refresh(); // to reflect login state
    }
    setLoading(false);
  };

  const handleSignUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          role: 'investor',
        }
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
        title: 'Sign Up Successful!',
        description: 'Please check your email to verify your account and then login.',
      });
    }
    setLoading(false);
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <Link href="/" className="flex justify-center items-center gap-2 mb-4">
                <Logo className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-foreground">VentureLink</span>
            </Link>
            <CardTitle className="text-2xl font-bold">Investor Portal</CardTitle>
            <CardDescription>Login or create an account to discover your next investment.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
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
            <Button className="w-full" type="submit" onClick={handleLogin} disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
            <Button className="w-full" variant="outline" onClick={handleSignUp} disabled={loading}>
              {loading ? 'Signing up...' : 'Sign Up'}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Access is subject to verification and our platform's terms.
            </p>
             <Button variant="link" size="sm" className="w-full" asChild>
                <Link href="/entrepreneur/login">Are you an Entrepreneur?</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
