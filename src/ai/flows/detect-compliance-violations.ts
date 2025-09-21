'use server';

/**
 * @fileOverview This file defines a Genkit flow for detecting compliance violations in call transcripts.
 *
 * It includes:
 * - `detectComplianceViolations`: An async function that takes call transcript and a list of compliance keywords/phrases as input and returns compliance violations.
 * - `DetectComplianceViolationsInput`: The input type for the `detectComplianceViolations` function.
 * - `DetectComplianceViolationsOutput`: The output type for the `detectComplianceViolations` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectComplianceViolationsInputSchema = z.object({
  transcript: z
    .string()
    .describe('The call transcript to analyze for compliance violations.'),
  keywords: z
    .array(z.string())
    .describe('A list of keywords and phrases to check for in the transcript.'),
});

export type DetectComplianceViolationsInput = z.infer<
  typeof DetectComplianceViolationsInputSchema
>;

const DetectComplianceViolationsOutputSchema = z.object({
  violations: z
    .array(z.string())
    .describe(
      'A list of compliance violations found in the transcript. Each violation is a string.'
    ),
});

export type DetectComplianceViolationsOutput = z.infer<
  typeof DetectComplianceViolationsOutputSchema
>;

export async function detectComplianceViolations(
  input: DetectComplianceViolationsInput
): Promise<DetectComplianceViolationsOutput> {
  return detectComplianceViolationsFlow(input);
}

const detectComplianceViolationsPrompt = ai.definePrompt({
  name: 'detectComplianceViolationsPrompt',
  input: {schema: DetectComplianceViolationsInputSchema},
  output: {schema: DetectComplianceViolationsOutputSchema},
  prompt: `You are a compliance expert. Analyze the following call transcript and identify any compliance violations based on the provided keywords and phrases.

Transcript: {{{transcript}}}

Keywords and Phrases: {{#each keywords}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

List any violations found in the transcript. If no violations are found, return an empty list. Be concise.
Violations:`, 
});

const detectComplianceViolationsFlow = ai.defineFlow(
  {
    name: 'detectComplianceViolationsFlow',
    inputSchema: DetectComplianceViolationsInputSchema,
    outputSchema: DetectComplianceViolationsOutputSchema,
  },
  async input => {
    const {output} = await detectComplianceViolationsPrompt(input);
    return output!;
  }
);
