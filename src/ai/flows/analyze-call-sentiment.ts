'use server';

/**
 * @fileOverview An AI agent for analyzing the sentiment of call transcripts.
 *
 * - analyzeCallSentiment - A function that analyzes the sentiment of a call transcript.
 * - AnalyzeCallSentimentInput - The input type for the analyzeCallSentiment function.
 * - AnalyzeCallSentimentOutput - The return type for the analyzeCallSentiment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCallSentimentInputSchema = z.object({
  transcript: z
    .string()
    .describe('The transcript of the call to analyze.'),
});
export type AnalyzeCallSentimentInput = z.infer<
  typeof AnalyzeCallSentimentInputSchema
>;

const AnalyzeCallSentimentOutputSchema = z.object({
  sentiment: z
    .string()
    .describe(
      'The overall sentiment of the call transcript (positive, neutral, or negative).'
    ),
  positiveScore: z
    .number()
    .describe(
      'A score indicating the degree to which the sentiment is positive.'
    ),
  negativeScore: z
    .number()
    .describe(
      'A score indicating the degree to which the sentiment is negative.'
    ),
});
export type AnalyzeCallSentimentOutput = z.infer<
  typeof AnalyzeCallSentimentOutputSchema
>;

export async function analyzeCallSentiment(
  input: AnalyzeCallSentimentInput
): Promise<AnalyzeCallSentimentOutput> {
  return analyzeCallSentimentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeCallSentimentPrompt',
  input: {schema: AnalyzeCallSentimentInputSchema},
  output: {schema: AnalyzeCallSentimentOutputSchema},
  prompt: `You are an AI-powered sentiment analysis tool for call center transcripts.
  Analyze the following call transcript and determine the overall sentiment.
  Provide a sentiment label (positive, neutral, or negative) and a positive/negative score.

  Transcript: {{{transcript}}}
  \nOutput in JSON format:
  `,
});

const analyzeCallSentimentFlow = ai.defineFlow(
  {
    name: 'analyzeCallSentimentFlow',
    inputSchema: AnalyzeCallSentimentInputSchema,
    outputSchema: AnalyzeCallSentimentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
