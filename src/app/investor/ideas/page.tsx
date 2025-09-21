import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ideas, entrepreneurs } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { Watermark } from "@/components/watermark";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function BrowseIdeasPage() {
  const getEntrepreneur = (id: string) => entrepreneurs.find(e => e.id === id);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Browse Ideas</CardTitle>
          <CardDescription>Discover the next big thing. Subscribe to unlock full details and connect with entrepreneurs.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ideas.map((idea) => {
          const entrepreneur = getEntrepreneur(idea.entrepreneurId);
          return (
            <Card key={idea.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="relative">
                  <Watermark text="VentureLink">
                    <Image
                      src={idea.prototypeImageUrl}
                      alt={`Prototype for ${idea.title}`}
                      width={400}
                      height={250}
                      className="rounded-lg aspect-video w-full object-cover"
                      data-ai-hint={idea.prototypeImageHint}
                    />
                  </Watermark>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <Badge variant="secondary" className="mb-2">{idea.field}</Badge>
                <h3 className="text-lg font-bold">{idea.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{idea.summary}</p>
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-4">
                <div className="flex justify-between w-full text-sm">
                  <div className="font-semibold text-muted-foreground">Investment: <span className="text-foreground">{idea.requiredInvestment}</span></div>
                  <div className="font-semibold text-muted-foreground">Returns: <span className="text-foreground">{idea.estimatedGuaranteedReturns}</span></div>
                </div>
                <div className="w-full h-px bg-border"></div>
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-2">
                    {entrepreneur && (
                      <>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={entrepreneur.avatarUrl} alt={entrepreneur.name} data-ai-hint={entrepreneur.dataAiHint} />
                          <AvatarFallback>{entrepreneur.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{entrepreneur.name}</span>
                      </>
                    )}
                  </div>
                  <Button asChild>
                    <Link href="/investor/subscriptions">Unlock Details</Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
