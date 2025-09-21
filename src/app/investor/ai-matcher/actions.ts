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
          entrepreneurIdeaSummary: idea.summary,
          entrepreneurField: idea.field,
          requiredInvestment: idea.required_investment,
          estimatedGuaranteedReturns: idea.estimated_returns,
        };
        const match = await matchInvestorToEntrepreneur(input);
        
        // Construct a serializable idea object. We are assuming the 'idea' has serializable fields.
        const serializableIdea: Idea = {
            id: idea.id,
            title: idea.title,
            summary: idea.summary,
            field: idea.field,
            required_investment: idea.required_investment,
            estimated_returns: idea.estimated_returns,
            prototype_url: idea.prototype_url,
            entrepreneur_id: idea.entrepreneur_id,
        };

        return { ...match, idea: serializableIdea };
      } catch (error) {
        console.error(`Error matching idea ${idea.id}:`, error);
        return { 
          matchScore: 0,
          matchReason: "An error occurred while processing this match.",
          idea: idea as Idea
        };
      }
    });

    const results = await Promise.all(matchPromises);
    
    results.sort((a, b) => b.matchScore - a.matchScore);
    
    return results;

  } catch (error) {
    console.error("Failed to get AI matches:", error);
    throw new Error("An unexpected error occurred while finding matches. Please try again later.");
  }
}
