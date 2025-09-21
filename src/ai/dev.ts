import { config } from 'dotenv';
config();

import '@/ai/flows/detect-compliance-violations.ts';
import '@/ai/flows/analyze-call-sentiment.ts';
import '@/ai/flows/transcribe-call-recordings.ts';