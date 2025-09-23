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
import { LogOut, Plus, Settings, User } from 'lucide-react';
import { Logo } from '@/components/icons';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

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

  const handleLogout = async () => {
    router.push('/login');
  }

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
             <div className="ml-auto flex-1 sm:flex-initial">
                <Button asChild>
                    <Link href="/entrepreneur/ideas/new">
                        <Plus className="mr-2 h-4 w-4" /> New Idea
                    </Link>
                </Button>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>E</AvatarFallback>
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
