'use server';

/**
 * @fileOverview A call recording transcription AI agent.
 *
 * - transcribeCallRecording - A function that handles the call recording transcription process.
 * - TranscribeCallRecordingInput - The input type for the transcribeCallRecording function.
 * - TranscribeCallRecordingOutput - The return type for the transcribeCallRecording function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranscribeCallRecordingInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "A call recording as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type TranscribeCallRecordingInput = z.infer<
  typeof TranscribeCallRecordingInputSchema
>;

const TranscribeCallRecordingOutputSchema = z.object({
  transcript: z.string().describe('The transcript of the call recording.'),
});
export type TranscribeCallRecordingOutput = z.infer<
  typeof TranscribeCallRecordingOutputSchema
>;

export async function transcribeCallRecording(
  input: TranscribeCallRecordingInput
): Promise<TranscribeCallRecordingOutput> {
  return transcribeCallRecordingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'transcribeCallRecordingPrompt',
  input: {schema: TranscribeCallRecordingInputSchema},
  output: {schema: TranscribeCallRecordingOutputSchema},
  prompt: `You are an expert transcriptionist.

  Please transcribe the following call recording.

  Recording: {{media url=audioDataUri}}`,
});

const transcribeCallRecordingFlow = ai.defineFlow(
  {
    name: 'transcribeCallRecordingFlow',
    inputSchema: TranscribeCallRecordingInputSchema,
    outputSchema: TranscribeCallRecordingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
