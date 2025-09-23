'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
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
    // This function checks the session and the user's role.
    const checkSession = async (session: Session | null) => {
      const targetLoginPage = `/${role}/login`;

      // If no session is found, redirect to login.
      if (!session) {
        router.replace(targetLoginPage);
        return;
      }

      // If a session exists, verify the user's role.
      const userRole = session.user.user_metadata?.role;
      if (userRole === role) {
        // Role is correct, stop loading and show the page.
        setIsLoading(false);
      } else {
        // Role is incorrect, sign the user out and redirect.
        await supabase.auth.signOut();
        router.replace(targetLoginPage);
      }
    };

    // 1. Immediately check for the current session when the component mounts.
    supabase.auth.getSession().then(({ data: { session } }) => {
       checkSession(session);
    });

    // 2. Set up a listener for any future authentication state changes.
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Re-check the session on events like SIGNED_IN or SIGNED_OUT.
        checkSession(session);
      }
    );

    // Cleanup the listener when the component unmounts.
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
