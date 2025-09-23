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
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { Home, Search, Bot, Crown, Handshake, LogOut, Bell, Settings, User } from 'lucide-react';
import { Logo } from '@/components/icons';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';

const navItems = [
    { href: "/investor/dashboard", icon: <Home />, label: "Dashboard" },
    { href: "/investor/ideas", icon: <Search />, label: "Browse Ideas" },
    { href: "/investor/ai-matcher", icon: <Bot />, label: "AI Matcher" },
    { href: "/investor/subscriptions", icon: <Crown />, label: "Subscriptions" },
    { href: "/investor/collaborate", icon: <Handshake />, label: "Combine Invest" },
];

export default function InvestorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [hasNotifications, setHasNotifications] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  }

  useEffect(() => {
    const fetchUserAndNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata.full_name || 'Investor');

        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_id', user.id)
          .eq('is_read', false);
        
        setHasNotifications((count || 0) > 0);
      }
    };
    fetchUserAndNotifications();

    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications' 
      }, (payload) => {
        // This is a simplified listener. In a real app, you'd check if the notification is for the current user.
        setHasNotifications(true);
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    }
  }, [supabase]);


  return (
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
               <Logo className="w-6 h-6 text-primary"/>
               <span className="text-lg font-semibold">VentureLink</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild>
                    <Link href={item.href}>
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-card px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1">
              <h1 className="font-semibold text-lg">Investor Dashboard</h1>
            </div>
             <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {hasNotifications && (
                    <span className="absolute top-1 right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                    </span>
                )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                     <AvatarFallback>{userName?.charAt(0) || 'I'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                  </div>
                </DropdownMenuLabel>
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
          </header>
          <main className="flex-1 p-4 sm:p-6 bg-background">
              {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
  );
}
