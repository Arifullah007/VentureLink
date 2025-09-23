'use client';
import { LogOut } from "lucide-react";
import { SidebarMenuButton } from "./ui/sidebar";
import { createClient } from '@/lib/supabase/client';
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export function LogoutButton({ isDropdown }: { isDropdown?: boolean }) {
    const router = useRouter();
    const { toast } = useToast();
    const supabase = createClient();

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            toast({
                title: "Logout Failed",
                description: error.message,
                variant: "destructive"
            });
        } else {
            toast({
                title: "Logged Out",
                description: "You have been successfully logged out."
            });
            router.push('/');
            router.refresh();
        }
    };
    
    if (isDropdown) {
        return (
             <button onClick={handleLogout} className="flex items-center w-full">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
            </button>
        )
    }

    return (
        <SidebarMenuButton onClick={handleLogout}>
            <LogOut />
            <span>Logout</span>
        </SidebarMenuButton>
    )
}
