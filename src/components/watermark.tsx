import React from 'react';
import { cn } from '@/lib/utils';

interface WatermarkProps {
  children: React.ReactNode;
  text: string;
  className?: string;
}

export function Watermark({ children, text, className }: WatermarkProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
        <span className="text-white/50 text-3xl md:text-5xl font-bold -rotate-12 select-none">
          {text}
        </span>
      </div>
    </div>
  );
}
