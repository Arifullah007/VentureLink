'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { Skeleton } from './ui/skeleton';
import { Logo } from './icons';

type AuthGuardProps = {
  children: ReactNode;
  role: 'investor' | 'entrepreneur';
};

export function AuthGuard({ children, role }: AuthGuardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      let targetLoginPage = `/${role}/login`;

      if (error || !session) {
        router.replace(targetLoginPage);
        return;
      }

      const userRole = session.user.user_metadata?.role;
      if (userRole !== role) {
        // If wrong role, sign them out and redirect to the correct login page
        await supabase.auth.signOut();
        router.replace(targetLoginPage);
        return;
      }

      setIsLoading(false);
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          router.replace(`/${role}/login`);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };

  }, [router, role, supabase]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
            <Logo className="h-12 w-12 text-primary animate-pulse" />
            <div className="space-y-2 text-center">
                <p className="text-lg font-medium text-muted-foreground">Verifying your credentials...</p>
                <Skeleton className="h-4 w-48 mx-auto" />
            </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
