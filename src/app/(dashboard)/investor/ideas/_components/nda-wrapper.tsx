'use client';
import { useState } from "react";
import { NdaModal } from "@/components/ui/nda-modal";
import type { Idea, Entrepreneur } from "@/lib/types";

type EnrichedIdea = Idea & {
    entrepreneur: Entrepreneur | undefined;
};

interface NdaModalWrapperProps {
    idea: EnrichedIdea;
    userId?: string;
    children: React.ReactNode;
}

export function NdaModalWrapper({ idea, userId, children }: NdaModalWrapperProps) {
    const [isNdaOpen, setNdaOpen] = useState(false);

    const handleUnlockDetails = () => {
        setNdaOpen(true);
    };

    const handleNdaAccept = async () => {
        if (!userId) {
            alert("You must be logged in to accept an NDA.");
            return;
        }

        // In a real app, you would save this to the database
        // For example: await signNda(userId, idea.id);

        setNdaOpen(false);
        // This is a client-side only alert for demo purposes
        alert(`NDA Accepted! You can now view details for "${idea.title}". Please refresh the page if you don't see the changes.`);
        // Ideally, revalidate the path or trigger a state update to show unlocked content
        window.location.reload();
    }
    
    return (
        <>
            <div onClick={handleUnlockDetails}>
                {children}
            </div>
            {isNdaOpen && (
                <NdaModal
                    isOpen={isNdaOpen}
                    onClose={() => setNdaOpen(false)}
                    onAccept={handleNdaAccept}
                    ideaTitle={idea.title}
                    entrepreneurName={idea.entrepreneur?.name || 'the entrepreneur'}
                />
            )}
        </>
    )
}
