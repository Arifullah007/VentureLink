'use server';

/**
 * @fileOverview Matches investors to entrepreneurs based on their stated investment preferences.
 *
 * @function matchInvestorToEntrepreneur -  Matches investors to entrepreneurs
 * @interface MatchInvestorToEntrepreneurInput - The input schema for the matchInvestorToEntrepreneur flow.
 * @interface MatchInvestorToEntrepreneurOutput - The output schema for the matchInvestorToEntrepreneur flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MatchInvestorToEntrepreneurInputSchema = z.object({
  investorSector: z.string().describe('The sector in which the investor is interested.'),
  investmentRange: z.string().describe('The investment range the investor is comfortable with (e.g., 70K-5L, 5L-25L, 26L-1CR).'),
  expectedReturns: z.string().describe('The expected returns the investor is looking for (e.g., Less, Medium, High).'),
  entrepreneurIdeaSummary: z.string().describe('A summary of the entrepreneur\'s idea.'),
  entrepreneurField: z.string().describe('The field to which the entrepreneur idea is related.'),
  requiredInvestment: z.string().describe('The required investment for the entrepreneur\'s idea.'),
  estimatedGuaranteedReturns: z.string().describe('The estimated guaranteed returns for the entrepreneur\'s idea.'),
});
export type MatchInvestorToEntrepreneurInput = z.infer<typeof MatchInvestorToEntrepreneurInputSchema>;

const MatchInvestorToEntrepreneurOutputSchema = z.object({
  matchReason: z.string().describe('A detailed explanation of why the investor and entrepreneur are a good match.'),
  matchScore: z.number().describe('A score from 0 to 1 indicating the strength of the match (1 being a perfect match).'),
});
export type MatchInvestorToEntrepreneurOutput = z.infer<typeof MatchInvestorToEntrepreneurOutputSchema>;

export async function matchInvestorToEntrepreneur(input: MatchInvestorToEntrepreneurInput): Promise<MatchInvestorToEntrepreneurOutput> {
  return matchInvestorToEntrepreneurFlow(input);
}

const prompt = ai.definePrompt({
  name: 'matchInvestorToEntrepreneurPrompt',
  input: {schema: MatchInvestorToEntrepreneurInputSchema},
  output: {schema: MatchInvestorToEntrepreneurOutputSchema},
  prompt: `You are an AI assistant designed to match investors with entrepreneurs based on their preferences and project details.

An investor is interested in the following:
- Sector: {{{investorSector}}}
- Investment Range: {{{investmentRange}}}
- Expected Returns: {{{expectedReturns}}}

An entrepreneur has the following idea:
- Idea Summary: {{{entrepreneurIdeaSummary}}}
- Field: {{{entrepreneurField}}}
- Required Investment: {{{requiredInvestment}}}
- Estimated Returns: {{{estimatedGuaranteedReturns}}}

Analyze the investor's preferences and the entrepreneur's project details to determine if there is a good match.

Provide a detailed explanation of why they are or are not a good match in the matchReason field.
Assign a matchScore from 0 to 1 (1 being a perfect match) in the matchScore field. Consider all factors to determine the score.
`,
});

const matchInvestorToEntrepreneurFlow = ai.defineFlow(
  {
    name: 'matchInvestorToEntrepreneurFlow',
    inputSchema: MatchInvestorToEntrepreneurInputSchema,
    outputSchema: MatchInvestorToEntrepreneurOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
