'use client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { Bell, LogOut, Plus, Settings, User } from 'lucide-react';
import { Logo } from '@/components/icons';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/entrepreneur/dashboard', label: 'Dashboard' },
  { href: '/entrepreneur/investors', label: 'Browse Investors' },
  { href: '/entrepreneur/collaborate', label: 'Combine & Grow' },
];

export default function EntrepreneurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [userName, setUserName] = useState<string | null>('E');
  const [hasNotifications, setHasNotifications] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  }

  useEffect(() => {
    const fetchUser = async () => {
        const { data: { user }} = await supabase.auth.getUser();
        if (user) {
            setUserName(user.user_metadata.full_name || user.email);
        }
    }
    fetchUser();
    
    const timer = setTimeout(() => {
        setHasNotifications(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [supabase.auth]);

  return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
          <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
            <Link
              href="/entrepreneur/dashboard"
              className="flex items-center gap-2 text-lg font-semibold md:text-base"
            >
              <Logo className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">VentureLink</span>
            </Link>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'transition-colors hover:text-foreground',
                  pathname === item.href ? 'text-foreground font-semibold' : 'text-muted-foreground'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
             <div className="ml-auto flex items-center gap-4">
                <Button asChild>
                    <Link href="/entrepreneur/ideas/new">
                        <Plus className="mr-2 h-4 w-4" /> New Idea
                    </Link>
                </Button>
                <Button variant="ghost" size="icon" className="relative rounded-full">
                    <Bell className="h-5 w-5" />
                    {hasNotifications && (
                        <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                    )}
                </Button>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{userName?.charAt(0)?.toUpperCase() || 'E'}</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="#"><User className="mr-2 h-4 w-4" />Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                   <Link href="#"><Settings className="mr-2 h-4 w-4" />Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                   <LogOut className="mr-2 h-4 w-4" />
                   <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          {children}
        </main>
      </div>
  );
}
