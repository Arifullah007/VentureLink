'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/icons';

export default function EntrepreneurLoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/entrepreneur/dashboard');
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
            <CardTitle className="text-2xl font-bold">Entrepreneur Portal</CardTitle>
            <CardDescription>Verify your identity to access your dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue="Sharad" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aadhaar">Aadhaar / PAN Number</Label>
                <Input id="aadhaar" placeholder="e.g., 1234 5678 9012" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" type="date" required />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="age-verification" required />
                <label
                  htmlFor="age-verification"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I confirm I am 18 years or older
                </label>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" onClick={handleLogin}>
              Verify &amp; Login
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              By logging in, you agree to our Terms of Service and Privacy Policy.
            </p>
            <Button variant="link" size="sm" className="w-full" asChild>
                <Link href="/investor/login">Are you an Investor?</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
