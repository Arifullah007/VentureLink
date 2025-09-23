'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { login, signup } from './actions';
import { Logo } from '@/components/icons';
import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

const signupSchema = z.object({
  fullName: z.string().min(2, 'Please enter your full name.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  role: z.enum(['entrepreneur', 'investor'], {
    required_error: 'Please select a role.',
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') || 'entrepreneur';

  const [loading, setLoading] = useState(false);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      role: initialRole as 'entrepreneur' | 'investor',
    },
  });

  const handleLogin = async (data: LoginFormValues) => {
    setLoading(true);
    const result = await login(data);
    setLoading(false);

    if (result.error) {
      toast({
        title: 'Login Failed',
        description: result.error.message,
        variant: 'destructive',
      });
    } else if (result.redirectTo) {
      toast({
        title: 'Login Successful!',
        description: 'Redirecting to your dashboard...',
      });
      router.push(result.redirectTo);
    } else {
        toast({
            title: 'Login Error',
            description: 'Could not determine redirection path. Please try again.',
            variant: 'destructive',
        });
    }
  };

  const handleSignup = async (data: SignupFormValues) => {
    setLoading(true);
    const result = await signup(data);
    setLoading(false);
    
    if (result.error) {
        toast({
            title: 'Signup Failed',
            description: result.error.message,
            variant: 'destructive',
        });
    } else {
        toast({
            title: 'Account Created!',
            description: 'Please check your email to verify your account.',
        });
        // You might want to redirect to a page informing the user to check their email
        setIsLogin(true);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
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
            VentureLink
          </h1>
        </div>
        {isLogin ? (
          <motion.div initial="hidden" animate="visible" variants={formVariants}>
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...loginForm.register('email')}
                  className="mt-1"
                />
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-red-500 mt-1">{loginForm.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...loginForm.register('password')}
                  className="mt-1"
                />
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-red-500 mt-1">{loginForm.formState.errors.password.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full font-semibold" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <button onClick={() => setIsLogin(false)} className="font-semibold text-primary hover:underline">
                Sign Up
              </button>
            </p>
          </motion.div>
        ) : (
          <motion.div initial="hidden" animate="visible" variants={formVariants}>
            <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Your Name"
                  {...signupForm.register('fullName')}
                  className="mt-1"
                />
                {signupForm.formState.errors.fullName && (
                  <p className="text-sm text-red-500 mt-1">{signupForm.formState.errors.fullName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email-signup">Email</Label>
                <Input
                  id="email-signup"
                  type="email"
                  placeholder="you@example.com"
                  {...signupForm.register('email')}
                  className="mt-1"
                />
                {signupForm.formState.errors.email && (
                  <p className="text-sm text-red-500 mt-1">{signupForm.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="password-signup">Password</Label>
                <Input
                  id="password-signup"
                  type="password"
                  placeholder="••••••••"
                  {...signupForm.register('password')}
                  className="mt-1"
                />
                {signupForm.formState.errors.password && (
                  <p className="text-sm text-red-500 mt-1">{signupForm.formState.errors.password.message}</p>
                )}
              </div>
              <div>
                <Label>I am an...</Label>
                <RadioGroup
                  defaultValue={initialRole}
                  onValueChange={(value) => signupForm.setValue('role', value as 'entrepreneur' | 'investor')}
                  className="mt-2 grid grid-cols-2 gap-4"
                >
                  <Label className="flex cursor-pointer items-center justify-center rounded-md border-2 border-gray-300 p-4 has-[:checked]:border-primary has-[:checked]:bg-blue-50">
                    <RadioGroupItem value="entrepreneur" id="r1" className="sr-only" />
                    <span>Entrepreneur</span>
                  </Label>
                  <Label className="flex cursor-pointer items-center justify-center rounded-md border-2 border-gray-300 p-4 has-[:checked]:border-primary has-[:checked]:bg-blue-50">
                    <RadioGroupItem value="investor" id="r2" className="sr-only" />
                    <span>Investor</span>
                  </Label>
                </RadioGroup>
                {signupForm.formState.errors.role && (
                  <p className="text-sm text-red-500 mt-1">{signupForm.formState.errors.role.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full font-semibold" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : 'Create Account'}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <button onClick={() => setIsLogin(true)} className="font-semibold text-primary hover:underline">
                Sign In
              </button>
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthForm />
    </Suspense>
  );
}
