'use client';

import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { Skeleton } from './ui/skeleton';

type AuthGuardProps = {
  children: ReactNode;
  role: 'investor' | 'entrepreneur';
};

export function AuthGuard({ children, role }: AuthGuardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        router.replace(`/${role}/login`);
        return;
      }

      const userRole = session.user.user_metadata?.role;
      if (userRole !== role) {
        // If wrong role, sign them out and redirect to the correct login page
        await supabase.auth.signOut();
        router.replace(`/${role}/login`);
        return;
      }

      setIsLoading(false);
    };

    checkSession();
  }, [router, role]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
