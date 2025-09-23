'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Watermark } from "@/components/watermark";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { NdaModal } from "@/components/ui/nda-modal";
import Link from "next/link";
import { ideas as predefinedIdeas, entrepreneurs as predefinedEntrepreneurs } from "@/lib/data";

type Idea = {
  id: string;
  idea_title: string;
  anonymized_summary: string;
  sector: string;
  investment_required: string;
  estimated_returns: string;
  prototype_url: string; 
  entrepreneur_id: string;
  profiles: { 
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
    const supabase = createClient();

    useEffect(() => {
        const fetchIdeas = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('ideas')
                .select(`
                    *,
                    profiles (
                        full_name,
                        avatar_url
                    )
                `);

            if (error) {
                console.error('Error fetching ideas:', error);
            }

            const allIdeas = (data || []).map(idea => ({
              ...idea,
              prototype_url: 'https://picsum.photos/seed/' + idea.id + '/400/250',
              profiles: Array.isArray(idea.profiles) ? idea.profiles[0] : idea.profiles
            })) as Idea[];
            
            setIdeas(allIdeas);
            setLoading(false);
        };

        fetchIdeas();
    }, [supabase]);

    const handleUnlockDetails = (idea: Idea) => {
        setSelectedIdea(idea);
        setNdaOpen(true);
    };

    const handleNdaAccept = () => {
        if (!selectedIdea) return;
        setNdaOpen(false);
        setUnlockedIdeas(prev => new Set(prev).add(selectedIdea.id));
        alert(`NDA Accepted! You have now unlocked the details for "${selectedIdea.idea_title}".`);
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
                          alt={`Prototype for ${idea.idea_title}`}
                          width={400}
                          height={250}
                          className="rounded-t-lg aspect-video w-full object-cover"
                        />
                     </Link>
                   ) : (
                    <Watermark text="VentureLink">
                      <Image
                        src={idea.prototype_url || 'https://picsum.photos/seed/placeholder/400/250'}
                        alt={`Prototype for ${idea.idea_title}`}
                        width={400}
                        height={250}
                        className="rounded-t-lg aspect-video w-full object-cover"
                      />
                    </Watermark>
                   )}
                </CardHeader>
                <CardContent className="p-4 flex-grow">
                  <Badge variant="secondary" className="mb-2">{idea.sector}</Badge>
                  <h3 className="text-lg font-bold">{idea.idea_title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-3 flex-grow">{idea.anonymized_summary}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex flex-col items-start gap-4">
                  <div className="flex justify-between w-full text-sm">
                      <div className="font-semibold text-muted-foreground">Investment: <span className="text-foreground">{idea.investment_required}</span></div>
                      <div className="font-semibold text-muted-foreground">Returns: <span className="text-foreground">{idea.estimated_returns}</span></div>
                  </div>
                  <div className="border-t pt-4 w-full">
                      <div className="flex justify-between items-center w-full">
                      <div className="flex items-center gap-2">
                          {idea.profiles ? (
                          <>
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{idea.profiles.full_name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">{idea.profiles.full_name}</span>
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
                           <Link href={idea.prototype_url || '#'} target="_blank" rel="noopener noreferrer">View Prototype</Link>
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
            ideaTitle={selectedIdea.idea_title}
            entrepreneurName={selectedIdea.profiles?.full_name || 'the entrepreneur'}
        />
      )}
    </div>
  );
}
