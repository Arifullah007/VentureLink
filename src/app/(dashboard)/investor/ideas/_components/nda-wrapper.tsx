'use client';
import { useState } from "react";
import { NdaModal } from "@/components/ui/nda-modal";
import type { Idea, Entrepreneur } from "@/lib/types";
import { UnlockButton } from "./unlock-button";

type EnrichedIdea = Idea & {
    entrepreneur: Entrepreneur | undefined;
};

interface NdaWrapperProps {
    idea: EnrichedIdea;
    userId?: string;
}

export function NdaModalWrapper({ idea, userId }: NdaWrapperProps) {
    const [isNdaOpen, setNdaOpen] = useState(false);

    const handleUnlock = () => {
        setNdaOpen(true);
    };

    const handleNdaAccept = async () => {
        setNdaOpen(false);
        // The optimistic update is now handled in the UnlockButton.
        // This just closes the modal. For demo purposes, we can alert the user.
        alert(`NDA Accepted! You can now view details for "${idea.title}". The page will refresh to show unlocked content.`);
        window.location.reload();
    }
    
    return (
        <>
            <UnlockButton ideaId={idea.id} onUnlock={handleUnlock} />
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
