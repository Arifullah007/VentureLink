"use server";

import { matchInvestorToEntrepreneur } from "@/ai/flows/match-investor-to-entrepreneur";
import { supabase } from "@/lib/supabase";
import type { MatchResult, InvestorPreferences, Pitch } from './types';


export async function getAiMatches(investorPrefs: InvestorPreferences): Promise<MatchResult[]> {
  try {
    const { data: allPitches, error } = await supabase.from('pitches').select('*');

    if (error) throw error;
    
    const matchPromises = (allPitches as Pitch[]).map(async (pitch) => {
      try {
        const input = {
          investorSector: investorPrefs.investorSector,
          investmentRange: investorPrefs.investmentRange,
          expectedReturns: investorPrefs.expectedReturns,
          entrepreneurIdeaSummary: pitch.anonymized_summary,
          entrepreneurField: pitch.sector,
          requiredInvestment: pitch.investment_required,
          estimatedGuaranteedReturns: pitch.estimated_returns,
        };
        const match = await matchInvestorToEntrepreneur(input);
        
        // In a real app, prototype_url would come from the 'pitch_files' table.
        const serializablePitch: Pitch = {
            id: pitch.id,
            pitch_title: pitch.pitch_title,
            anonymized_summary: pitch.anonymized_summary,
            sector: pitch.sector,
            investment_required: pitch.investment_required,
            estimated_returns: pitch.estimated_returns,
            prototype_url: 'https://picsum.photos/seed/' + pitch.id + '/600/400',
            entrepreneur_id: pitch.entrepreneur_id,
        };

        return { ...match, idea: serializablePitch };
      } catch (error) {
        console.error(`Error matching pitch ${pitch.id}:`, error);
        return null;
      }
    });

    const results = (await Promise.all(matchPromises)).filter(Boolean) as MatchResult[];
    
    results.sort((a, b) => b.matchScore - a.matchScore);
    
    return results;

  } catch (error) {
    console.error("Failed to get AI matches:", error);
    throw new Error("An unexpected error occurred while finding matches. Please try again later.");
  }
}
