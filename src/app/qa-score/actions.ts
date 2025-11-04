'use server';

import {z} from 'zod';
import type {CallRecord, QAData} from '@/lib/types';
import {calculateQualityScore} from '@/lib/call-data';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ['text/csv'];

const qaSchema = z.object({
  file: z
    .any()
    .refine(file => file && file.size > 0, 'CSV file is required.')
    .refine(
      file => file && file.size <= MAX_FILE_SIZE,
      `Max file size is 5MB.`
    )
    .refine(
      file => file && ACCEPTED_FILE_TYPES.includes(file.type),
      '.csv files are supported.'
    ),
});

function parseCsv(csv: string): Omit<CallRecord, 'qualityScore'>[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const callIdIndex = headers.indexOf('Call Id');

  // If the first column is 'Call Id', then we assume the standard CSV format.
  // Otherwise, we map columns by index.
  const isStandardFormat = callIdIndex !== -1;
  const columnMapping: Record<string, number> = isStandardFormat
    ? {
        callId: callIdIndex,
        date: headers.indexOf('Date'),
        agent: headers.indexOf('Agent'),
        department: headers.indexOf('Department'),
        answered: headers.indexOf('Answered'),
        resolved: headers.indexOf('Resolved'),
        speedOfAnswer: headers.indexOf('Speed of Answer'),
        avgTalkDuration: headers.indexOf('AvgTalkDuration'),
        satisfactionRating: headers.indexOf('Satisfaction-Rating'),
      }
    : {
        callId: 0,
        date: 1,
        agent: 2,
        department: 3,
        answered: 4,
        resolved: 5,
        speedOfAnswer: 6,
        avgTalkDuration: 7,
        satisfactionRating: 8,
      };

  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    return {
      callId: values[columnMapping.callId],
      date: values[columnMapping.date],
      agent: values[columnMapping.agent],
      department: values[columnMapping.department],
      answered: values[columnMapping.answered] as 'Y' | 'N',
      resolved: values[columnMapping.resolved] as 'Y' | 'N',
      speedOfAnswer: parseInt(values[columnMapping.speedOfAnswer], 10),
      avgTalkDuration: values[columnMapping.avgTalkDuration],
      satisfactionRating: parseInt(values[columnMapping.satisfactionRating], 10),
    };
  });
}

export async function analyzeQaData(
  prevState: any,
  formData: FormData
): Promise<{data: QAData | null; error: string | null}> {
  try {
    const file = formData.get('file') as File;
    const parsed = qaSchema.safeParse({file});

    if (!parsed.success) {
      const errorMessages = parsed.error.issues
        .map(issue => issue.message)
        .join(' ');
      return {data: null, error: errorMessages};
    }

    const csvText = await file.text();
    const records = parseCsv(csvText);

    if (records.length === 0) {
      return {data: null, error: 'CSV file is empty or in an invalid format.'};
    }

    const processedData: CallRecord[] = records.map(record => ({
      ...record,
      qualityScore: calculateQualityScore(record),
    }));

    const totalCalls = processedData.length;
    const totalAnswered = processedData.filter(c => c.answered === 'Y').length;
    const totalResolved = processedData.filter(c => c.resolved === 'Y').length;

    const averageSatisfaction =
      processedData.reduce((acc, curr) => acc + curr.satisfactionRating, 0) /
      totalCalls;

    const averageQualityScore =
      processedData.reduce((acc, curr) => acc + curr.qualityScore!, 0) /
      totalCalls;

    const agents = [...new Set(processedData.map(c => c.agent))];
    const agentPerformance = agents.map(agent => {
      const agentCalls = processedData.filter(c => c.agent === agent);
      const avgScore =
        agentCalls.reduce((acc, curr) => acc + curr.qualityScore!, 0) /
        agentCalls.length;
      return {agent, score: Math.round(avgScore)};
    });

    return {
      data: {
        records: processedData,
        totalCalls,
        totalAnswered,
        totalResolved,
        averageSatisfaction,
        averageQualityScore,
        agentCount: agents.length,
        agentPerformance,
      },
      error: null,
    };
  } catch (e: any) {
    console.error('An error occurred during QA analysis:', e);
    return {
      data: null,
      error: 'Failed to process CSV file. Please check the file format.',
    };
  }
}
