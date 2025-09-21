'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { Watermark } from "@/components/watermark";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { NdaModal } from "@/components/ui/nda-modal";

type Idea = {
  id: string;
  title: string;
  summary: string;
  field: string;
  required_investment: string;
  estimated_returns: string;
  prototype_url: string;
  entrepreneur_id: string;
  users: {
      avatar_url: string;
      full_name: string;
  } | null
};


export default function BrowseIdeasPage() {
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
    const [isNdaOpen, setNdaOpen] = useState(false);

    useEffect(() => {
        const fetchIdeas = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data, error } = await supabase
                    .from('ideas')
                    .select(`
                        *,
                        users (
                            full_name,
                            avatar_url
                        )
                    `);

                if (error) {
                    console.error('Error fetching ideas:', error);
                } else {
                    setIdeas(data as Idea[]);
                }
            }
            setLoading(false);
        };

        fetchIdeas();
    }, []);

    const handleUnlockDetails = (idea: Idea) => {
        // In a real app, you'd check for subscription status here.
        // For now, we'll assume they are subscribed and show the NDA.
        setSelectedIdea(idea);
        setNdaOpen(true);
    };

    const handleNdaAccept = () => {
        setNdaOpen(false);
        // Here you would navigate to the full details page, or reveal more info.
        // For this example, we'll just log it.
        console.log("NDA accepted for idea:", selectedIdea?.title);
        alert(`NDA Accepted! You can now view the full details for "${selectedIdea?.title}".`);
        setSelectedIdea(null);
    }


  return (
    <div className="space-y-6 pb-24">
      <Card>
        <CardHeader>
          <CardTitle>Browse Ideas</CardTitle>
          <CardDescription>Discover the next big thing. Subscribe to unlock full details and connect with entrepreneurs.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="flex flex-col overflow-hidden">
                    <CardHeader>
                        <Skeleton className="h-40 w-full rounded-lg" />
                    </CardHeader>
                    <CardContent className="flex-grow space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-12 w-full" />
                    </CardContent>
                    <CardFooter className="flex flex-col items-start gap-4 pt-4">
                        <div className="flex justify-between w-full">
                           <Skeleton className="h-5 w-1/3" />
                           <Skeleton className="h-5 w-1/4" />
                        </div>
                        <div className="w-full h-px bg-border"></div>
                        <div className="flex justify-between items-center w-full">
                           <Skeleton className="h-8 w-1/2" />
                           <Skeleton className="h-10 w-1/3" />
                        </div>
                    </CardFooter>
                </Card>
            ))
        ) : ideas.map((idea) => {
          return (
            <Card key={idea.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="p-0">
                <div className="relative">
                  <Watermark text="VentureLink">
                    <Image
                      src={idea.prototype_url || 'https://picsum.photos/seed/placeholder/400/250'}
                      alt={`Prototype for ${idea.title}`}
                      width={400}
                      height={250}
                      className="rounded-t-lg aspect-video w-full object-cover"
                    />
                  </Watermark>
                </div>
              </CardHeader>
              <CardContent className="flex-grow p-4">
                <Badge variant="secondary" className="mb-2">{idea.field}</Badge>
                <h3 className="text-lg font-bold">{idea.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-3 h-16">{idea.summary}</p>
                 <div className="flex justify-between w-full text-sm mt-4">
                  <div className="font-semibold text-muted-foreground">Investment: <span className="text-foreground">{idea.required_investment}</span></div>
                  <div className="font-semibold text-muted-foreground">Returns: <span className="text-foreground">{idea.estimated_returns}</span></div>
                </div>
              </CardContent>
              <CardFooter className="p-4 border-t">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-2">
                    {idea.users ? (
                      <>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={idea.users.avatar_url} alt={idea.users.full_name} />
                          <AvatarFallback>{idea.users.full_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{idea.users.full_name}</span>
                      </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    )}
                  </div>
                  <Button onClick={() => handleUnlockDetails(idea)}>
                    Unlock Details
                  </Button>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      {!loading && ideas.length === 0 && (
        <Card>
            <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No ideas have been submitted yet. Be the first to know when a new idea is posted!</p>
            </CardContent>
        </Card>
      )}
      
       {selectedIdea && (
        <NdaModal
            isOpen={isNdaOpen}
            onClose={() => setNdaOpen(false)}
            onAccept={handleNdaAccept}
            ideaTitle={selectedIdea.title}
            entrepreneurName={selectedIdea.users?.full_name || 'the entrepreneur'}
        />
      )}

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <button className="bg-destructive text-destructive-foreground font-bold py-2 px-4 rounded-md shadow-lg flex items-center gap-2">
              <span>N</span>
              <span>Next</span>
              <span>&times;</span>
          </button>
      </div>
    </div>
  );
}
