"use server";

import { matchInvestorToEntrepreneur, type MatchInvestorToEntrepreneurOutput } from "@/ai/flows/match-investor-to-entrepreneur";
import { ideas, type Idea } from "@/lib/data";
import { z } from "zod";

export const investorPreferencesSchema = z.object({
  investorSector: z.string().min(1, "Sector is required."),
  investmentRange: z.string().min(1, "Investment range is required."),
  expectedReturns: z.string().min(1, "Expected returns are required."),
});

export type InvestorPreferences = z.infer<typeof investorPreferencesSchema>;

export type MatchResult = MatchInvestorToEntrepreneurOutput & {
  idea: Idea;
};

export async function getAiMatches(investorPrefs: InvestorPreferences): Promise<MatchResult[]> {
  try {
    const allIdeas: Idea[] = ideas;
    
    const matchPromises = allIdeas.map(async (idea) => {
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
        return { ...match, idea };
      } catch (error) {
        console.error(`Error matching idea ${idea.id}:`, error);
        // Return a default low-score match on error to not break the entire process
        return { 
          matchScore: 0,
          matchReason: "An error occurred while processing this match.",
          idea
        };
      }
    });

    const results = await Promise.all(matchPromises);
    
    // Sort by match score descending
    results.sort((a, b) => b.matchScore - a.matchScore);
    
    return results;

  } catch (error) {
    console.error("Failed to get AI matches:", error);
    throw new Error("An unexpected error occurred while finding matches. Please try again later.");
  }
}
