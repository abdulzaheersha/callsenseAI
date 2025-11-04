import type { CallRecord } from './types';

/**
 * Calculates a quality score for a call based on various factors.
 * This version generates a random score for demonstration purposes.
 * @param record The call record to score.
 * @returns A random score from 50 to 100.
 */
export function calculateQualityScore(record: Omit<CallRecord, 'qualityScore'>): number {
    // For demonstration, we'll generate a random score between 50 and 100.
    // This ensures a score is always present regardless of the input data.
    return Math.floor(Math.random() * (100 - 50 + 1)) + 50;
}
