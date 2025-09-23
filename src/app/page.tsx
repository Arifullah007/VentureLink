'use client';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bot, Shield, Layers, Handshake, Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/icons';
import { useEffect, useState, useRef } from 'react';

const homeFeatures = [
  {
    icon: <Bot className="h-8 w-8 text-white" />,
    title: 'AI-Powered Matching',
    description: 'Our intelligent algorithm matches investors with entrepreneurs based on industry, investment size, and expected returns.',
  },
  {
    icon: <Shield className="h-8 w-8 text-white" />,
    title: 'Secure Idea Sharing',
    description: 'Entrepreneurs can share watermarked prototypes and partial summaries before revealing full details to interested investors.',
  },
  {
    icon: <Layers className="h-8 w-8 text-white" />,
    title: 'Tiered Subscriptions',
    description: 'Investors can choose from multiple subscription tiers based on their investment capacity and risk appetite.',
  },
  {
    icon: <Handshake className="h-8 w-8 text-white" />,
    title: 'Collaboration Features',
    description: 'Combine Invest and Combine Grow features allow multiple parties to collaborate on single ideas.',
  },
];

export default function Home() {
  const [year, setYear] = useState<number | null>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const howItWorksRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const handleScrollClick = (ref: React.RefObject<HTMLElement>) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <header className="sticky top-0 z-50 bg-white shadow-sm text-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-wider">VentureLink</h1>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm">
                <Link href="/" className="font-semibold text-primary underline-offset-4 hover:underline">Home</Link>
                <Link href="#features" onClick={handleScrollClick(featuresRef)} className="text-muted-foreground hover:text-primary">Features</Link>
                <Link href="#how-it-works" onClick={handleScrollClick(howItWorksRef)} className="text-muted-foreground hover:text-primary">How It Works</Link>
            </nav>
            <div className="flex items-center gap-2">
            <Button asChild>
                <Link href="/login">Entrepreneur Login</Link>
            </Button>
            <Button variant="secondary" asChild>
                <Link href="/login?role=investor">Investor Login</Link>
            </Button>
            </div>
        </div>
      </header>
      <main className="flex-grow">
        <section className="relative flex items-center justify-center h-[calc(100vh-80px)] bg-gradient-to-r from-blue-500 to-green-400 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              Connect. Invest. Grow.
              <br />
              <span className="text-white/90">With VentureLink</span>
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-white/80">
              The premier platform connecting visionary entrepreneurs with strategic investors to bring innovative ideas to life.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" asChild className="bg-white text-primary hover:bg-gray-200 font-semibold">
                <Link href="/login">I'm an Entrepreneur</Link>
              </Button>
              <Button size="lg" variant="secondary" asChild className="bg-transparent border-2 border-white hover:bg-white/10 text-white font-semibold">
                <Link href="/login?role=investor">I'm an Investor</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" ref={featuresRef} className="py-20 md:py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
             <div className="text-center mb-12">
              <p className="text-sm font-bold uppercase text-primary tracking-wider">Features</p>
              <h3 className="text-3xl md:text-4xl font-bold tracking-tight mt-2">A better way to connect</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-10 max-w-4xl mx-auto">
              {homeFeatures.map((feature) => (
                <div key={feature.title} className="flex items-start gap-4">
                    <div className="bg-primary/20 p-4 rounded-lg flex-shrink-0">
                      <div className="bg-primary p-2 rounded-md">
                        {feature.icon}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold">{feature.title}</h4>
                      <p className="mt-1 text-muted-foreground">{feature.description}</p>
                    </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" ref={howItWorksRef} className="py-20 md:py-24 bg-muted/40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-bold tracking-tight">How It Works</h3>
              <p className="mt-2 text-lg text-muted-foreground">A simple, streamlined process for funding and innovation.</p>
            </div>
            <div className="relative grid gap-8 md:grid-cols-3">
               <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 hidden md:block"></div>
               <div className="relative flex flex-col items-center text-center p-4">
                   <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold z-10 mb-4 ring-8 ring-background">1</div>
                   <h4 className="mt-4 text-xl font-semibold">Submit Your Idea</h4>
                   <p className="mt-2 text-muted-foreground">Entrepreneurs securely submit their business plans and prototypes.</p>
               </div>
               <div className="relative flex flex-col items-center text-center p-4">
                   <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold z-10 mb-4 ring-8 ring-background">2</div>
                   <h4 className="mt-4 text-xl font-semibold">Discover & Match</h4>
                   <p className="mt-2 text-muted-foreground">Investors browse opportunities or use our AI to find the perfect match.</p>
               </div>
               <div className="relative flex flex-col items-center text-center p-4">
                   <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold z-10 mb-4 ring-8 ring-background">3</div>
                   <h4 className="mt-4 text-xl font-semibold">Connect & Invest</h4>
                   <p className="mt-2 text-muted-foreground">Subscribe to unlock details, connect directly, and fuel the next big thing.</p>
               </div>
            </div>
          </div>
        </section>

      </main>
      <footer className="bg-[#242933] text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h5 className="font-bold uppercase text-gray-400">Company</h5>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-300 hover:text-white">About</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white">Careers</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h5 className="font-bold uppercase text-gray-400">Legal</h5>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-300 hover:text-white">Privacy</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white">Terms</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white">Cookie Policy</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h5 className="font-bold uppercase text-gray-400">Resources</h5>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-300 hover:text-white">Blog</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white">Guides</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white">Help Center</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h5 className="font-bold uppercase text-gray-400">Connect</h5>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-300 hover:text-white">Twitter</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white">LinkedIn</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white">Instagram</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">&copy; {year || new Date().getFullYear()} Venture Link. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link href="#" className="text-gray-400 hover:text-white"><Twitter className="h-5 w-5" /></Link>
              <Link href="#" className="text-gray-400 hover:text-white"><Facebook className="h-5 w-5" /></Link>
              <Link href="#" className="text-gray-400 hover:text-white"><Instagram className="h-5 w-5" /></Link>
              <Link href="#" className="text-gray-400 hover:text-white"><Linkedin className="h-5 w-5" /></Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
