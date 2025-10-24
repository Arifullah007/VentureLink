'use client';
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Link from "next/link";
import { predefinedIdeas } from "@/lib/data";

export function UnlockButton({ ideaId }: { ideaId: string }) {
    const [isUnlocked, setIsUnlocked] = useState(false);
    
    useEffect(() => {
        // In a real app, you'd check a database. Here we use localStorage for demo purposes.
        const unlocked = localStorage.getItem(`nda_signed_${ideaId}`);
        if (unlocked) {
            setIsUnlocked(true);
        }
    }, [ideaId]);
    
    // Find the prototype URL from the mock data
    const idea = predefinedIdeas.find(i => i.id === ideaId);
    const prototypeUrl = idea?.prototypeImageUrl || '#';

    if (isUnlocked) {
        return (
            <Link href={prototypeUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary">View Prototype</Button>
            </Link>
        );
    }
    
    return <Button>Unlock Details</Button>;
}
