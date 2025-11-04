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

export type CallRecord = {
  callId: string;
  date: string;
  agent: string;
  department: string;
  answered: 'Y' | 'N';
  resolved: 'Y' | 'N';
  speedOfAnswer: number;
  avgTalkDuration: string;
  satisfactionRating: number;
  qualityScore?: number;
};
