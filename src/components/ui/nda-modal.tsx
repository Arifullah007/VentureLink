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
import { Circle } from "lucide-react";

interface NdaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  ideaTitle: string;
  entrepreneurName: string;
}

const agreementPoints = [
    { id: 'confidential', label: 'Confidential Information', text: 'You agree that all information disclosed to you regarding the business idea "{ideaTitle}", including but not to prototypes, business plans, financial data, and strategies ("Confidential Information"), is the proprietary property of the entrepreneur. This is a non-refundable transaction.' },
    { id: 'nondisclosure', label: 'Non-Disclosure', text: 'You agree not to disclose, publish, or disseminate the Confidential Information to any third party without the prior written consent of {entrepreneurName}. You shall use the same degree of care to protect this information as you use to protect your own confidential information, but in no event less than a reasonable degree of care. All communications on this platform may be monitored by an AI bot to prevent the unauthorized sharing of contact information.' },
    { id: 'nonuse', label: 'Non-Use & Access Logging', text: 'You agree not to use the Confidential Information for any purpose other than to evaluate the potential for a business relationship or investment with the entrepreneur. You shall not use the Confidential Information to develop a competing product or idea. Your access to the watermarked prototype, including the time, day, and date, will be logged in our database for security purposes.' },
    { id: 'theft', label: 'Idea Theft & Helpdesk', text: 'In any case of suspected idea theft or breach of this agreement, the entrepreneur has the right to reach out to the VentureLink helpdesk for a formal investigation.' },
    { id: 'signature', label: 'Digital Signature & Agreement', text: 'By typing your full name in the box below and clicking "I Agree & Sign", you acknowledge that you have read, understood, and voluntarily agree to be legally bound by all VentureLink Privacy Policies and the terms of this Non-Disclosure Agreement. This action constitutes your binding electronic signature.' },
];

export function NdaModal({ isOpen, onClose, onAccept, ideaTitle, entrepreneurName }: NdaModalProps) {
  
  if (!isOpen) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Confidentiality & Terms of Service</AlertDialogTitle>
          <AlertDialogDescription>
            To proceed, you must agree to the following terms regarding the idea &quot;{ideaTitle}&quot; from {entrepreneurName}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <ScrollArea className="h-80 w-full rounded-md border p-4">
            <div className="space-y-6">
                {agreementPoints.map(point => (
                    <div key={point.id} className="flex items-start space-x-3">
                        <Circle className="h-2 w-2 mt-2 flex-shrink-0 fill-current" />
                        <div className="grid gap-1.5 leading-snug">
                             <Label htmlFor={point.id} className="font-bold text-base">{point.label}</Label>
                             <p className="text-sm text-muted-foreground">
                                {point.text.replace('{ideaTitle}', ideaTitle).replace('{entrepreneurName}', entrepreneurName)}
                             </p>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
