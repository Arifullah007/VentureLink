'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/icons';

export default function InvestorLoginPage() {
  const router = useRouter();
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/investor/dashboard');
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
            <CardDescription>Login to discover your next investment.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue="Sharad" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gov-id">Verified Government ID</Label>
                <Input id="gov-id" placeholder="Enter your ID number" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="name@example.com" required />
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" onClick={handleLogin}>
              Login
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
