'use client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "./scroll-area";
import { Label } from "./label";
import { Input } from "./input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface NdaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  ideaTitle: string;
  entrepreneurName: string;
}

export function NdaModal({ isOpen, onClose, onAccept, ideaTitle, entrepreneurName }: NdaModalProps) {
  const [signature, setSignature] = useState('');
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleAccept = () => {
    if (signature.trim() === '') {
        toast({
            title: "Signature Required",
            description: "Please type your full name to sign the NDA.",
            variant: "destructive",
        });
        return;
    }
    onAccept();
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Confidentiality Agreement (NDA)</AlertDialogTitle>
          <AlertDialogDescription>
            To proceed, you must agree to the terms of this Non-Disclosure Agreement regarding the idea &quot;{ideaTitle}&quot; by {entrepreneurName}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <ScrollArea className="h-60 w-full rounded-md border p-4 text-sm">
            <div className="prose prose-sm dark:prose-invert max-w-none">
                <h4 className="font-bold">1. Confidential Information</h4>
                <p>
                    You agree that all information disclosed to you regarding the business idea &quot;{ideaTitle}&quot;, including but not limited to prototypes, business plans, financial data, and strategies (&quot;Confidential Information&quot;), is the proprietary property of the entrepreneur. This is a non-refundable transaction.
                </p>

                <h4 className="font-bold">2. Non-Disclosure</h4>
                <p>
                    You agree not to disclose, publish, or disseminate the Confidential Information to any third party without the prior written consent of {entrepreneurName}. You shall use the same degree of care to protect this information as you use to protect your own confidential information, but in no event less than a reasonable degree of care. All communications on this platform may be monitored by an AI bot to prevent the unauthorized sharing of contact information.
                </p>

                <h4 className="font-bold">3. Non-Use & Access Logging</h4>
                <p>
                    You agree not to use the Confidential Information for any purpose other than to evaluate the potential for a business relationship or investment with the entrepreneur. You shall not use the Confidential Information to develop a competing product or idea. Your access to the watermarked prototype, including the time, day, and date, will be logged in our database for security purposes.
                </p>

                <h4 className="font-bold">4. Idea Theft & Helpdesk</h4>
                <p>
                    In any case of suspected idea theft or breach of this agreement, the entrepreneur has the right to reach out to the VentureLink helpdesk for a formal investigation.
                </p>

                <h4 className="font-bold">5. Digital Signature & Agreement</h4>
                <p>
                    By typing your full name in the box below and clicking &quot;I Agree & Sign&quot;, you acknowledge that you have read, understood, and voluntarily agree to be legally bound by all VentureLink Privacy Policies and the terms of this Non-Disclosure Agreement. This action constitutes your binding electronic signature.
                </p>
            </div>
        </ScrollArea>
        <div className="space-y-2">
            <Label htmlFor="signature">Digital Signature</Label>
            <Input 
                id="signature" 
                placeholder="Type your full name" 
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
            />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleAccept}>I Agree & Sign</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
