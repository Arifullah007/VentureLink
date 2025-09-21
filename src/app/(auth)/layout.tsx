import { Logo } from '@/components/icons';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
       <header className="container z-40 bg-background">
        <div className="flex h-20 items-center justify-between py-6">
           <Link href="/" className="flex items-center gap-2">
              <Logo className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">VentureLink</span>
            </Link>
        </div>
      </header>
      <main className="flex-grow flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <div className="w-full max-w-md">
            {children}
        </div>
      </main>
    </div>
  );
}
