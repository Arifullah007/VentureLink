"use server";

import { matchInvestorToEntrepreneur } from "@/ai/flows/match-investor-to-entrepreneur";
import type { MatchResult, InvestorPreferences, Idea } from './types';
import { ideas as predefinedIdeas } from '@/lib/data';


export async function getAiMatches(investorPrefs: InvestorPreferences): Promise<MatchResult[]> {
  try {
    // Use predefined ideas instead of fetching from Supabase
    const allIdeas = predefinedIdeas;
    
    const matchPromises = (allIdeas as any[]).map(async (idea) => {
      try {
        const input = {
          investorSector: investorPrefs.investorSector,
          investmentRange: investorPrefs.investmentRange,
          expectedReturns: investorPrefs.expectedReturns,
          entrepreneurIdeaSummary: idea.summary,
          entrepreneurField: idea.field,
          requiredInvestment: idea.requiredInvestment,
          estimatedGuaranteedReturns: idea.estimatedGuaranteedReturns,
        };
        const match = await matchInvestorToEntrepreneur(input);
        
        const serializableIdea: Idea = {
            id: idea.id,
            idea_title: idea.title,
            anonymized_summary: idea.summary,
            sector: idea.field,
            investment_required: idea.requiredInvestment,
            estimated_returns: idea.estimatedGuaranteedReturns,
            prototype_url: idea.prototypeImageUrl || 'https://picsum.photos/seed/' + idea.id + '/600/400',
            entrepreneur_id: idea.entrepreneurId,
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
