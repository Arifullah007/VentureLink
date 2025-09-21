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

interface NdaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  ideaTitle: string;
  entrepreneurName: string;
}

export function NdaModal({ isOpen, onClose, onAccept, ideaTitle, entrepreneurName }: NdaModalProps) {
  if (!isOpen) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Confidentiality Agreement (NDA)</AlertDialogTitle>
          <AlertDialogDescription>
            To proceed, you must agree to the terms of this Non-Disclosure Agreement regarding the idea &quot;{ideaTitle}&quot; by {entrepreneurName}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <ScrollArea className="h-64 w-full rounded-md border p-4 text-sm">
            <p className="font-bold mb-2">1. Confidential Information</p>
            <p className="mb-4">
                You agree that all information disclosed to you regarding the business idea &quot;{ideaTitle}&quot;, including but not limited to prototypes, business plans, financial data, and strategies (&quot;Confidential Information&quot;), is the proprietary property of the entrepreneur.
            </p>

            <p className="font-bold mb-2">2. Non-Disclosure</p>
            <p className="mb-4">
                You agree not to disclose, publish, or disseminate the Confidential Information to any third party without the prior written consent of {entrepreneurName}. You shall use the same degree of care to protect this information as you use to protect your own confidential information, but in no event less than a reasonable degree of care.
            </p>

            <p className="font-bold mb-2">3. Non-Use</p>
            <p className="mb-4">
                You agree not to use the Confidential Information for any purpose other than to evaluate the potential for a business relationship or investment with the entrepreneur. You shall not use the Confidential Information to develop a competing product or idea, or to otherwise circumvent the entrepreneur.
            </p>

            <p className="font-bold mb-2">4. Term</p>
            <p className="mb-4">
                This agreement is effective upon your acceptance and remains in effect for a period of five (5) years.
            </p>

            <p className="font-bold mb-2">5. Agreement</p>
            <p>
                By clicking &quot;I Agree&quot;, you acknowledge that you have read, understood, and voluntarily agree to be legally bound by the terms of this Non-Disclosure Agreement. This action constitutes your electronic signature.
            </p>
        </ScrollArea>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onAccept}>I Agree</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
