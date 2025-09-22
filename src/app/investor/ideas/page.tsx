'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Watermark } from "@/components/watermark";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { NdaModal } from "@/components/ui/nda-modal";
import Link from "next/link";
import { ideas as predefinedIdeas, entrepreneurs as predefinedEntrepreneurs } from "@/lib/data";

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
      avatar_url: string | null;
      full_name: string | null;
  } | null
};


export default function BrowseIdeasPage() {
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
    const [isNdaOpen, setNdaOpen] = useState(false);
    const [unlockedIdeas, setUnlockedIdeas] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchIdeas = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('ideas')
                .select(`
                    *,
                    users (
                        full_name,
                        avatar_url
                    )
                `);

            let allIdeas: Idea[] = [];

            if (error) {
                console.error('Error fetching ideas:', error);
            } else if (data) {
                const liveIdeas = data.map(idea => ({
                    ...idea,
                    users: Array.isArray(idea.users) ? idea.users[0] : idea.users
                })) as Idea[];
                allIdeas = [...allIdeas, ...liveIdeas];
            }

            // Map predefined ideas to the Idea type and add entrepreneur info
            const mappedPredefinedIdeas = predefinedIdeas.map(idea => {
                const entrepreneur = predefinedEntrepreneurs.find(e => e.id === idea.entrepreneurId);
                return {
                    id: idea.id,
                    title: idea.title,
                    summary: idea.summary,
                    field: idea.field,
                    required_investment: idea.requiredInvestment,
                    estimated_returns: idea.estimatedGuaranteedReturns,
                    prototype_url: idea.prototypeImageUrl,
                    entrepreneur_id: idea.entrepreneurId,
                    users: entrepreneur ? { full_name: entrepreneur.name, avatar_url: entrepreneur.avatarUrl } : null
                };
            });
            
            allIdeas = [...mappedPredefinedIdeas, ...allIdeas];


            setIdeas(allIdeas);
            setLoading(false);
        };

        fetchIdeas();
    }, []);

    const handleUnlockDetails = (idea: Idea) => {
        setSelectedIdea(idea);
        setNdaOpen(true);
    };

    const handleNdaAccept = () => {
        if (!selectedIdea) return;
        setNdaOpen(false);
        console.log("NDA accepted for idea:", selectedIdea.title);
        // In a real app, you would record the NDA acceptance in your database.
        // For now, we'll just show an alert, log it, and update the UI state.
        
        setUnlockedIdeas(prev => new Set(prev).add(selectedIdea.id));

        alert(`NDA Accepted! You have now unlocked the details for "${selectedIdea.title}".`);
        setSelectedIdea(null);
    }


  return (
    <div className="space-y-6 pb-24">
      <Card>
        <CardHeader>
          <CardTitle>Browse Ideas</CardTitle>
          <CardDescription>Discover the next big thing. Sign the NDA to unlock full details and view the original prototype.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="flex flex-col overflow-hidden">
                    <CardHeader className="p-0">
                        <Skeleton className="h-48 w-full" />
                    </CardHeader>
                    <CardContent className="flex-grow p-4 space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-12 w-full" />
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                       <div className="flex justify-between items-center w-full">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-4 w-24" />
                           </div>
                           <Skeleton className="h-10 w-1/3" />
                        </div>
                    </CardFooter>
                </Card>
            ))
        ) : ideas.map((idea) => {
          const isUnlocked = unlockedIdeas.has(idea.id);
          return (
            <Card key={idea.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="p-0">
                   {isUnlocked ? (
                     <Link href={idea.prototype_url || '#'} target="_blank" rel="noopener noreferrer">
                       <Image
                          src={idea.prototype_url || 'https://picsum.photos/seed/placeholder/400/250'}
                          alt={`Prototype for ${idea.title}`}
                          width={400}
                          height={250}
                          className="rounded-t-lg aspect-video w-full object-cover"
                        />
                     </Link>
                   ) : (
                    <Watermark text="VentureLink">
                      <Image
                        src={idea.prototype_url || 'https://picsum.photos/seed/placeholder/400/250'}
                        alt={`Prototype for ${idea.title}`}
                        width={400}
                        height={250}
                        className="rounded-t-lg aspect-video w-full object-cover"
                      />
                    </Watermark>
                   )}
                </CardHeader>
                <CardContent className="p-4 flex-grow">
                  <Badge variant="secondary" className="mb-2">{idea.field}</Badge>
                  <h3 className="text-lg font-bold">{idea.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-3 flex-grow">{idea.summary}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex flex-col items-start gap-4">
                  <div className="flex justify-between w-full text-sm">
                      <div className="font-semibold text-muted-foreground">Investment: <span className="text-foreground">{idea.required_investment}</span></div>
                      <div className="font-semibold text-muted-foreground">Returns: <span className="text-foreground">{idea.estimated_returns}</span></div>
                  </div>
                  <div className="border-t pt-4 w-full">
                      <div className="flex justify-between items-center w-full">
                      <div className="flex items-center gap-2">
                          {idea.users ? (
                          <>
                              <Avatar className="h-8 w-8">
                              <AvatarImage src={idea.users.avatar_url || undefined} alt={idea.users.full_name || ''} />
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
                       {isUnlocked ? (
                         <Button asChild variant="secondary">
                           <Link href={idea.prototype_url || '#'} target="_blank" rel="noopener noreferrer">View Details</Link>
                         </Button>
                       ) : (
                         <Button onClick={() => handleUnlockDetails(idea)}>
                            Unlock Details
                         </Button>
                       )}
                      </div>
                  </div>
                </CardFooter>
            </Card>
          );
        })}
      </div>
      {!loading && ideas.length === 0 && (
        <Card>
            <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No ideas have been submitted yet. Check back soon!</p>
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
    </div>
  );
}
