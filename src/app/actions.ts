"use server";

import { z } from "zod";
import { analyzeCallSentiment } from "@/ai/flows/analyze-call-sentiment";
import { detectComplianceViolations } from "@/ai/flows/detect-compliance-violations";
import { transcribeCallRecording } from "@/ai/flows/transcribe-call-recordings";
import type { AnalysisResult } from "@/lib/types";
import { auth } from 'firebase-admin';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth as clientAuth } from '@/lib/firebase';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { Roles } from "@/lib/types";
import { initializeAdminApp } from "@/lib/firebase-admin";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_AUDIO_TYPES = ["audio/mpeg", "audio/wav", "audio/x-wav"];

const analysisSchema = z.object({
  audio: z
    .any()
    .refine((file) => file && file.size > 0, "Audio file is required.")
    .refine(
      (file) => file && file.size <= MAX_FILE_SIZE,
      `Max file size is 10MB.`
    )
    .refine(
      (file) => file && ACCEPTED_AUDIO_TYPES.includes(file.type),
      ".mp3 and .wav files are supported."
    ),
  keywords: z
    .string()
    .min(1, "Compliance keywords are required.")
    .transform((str) =>
      str.split(",").map((k) => k.trim()).filter(Boolean)
    ),
});

export async function analyzeCall(
  prevState: any,
  formData: FormData
): Promise<{ data: AnalysisResult | null; error: string | null }> {
  try {
    const audio = formData.get("audio") as File;
    const keywords = formData.get("keywords") as string;
    
    const parsed = analysisSchema.safeParse({ audio, keywords });

    if (!parsed.success) {
      const errorMessages = parsed.error.issues.map((issue) => issue.message).join(" ");
      return { data: null, error: errorMessages };
    }
    
    const { audio: audioFile, keywords: keywordList } = parsed.data;

    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const audioDataUri = `data:${audioFile.type};base64,${buffer.toString("base64")}`;

    const transcriptionResult = await transcribeCallRecording({ audioDataUri });
    const { transcript } = transcriptionResult;

    if (!transcript) {
        return { data: null, error: "Could not transcribe audio. The file might be silent or corrupted." };
    }

    const [sentimentResult, complianceResult] = await Promise.all([
      analyzeCallSentiment({ transcript }),
      detectComplianceViolations({ transcript, keywords: keywordList }),
    ]);

    // Calculate score
    let score = 100;
    score -= sentimentResult.negativeScore * 50; // Max 50 points deduction for negative sentiment
    score -= complianceResult.violations.length * 20; // 20 points deduction per violation
    score = Math.max(0, Math.round(score));

    const result: AnalysisResult = {
      transcription: transcriptionResult,
      sentiment: sentimentResult,
      compliance: complianceResult,
      score,
      fileName: audioFile.name,
      analysisDate: new Date().toLocaleString(),
    };

    return { data: result, error: null };
  } catch (e: any) {
    console.error("An error occurred during analysis:", e);
    // This could be a Genkit error, a network error, etc.
    const errorMessage = e.message || 'An unexpected error occurred. Please try again.';
    return { data: null, error: `Analysis failed: ${errorMessage}` };
  }
}

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export async function login(prevState: any, formData: FormData) {
    const parsed = loginSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
        return { error: 'Invalid email or password.' };
    }
    const { email, password } = parsed.data;
    try {
        const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
        const idToken = await userCredential.user.getIdToken();
        cookies().set('session', idToken, { secure: true, httpOnly: true });

    } catch (error: any) {
        return { error: error.message };
    }
    return redirect('/dashboard');
}

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.nativeEnum(Roles),
});


export async function signup(prevState: any, formData: FormData) {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const errorMessages = parsed.error.issues.map((issue) => issue.message).join(" ");
    return { error: errorMessages };
  }
  const { email, password, role } = parsed.data;

  try {
    await initializeAdminApp();
    const userRecord = await auth().createUser({
      email,
      password,
    });
    
    await auth().setCustomUserClaims(userRecord.uid, { role });
    
    // Log the user in after successful signup
    const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
    const idToken = await userCredential.user.getIdToken();
    cookies().set('session', idToken, { secure: true, httpOnly: true });

  } catch (error: any) {
    if (error.code === 'auth/email-already-exists') {
      return { error: 'An account with this email already exists.' };
    }
    return { error: 'Something went wrong. Please try again.' };
  }
  return redirect('/dashboard');
}

export async function logout() {
  cookies().delete('session');
  redirect('/login');
}