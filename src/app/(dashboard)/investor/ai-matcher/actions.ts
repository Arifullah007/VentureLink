"use server";

import { matchInvestorToEntrepreneur } from "@/ai/flows/match-investor-to-entrepreneur";
import { supabase } from "@/lib/supabase";
import type { MatchResult, InvestorPreferences, Idea } from './types';


export async function getAiMatches(investorPrefs: InvestorPreferences): Promise<MatchResult[]> {
  try {
    const { data: allIdeas, error } = await supabase.from('ideas').select('*');

    if (error) throw error;
    
    const matchPromises = (allIdeas as Idea[]).map(async (idea) => {
      try {
        const input = {
          investorSector: investorPrefs.investorSector,
          investmentRange: investorPrefs.investmentRange,
          expectedReturns: investorPrefs.expectedReturns,
          entrepreneurIdeaSummary: idea.anonymized_summary,
          entrepreneurField: idea.sector,
          requiredInvestment: idea.investment_required,
          estimatedGuaranteedReturns: idea.estimated_returns,
        };
        const match = await matchInvestorToEntrepreneur(input);
        
        const serializableIdea: Idea = {
            id: idea.id,
            idea_title: idea.idea_title,
            anonymized_summary: idea.anonymized_summary,
            sector: idea.sector,
            investment_required: idea.investment_required,
            estimated_returns: idea.estimated_returns,
            prototype_url: 'https://picsum.photos/seed/' + idea.id + '/600/400',
            entrepreneur_id: idea.entrepreneur_id,
        };

        return { ...match, idea: serializableIdea };
      } catch (error) {
        console.error(`Error matching idea ${idea.id}:`, error);
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
