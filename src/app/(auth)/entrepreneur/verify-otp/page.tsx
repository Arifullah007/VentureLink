'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, type FormEvent, Suspense } from 'react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    if (!otp) {
      toast({ title: 'Verification Failed', description: 'Please enter the OTP from your email.', variant: 'destructive' });
      return;
    }
    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });

    if (error) {
      toast({
        title: 'Verification Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Account Verified!',
        description: 'You can now log in with your credentials.',
      });
      router.push('/entrepreneur/login');
    }
    setLoading(false);
  };

  return (
     <Card className="shadow-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Verify Your Account</CardTitle>
        <CardDescription>Enter the 6-digit code sent to <span className="font-semibold text-foreground">{email}</span></CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
            <Label htmlFor="otp">Verification Code (OTP)</Label>
            <Input 
              id="otp" 
              type="text" 
              placeholder="123456" 
              required 
              value={otp} 
              onChange={e => setOtp(e.target.value)}
              maxLength={6}
            />
            </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button className="w-full" type="submit" onClick={handleVerify} disabled={loading}>
          {loading ? 'Verifying...' : 'Verify Account'}
        </Button>
        <Button variant="link" size="sm" className="w-full" asChild>
            <Link href="/entrepreneur/login">Back to Login</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}


export default function VerifyOtpPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyOtpForm />
        </Suspense>
    )
}
