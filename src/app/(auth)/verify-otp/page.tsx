'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { verifyOtp } from './actions';
import { Logo } from '@/components/icons';
import { Loader2 } from 'lucide-react';

const otpSchema = z.object({
  otp: z.string().min(6, 'OTP must be 6 digits.').max(6, 'OTP must be 6 digits.'),
});

type OtpFormValues = z.infer<typeof otpSchema>;

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
  });

  const handleSubmit = async (data: OtpFormValues) => {
    if (!email) {
      toast({
        title: 'Error',
        description: 'Email is missing from the request.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    const result = await verifyOtp({ email, otp: data.otp });
    setLoading(false);

    if (result.error) {
      toast({
        title: 'Verification Failed',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Account Verified!',
        description: 'You can now log in.',
      });
      router.push('/login');
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gray-50">
       <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 opacity-50"></div>
      <motion.div
        className="relative z-10 w-full max-w-md rounded-2xl border border-gray-200 bg-white/80 p-8 shadow-2xl backdrop-blur-lg"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="flex flex-col items-center justify-center mb-6">
            <Logo className="h-10 w-10 text-primary" />
            <h1 className="mt-3 text-2xl font-bold tracking-tighter text-gray-900">
                Verify Your Account
            </h1>
        </div>
        <p className="text-center text-sm text-muted-foreground mb-6">
            We&apos;ve sent a 6-digit code to <strong>{email}</strong>. Please enter it below to verify your email address.
        </p>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              id="otp"
              type="text"
              placeholder="123456"
              maxLength={6}
              {...form.register('otp')}
              className="mt-1 text-center text-lg tracking-[0.5em]"
            />
            {form.formState.errors.otp && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.otp.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full font-semibold" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : 'Verify'}
          </Button>
        </form>
         <p className="mt-6 text-center text-sm text-gray-600">
            Didn&apos;t get a code?{' '}
            <button onClick={() => {}} className="font-semibold text-primary hover:underline" disabled>
              Resend (Coming Soon)
            </button>
        </p>
      </motion.div>
    </div>
  );
}

export default function VerifyOtpPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyOtpForm />
        </Suspense>
    )
}
