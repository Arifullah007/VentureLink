'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Watermark } from "@/components/watermark";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { NdaModal } from "@/components/ui/nda-modal";
import Link from "next/link";
import { ideas as predefinedIdeas, entrepreneurs as predefinedEntrepreneurs } from "@/lib/data";

type Pitch = {
  id: string;
  pitch_title: string;
  anonymized_summary: string;
  sector: string;
  investment_required: string;
  estimated_returns: string;
  prototype_url: string; // This needs to be resolved from pitch_files
  entrepreneur_id: string;
  profiles: { // Changed from users to profiles to match Supabase schema
      avatar_url: string | null;
      full_name: string | null;
  } | null
};


export default function BrowseIdeasPage() {
    const [pitches, setPitches] = useState<Pitch[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPitch, setSelectedPitch] = useState<Pitch | null>(null);
    const [isNdaOpen, setNdaOpen] = useState(false);
    const [unlockedPitches, setUnlockedPitches] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchPitches = async () => {
            setLoading(true);
            // Fetch pitches and related profile information
            const { data, error } = await supabase
                .from('pitches')
                .select(`
                    *,
                    profiles (
                        full_name,
                        avatar_url
                    )
                `);

            if (error) {
                console.error('Error fetching pitches:', error);
            }

            // In a real app, you'd also fetch the pitch_files to get the prototype_url.
            // For now, we'll use a placeholder.
            const allPitches = (data || []).map(pitch => ({
              ...pitch,
              pitch_title: pitch.pitch_title,
              anonymized_summary: pitch.anonymized_summary,
              sector: pitch.sector,
              investment_required: pitch.investment_required,
              estimated_returns: pitch.estimated_returns,
              // This is a placeholder. You'd fetch from `pitch_files` table.
              prototype_url: 'https://picsum.photos/seed/' + pitch.id + '/400/250',
              profiles: Array.isArray(pitch.profiles) ? pitch.profiles[0] : pitch.profiles
            })) as Pitch[];
            
            setPitches(allPitches);
            setLoading(false);
        };

        fetchPitches();
    }, []);

    const handleUnlockDetails = (pitch: Pitch) => {
        setSelectedPitch(pitch);
        setNdaOpen(true);
    };

    const handleNdaAccept = () => {
        if (!selectedPitch) return;
        setNdaOpen(false);
        // In a real app, you would record the NDA acceptance in your database.
        setUnlockedPitches(prev => new Set(prev).add(selectedPitch.id));
        alert(`NDA Accepted! You have now unlocked the details for "${selectedPitch.pitch_title}".`);
        setSelectedPitch(null);
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
        ) : pitches.map((pitch) => {
          const isUnlocked = unlockedPitches.has(pitch.id);
          return (
            <Card key={pitch.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="p-0">
                   {isUnlocked ? (
                     <Link href={pitch.prototype_url || '#'} target="_blank" rel="noopener noreferrer">
                       <Image
                          src={pitch.prototype_url || 'https://picsum.photos/seed/placeholder/400/250'}
                          alt={`Prototype for ${pitch.pitch_title}`}
                          width={400}
                          height={250}
                          className="rounded-t-lg aspect-video w-full object-cover"
                        />
                     </Link>
                   ) : (
                    <Watermark text="VentureLink">
                      <Image
                        src={pitch.prototype_url || 'https://picsum.photos/seed/placeholder/400/250'}
                        alt={`Prototype for ${pitch.pitch_title}`}
                        width={400}
                        height={250}
                        className="rounded-t-lg aspect-video w-full object-cover"
                      />
                    </Watermark>
                   )}
                </CardHeader>
                <CardContent className="p-4 flex-grow">
                  <Badge variant="secondary" className="mb-2">{pitch.sector}</Badge>
                  <h3 className="text-lg font-bold">{pitch.pitch_title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-3 flex-grow">{pitch.anonymized_summary}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex flex-col items-start gap-4">
                  <div className="flex justify-between w-full text-sm">
                      <div className="font-semibold text-muted-foreground">Investment: <span className="text-foreground">{pitch.investment_required}</span></div>
                      <div className="font-semibold text-muted-foreground">Returns: <span className="text-foreground">{pitch.estimated_returns}</span></div>
                  </div>
                  <div className="border-t pt-4 w-full">
                      <div className="flex justify-between items-center w-full">
                      <div className="flex items-center gap-2">
                          {pitch.profiles ? (
                          <>
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{pitch.profiles.full_name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">{pitch.profiles.full_name}</span>
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
                           <Link href={pitch.prototype_url || '#'} target="_blank" rel="noopener noreferrer">View Prototype</Link>
                         </Button>
                       ) : (
                         <Button onClick={() => handleUnlockDetails(pitch)}>
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
      {!loading && pitches.length === 0 && (
        <Card>
            <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No pitches have been submitted yet. Check back soon!</p>
            </CardContent>
        </Card>
      )}
      
       {selectedPitch && (
        <NdaModal
            isOpen={isNdaOpen}
            onClose={() => setNdaOpen(false)}
            onAccept={handleNdaAccept}
            ideaTitle={selectedPitch.pitch_title}
            entrepreneurName={selectedPitch.profiles?.full_name || 'the entrepreneur'}
        />
      )}
    </div>
  );
}
