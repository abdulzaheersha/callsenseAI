import type { CallRecord } from './types';

/**
 * Calculates a quality score for a call based on various factors.
 * - Satisfaction rating is weighted the most.
 * - Resolving the call gives a significant bonus.
 * - A lower speed of answer is better and gives a small bonus.
 * - Not answering or resolving gives a score of 0.
 * @param record The call record to score.
 * @returns A score from 0 to 100.
 */
export function calculateQualityScore(record: Omit<CallRecord, 'qualityScore'>): number {
    if (record.answered === 'N') {
        return 0;
    }
    
    // Base score from satisfaction (max 60 points)
    const satisfactionScore = (record.satisfactionRating / 5) * 60;
    
    // Bonus for resolving the issue (30 points)
    const resolutionScore = record.resolved === 'Y' ? 30 : 0;
    
    // Bonus for answering quickly (max 10 points)
    // We'll cap speed of answer at 120 seconds for calculation.
    const speedScore = Math.max(0, (1 - record.speedOfAnswer / 120)) * 10;
    
    const totalScore = Math.round(satisfactionScore + resolutionScore + speedScore);
    
    return Math.min(100, Math.max(0, totalScore));
}
