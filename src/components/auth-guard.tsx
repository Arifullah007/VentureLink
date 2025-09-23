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
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const targetLoginPage = `/${role}/login`;
        
        // If there's no session, or if the event is SIGNED_OUT, redirect to login.
        if (!session || event === 'SIGNED_OUT') {
          setIsLoading(false);
          router.replace(targetLoginPage);
          return;
        }

        // Session exists, now check the role.
        const userRole = session.user.user_metadata?.role;
        if (userRole === role) {
          // Role is correct, allow access.
          setIsLoading(false);
        } else {
          // Wrong role, sign them out and redirect.
          supabase.auth.signOut().then(() => {
            router.replace(targetLoginPage);
          });
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
