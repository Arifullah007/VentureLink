'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Send, Check } from "lucide-react";
import type { Investor } from "@/lib/types";

export function ApproachButton({ investor }: { investor: Investor }) {
    const { toast } = useToast();
    const [approached, setApproached] = useState<Set<string>>(new Set());

    useEffect(() => {
        // For demo purposes, we persist the "approached" state in localStorage
        const approachedInvestors = JSON.parse(localStorage.getItem('approachedInvestors') || '[]');
        setApproached(new Set(approachedInvestors));
    }, []);

    const handleApproach = (investor: Investor) => {
        toast({
          title: "Approach Initiated",
          description: `Your interest has been sent to ${investor.name}. You'll be notified if they accept.`,
        });
        const newApproached = new Set(approached).add(investor.id);
        setApproached(newApproached);
        localStorage.setItem('approachedInvestors', JSON.stringify(Array.from(newApproached)));
    };

    const isApproached = approached.has(investor.id);

    return (
        <Button 
          className="w-full" 
          onClick={() => handleApproach(investor)}
          disabled={isApproached}
        >
          {isApproached ? <Check className="mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />}
          {isApproached ? 'Approached' : 'Approach'}
        </Button>
    );
}
