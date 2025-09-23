'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function EntrepreneurLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Login Failed', description: 'Please enter both email and password.', variant: 'destructive'});
      return;
    }
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: 'entrepreneur' }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'An unknown error occurred.');
      }

      toast({
        title: 'Login Successful',
        description: 'Redirecting to your dashboard...',
      });
      
      window.location.href = '/entrepreneur/dashboard';

    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Entrepreneur Portal</CardTitle>
        <CardDescription>Login to your account to manage your ideas.</CardDescription>
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
         <Button variant="outline" className="w-full" asChild>
            <Link href="/entrepreneur/signup">Don't have an account? Sign Up</Link>
        </Button>
        <p className="text-xs text-muted-foreground text-center">
            By logging in, you agree to our Terms of Service and Privacy Policy.
        </p>
        <Button variant="link" size="sm" className="w-full" asChild>
            <Link href="/investor/login">Are you an Investor?</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
