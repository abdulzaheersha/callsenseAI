
import type { CallRecord } from './types';

/**
 * Calculates a quality score for a call based on performance factors.
 * Ensures a score between 50 and 100 is always returned.
 * 
 * Logic:
 * - Baseline: 70
 * - Resolution: +15 if resolved (Y)
 * - Answer Status: +5 if answered (Y)
 * - Satisfaction: Weighted impact based on rating
 * - ASA (Speed of Answer): Penalty for long wait times
 * 
 * @param record The call record to score.
 * @returns A score from 50 to 100.
 */
export function calculateQualityScore(record: Omit<CallRecord, 'qualityScore'>): number {
    let score = 70; // Baseline

    // Data verification - extremely defensive against malformed inputs
    const answered = record.answered === 'Y';
    const resolved = record.resolved === 'Y';
    
    const satisfaction = (typeof record.satisfactionRating === 'number' && !isNaN(record.satisfactionRating)) 
        ? record.satisfactionRating 
        : 0;
        
    const asa = (typeof record.speedOfAnswer === 'number' && !isNaN(record.speedOfAnswer)) 
        ? record.speedOfAnswer 
        : 0;

    // Performance Impact: Resolution
    if (resolved) {
        score += 15;
    } else {
        score -= 10; // Penalty for unresolved
    }
    
    // Impact: Answer Status
    if (answered) {
        score += 5;
    } else {
        score -= 15; // Penalty for missed call
    }
    
    // Satisfaction Impact
    if (satisfaction >= 4.5) {
        score += 10;
    } else if (satisfaction >= 4.0) {
        score += 5;
    } else if (satisfaction > 0 && satisfaction <= 2.5) {
        score -= 20; // Penalty for poor feedback
    } else if (satisfaction === 0) {
        // No rating provided, neutral impact but slightly penalized for lack of feedback engagement
        score -= 5;
    }
    
    // Operational Efficiency: ASA (Speed of Answer)
    if (asa > 120) {
        score -= 20; // Penalty for long wait (>2 mins)
    } else if (asa > 60) {
        score -= 10; // Penalty for wait (>1 min)
    } else if (asa > 0 && asa <= 15) {
        score += 10; // Bonus for rapid response (<15s)
    } else if (asa > 15 && asa <= 30) {
        score += 5; // Slight bonus for good response (<30s)
    }
    
    // Final clamp: 50-100
    const finalScore = Math.max(50, Math.min(100, Math.round(score)));
    return isNaN(finalScore) ? 75 : finalScore;
}
