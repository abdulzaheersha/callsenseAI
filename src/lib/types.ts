import type { AnalyzeCallSentimentOutput } from '@/ai/flows/analyze-call-sentiment';
import type { DetectComplianceViolationsOutput } from '@/ai/flows/detect-compliance-violations';
import type { TranscribeCallRecordingOutput } from '@/ai/flows/transcribe-call-recordings';

export type AnalysisResult = {
  transcription: TranscribeCallRecordingOutput;
  sentiment: AnalyzeCallSentimentOutput;
  compliance: DetectComplianceViolationsOutput;
  score: number;
  fileName: string;
  analysisDate: string;
};
