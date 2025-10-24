'use client';
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Link from "next/link";
import { predefinedIdeas } from "@/lib/data";
import { signNdaAction } from "../_actions/nda";

export function UnlockButton({ ideaId, onUnlock }: { ideaId: string, onUnlock: () => void }) {
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

    const handleUnlock = async () => {
        // Call the server action
        await signNdaAction(ideaId);

        // Optimistically update the UI and localStorage
        localStorage.setItem(`nda_signed_${ideaId}`, 'true');
        setIsUnlocked(true);
        
        // This function is passed from the parent (NdaModalWrapper) to trigger the modal
        onUnlock();
    };

    if (isUnlocked) {
        return (
            <Link href={prototypeUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary">View Prototype</Button>
            </Link>
        );
    }
    
    return <Button onClick={handleUnlock}>Unlock Details</Button>;
}
