import { type MatchInvestorToEntrepreneurOutput } from "@/ai/flows/match-investor-to-entrepreneur";
import { z } from "zod";

export const investorPreferencesSchema = z.object({
  investorSector: z.string().min(1, "Sector is required."),
  investmentRange: z.string().min(1, "Investment range is required."),
  expectedReturns: z.string().min(1, "Expected returns are required."),
});

export type InvestorPreferences = z.infer<typeof investorPreferencesSchema>;

// This is the shape of the data in the 'pitches' table.
export type Pitch = {
  id: string;
  pitch_title: string;
  anonymized_summary: string;
  sector: string;
  investment_required: string;
  estimated_returns: string;
  prototype_url: string;
  entrepreneur_id: string;
};

export type MatchResult = MatchInvestorToEntrepreneurOutput & {
  idea: Pitch; // Renamed from 'idea' to 'pitch' to be consistent
};
