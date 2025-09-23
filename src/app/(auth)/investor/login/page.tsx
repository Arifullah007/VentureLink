'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useState, type FormEvent } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function InvestorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Login Failed', description: 'Please enter both email and password.', variant: 'destructive'});
      return;
    }
    setLoading(true);
    const { data: { user }, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !user) {
      toast({
        title: 'Login Failed',
        description: error?.message || "An unknown error occurred.",
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    if (user.user_metadata?.role !== 'investor') {
        await supabase.auth.signOut();
        toast({
            title: 'Access Denied',
            description: 'This account is not registered as an investor.',
            variant: 'destructive',
        });
        setLoading(false);
        return;
    }

    toast({
      title: 'Login Successful',
      description: 'Redirecting to your dashboard...',
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <Card className="shadow-2xl">
        <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Investor Portal</CardTitle>
        <CardDescription>Login to discover your next investment.</CardDescription>
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
            <Link href="/investor/signup">Don't have an account? Sign Up</Link>
        </Button>
        <p className="text-xs text-muted-foreground text-center">
            Access is subject to verification and our platform's terms.
        </p>
            <Button variant="link" size="sm" className="w-full" asChild>
            <Link href="/entrepreneur/login">Are you an Entrepreneur?</Link>
        </Button>
        </CardFooter>
    </Card>
  );
}
