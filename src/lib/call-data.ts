import type { CallRecord } from './types';

export const callData: Omit<CallRecord, 'qualityScore'>[] = [
    {
      callId: 'ID0001',
      date: '01-01-2015 9:12',
      agent: 'Diane',
      department: 'Washing Machine',
      answered: 'Y',
      resolved: 'Y',
      speedOfAnswer: 109,
      avgTalkDuration: '00:02:23',
      satisfactionRating: 3,
    },
    {
      callId: 'ID0002',
      date: '01-01-2015 9:12',
      agent: 'Becky',
      department: 'Air Conditioner',
      answered: 'Y',
      resolved: 'N',
      speedOfAnswer: 70,
      avgTalkDuration: '00:04:02',
      satisfactionRating: 3,
    },
    {
      callId: 'ID0003',
      date: '01-01-2015 9:47',
      agent: 'Stewart',
      department: 'Washing Machine',
      answered: 'Y',
      resolved: 'Y',
      speedOfAnswer: 10,
      avgTalkDuration: '00:02:11',
      satisfactionRating: 3,
    },
    {
      callId: 'ID0004',
      date: '01-01-2015 9:47',
      agent: 'Greg',
      department: 'Washing Machine',
      answered: 'Y',
      resolved: 'Y',
      speedOfAnswer: 53,
      avgTalkDuration: '00:00:37',
      satisfactionRating: 2,
    },
    {
      callId: 'ID0005',
      date: '01-01-2015 10:00',
      agent: 'Becky',
      department: 'Toaster',
      answered: 'Y',
      resolved: 'Y',
      speedOfAnswer: 95,
      avgTalkDuration: '00:01:00',
      satisfactionRating: 3,
    },
    {
      callId: 'ID0006',
      date: '01-01-2015 10:00',
      agent: 'Stewart',
      department: 'Air Conditioner',
      answered: 'N',
      resolved: 'N',
      speedOfAnswer: 0,
      avgTalkDuration: '00:00:00',
      satisfactionRating: 1,
    },
    {
      callId: 'ID0007',
      date: '01-01-2015 10:22',
      agent: 'Diane',
      department: 'Toaster',
      answered: 'Y',
      resolved: 'Y',
      speedOfAnswer: 24,
      avgTalkDuration: '00:03:40',
      satisfactionRating: 2,
    },
    {
      callId: 'ID0008',
      date: '01-01-2015 10:22',
      agent: 'Diane',
      department: 'Toaster',
      answered: 'Y',
      resolved: 'Y',
      speedOfAnswer: 22,
      avgTalkDuration: '00:00:38',
      satisfactionRating: 4,
    },
    {
      callId: 'ID0009',
      date: '01-01-2015 11:13',
      agent: 'Greg',
      department: 'Fridge',
      answered: 'Y',
      resolved: 'Y',
      speedOfAnswer: 15,
      avgTalkDuration: '00:06:38',
      satisfactionRating: 4,
    },
    {
      callId: 'ID0010',
      date: '01-01-2015 11:13',
      agent: 'Jim',
      department: 'Television',
      answered: 'Y',
      resolved: 'Y',
      speedOfAnswer: 78,
      avgTalkDuration: '00:01:04',
      satisfactionRating: 3,
    },
    {
      callId: 'ID0011',
      date: '01-01-2015 11:15',
      agent: 'Joe',
      department: 'Toaster',
      answered: 'N',
      resolved: 'N',
      speedOfAnswer: 0,
      avgTalkDuration: '00:00:00',
      satisfactionRating: 1,
    },
    {
      callId: 'ID0012',
      date: '01-01-2015 11:15',
      agent: 'Greg',
      department: 'Toaster',
      answered: 'Y',
      resolved: 'Y',
      speedOfAnswer: 50,
      avgTalkDuration: '00:00:32',
      satisfactionRating: 4,
    },
  ];

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
