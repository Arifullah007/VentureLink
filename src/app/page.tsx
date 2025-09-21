'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Briefcase, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/icons';
import { useEffect, useState } from 'react';

const features = [
  {
    icon: <Lightbulb className="h-8 w-8 text-primary" />,
    title: 'For Entrepreneurs',
    description: 'Submit your groundbreaking ideas, connect with investors, and find the funding you need to grow.',
    link: '/entrepreneur/login',
    cta: 'Start Your Journey',
  },
  {
    icon: <Briefcase className="h-8 w-8 text-primary" />,
    title: 'For Investors',
    description: 'Discover promising startups, access a curated list of investment opportunities, and grow your portfolio.',
    link: '/investor/login',
    cta: 'Find Opportunities',
  },
];

export default function Home() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">VentureLink</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/entrepreneur/login">Entrepreneur Login</Link>
          </Button>
          <Button asChild>
            <Link href="/investor/login">Investor Login</Link>
          </Button>
        </div>
      </header>
      <main className="flex-grow">
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
              Connecting Visionaries with Capital
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
              VentureLink is the premier platform where innovative entrepreneurs and strategic investors forge the future of business.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/investor/login">I'm an Investor</Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/entrepreneur/login">I'm an Entrepreneur</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="bg-card py-20 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
             <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-bold tracking-tight">Built For You</h3>
              <p className="mt-2 text-lg text-muted-foreground">Whether you're an innovator or an investor, we have you covered.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-12">
              {features.map((feature) => (
                <Card key={feature.title} className="text-center shadow-lg hover:shadow-xl transition-shadow bg-background">
                  <CardContent className="p-8">
                     <div className="bg-primary/10 p-4 rounded-full inline-block mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-bold">{feature.title}</h3>
                    <p className="mt-2 text-muted-foreground">{feature.description}</p>
                    <Button variant="link" className="mt-4 text-primary font-semibold" asChild>
                      <Link href={feature.link}>
                        {feature.cta} <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24">
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
                   <h4 className="mt-4 text-xl font-semibold">Discover &amp; Match</h4>
                   <p className="mt-2 text-muted-foreground">Investors browse opportunities or use our AI to find the perfect match.</p>
               </div>
               <div className="relative flex flex-col items-center text-center p-4">
                   <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold z-10 mb-4 ring-8 ring-background">3</div>
                   <h4 className="mt-4 text-xl font-semibold">Connect &amp; Invest</h4>
                   <p className="mt-2 text-muted-foreground">Subscribe to unlock details, connect directly, and fuel the next big thing.</p>
               </div>
            </div>
          </div>
        </section>

      </main>
      <footer className="bg-card border-t">
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>&copy; {year || ''} VentureLink. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
