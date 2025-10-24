'use server';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Watermark } from "@/components/watermark";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NdaModalWrapper } from "./_components/nda-wrapper";
import Link from "next/link";
import { ideas as predefinedIdeas, entrepreneurs as predefinedEntrepreneurs } from "@/lib/data";
import type { Idea as IdeaType, Entrepreneur } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

type EnrichedIdea = IdeaType & {
  entrepreneur: Entrepreneur | undefined;
};

async function getEnrichedIdeas() {
    const allIdeas = predefinedIdeas.map(idea => ({
        ...idea,
        entrepreneur: predefinedEntrepreneurs.find(e => e.id === idea.entrepreneurId),
    }));
    return allIdeas;
}

export default async function BrowseIdeasPage() {
    const ideas: EnrichedIdea[] = await getEnrichedIdeas();
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="space-y-6 pb-24">
      <Card>
        <CardHeader>
          <CardTitle>Browse Ideas</CardTitle>
          <CardDescription>Discover the next big thing. Sign the NDA to unlock full details and view the original prototype.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ideas.map((idea) => {
          return (
            <Card key={idea.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="p-0">
                    <Watermark text="VentureLink">
                      <Image
                        src={idea.prototypeImageUrl || 'https://picsum.photos/seed/placeholder/400/250'}
                        alt={`Prototype for ${idea.title}`}
                        width={400}
                        height={250}
                        className="rounded-t-lg aspect-video w-full object-cover"
                      />
                    </Watermark>
                </CardHeader>
                <CardContent className="p-4 flex-grow">
                  <Badge variant="secondary" className="mb-2">{idea.field}</Badge>
                  <h3 className="text-lg font-bold">{idea.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-3 flex-grow">{idea.summary}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex flex-col items-start gap-4">
                  <div className="flex justify-between w-full text-sm">
                      <div className="font-semibold text-muted-foreground">Investment: <span className="text-foreground">{idea.requiredInvestment}</span></div>
                      <div className="font-semibold text-muted-foreground">Returns: <span className="text-foreground">{idea.estimatedGuaranteedReturns}</span></div>
                  </div>
                  <div className="border-t pt-4 w-full">
                      <div className="flex justify-between items-center w-full">
                      <div className="flex items-center gap-2">
                          {idea.entrepreneur ? (
                          <>
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{idea.entrepreneur.name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">{idea.entrepreneur.name}</span>
                          </>
                          ) : (
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-muted" />
                                <div className="h-4 w-24 bg-muted rounded-md" />
                            </div>
                          )}
                      </div>
                        <NdaModalWrapper idea={idea} userId={user?.id} />
                      </div>
                  </div>
                </CardFooter>
            </Card>
          );
        })}
      </div>
      
      {ideas.length === 0 && (
        <Card>
            <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No ideas have been submitted yet. Check back soon!</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
