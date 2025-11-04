'use server';

import {z} from 'zod';
import type {CallRecord, QAData} from '@/lib/types';
import {calculateQualityScore} from '@/lib/call-data';
import * as xlsx from 'xlsx';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = [
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const qaSchema = z.object({
  file: z
    .any()
    .refine(file => file && file.size > 0, 'CSV or XLSX file is required.')
    .refine(
      file => file && file.size <= MAX_FILE_SIZE,
      `Max file size is 5MB.`
    )
    .refine(
      file => file && ACCEPTED_FILE_TYPES.includes(file.type),
      '.csv and .xlsx files are supported.'
    ),
});

function getColumnIndex(headers: string[], possibleNames: string[]): number {
    for (const name of possibleNames) {
        const index = headers.findIndex(header => header.toLowerCase().replace(/[\s-]/g, '') === name.toLowerCase().replace(/[\s-]/g, ''));
        if (index !== -1) {
            return index;
        }
    }
    return -1;
}


function parseCsv(csv: string): Omit<CallRecord, 'qualityScore'>[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());

  const columnMapping = {
    callId: getColumnIndex(headers, ['Call Id', 'callId']),
    date: getColumnIndex(headers, ['Date']),
    agent: getColumnIndex(headers, ['Agent']),
    department: getColumnIndex(headers, ['Department']),
    answered: getColumnIndex(headers, ['Answered']),
    resolved: getColumnIndex(headers, ['Resolved']),
    speedOfAnswer: getColumnIndex(headers, ['Speed of Answer', 'speedOfAnswer']),
    avgTalkDuration: getColumnIndex(headers, ['AvgTalkDuration', 'avgTalkDuration']),
    satisfactionRating: getColumnIndex(headers, ['Satisfaction-Rating', 'satisfactionRating']),
  };

  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    
    const safeParseInt = (val: string) => {
        const num = parseInt(val, 10);
        return isNaN(num) ? 0 : num;
    };

    return {
      callId: values[columnMapping.callId] || '',
      date: values[columnMapping.date] || '',
      agent: values[columnMapping.agent] || '',
      department: values[columnMapping.department] || '',
      answered: (values[columnMapping.answered] as 'Y' | 'N') || 'N',
      resolved: (values[columnMapping.resolved] as 'Y' | 'N') || 'N',
      speedOfAnswer: safeParseInt(values[columnMapping.speedOfAnswer]),
      avgTalkDuration: values[columnMapping.avgTalkDuration] || '',
      satisfactionRating: safeParseInt(values[columnMapping.satisfactionRating]),
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

    let csvText: string;
    if (file.type === 'text/csv') {
      csvText = await file.text();
    } else {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = xlsx.read(arrayBuffer, {type: 'buffer'});
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      csvText = xlsx.utils.sheet_to_csv(worksheet);
    }

    const records = parseCsv(csvText);

    if (records.length === 0) {
      return {
        data: null,
        error: 'File is empty or in an invalid format.',
      };
    }

    const processedData: CallRecord[] = records.map(record => ({
      ...record,
      qualityScore: calculateQualityScore(record),
    }));

    const totalCalls = processedData.length;
    const totalAnswered = processedData.filter(c => c.answered === 'Y').length;
    const totalResolved = processedData.filter(c => c.resolved === 'Y').length;

    const totalSatisfaction = processedData.reduce((acc, curr) => acc + (curr.satisfactionRating || 0), 0);
    const averageSatisfaction = totalCalls > 0 ? totalSatisfaction / totalCalls : 0;
    
    const totalQualityScore = processedData.reduce((acc, curr) => acc + (curr.qualityScore || 0), 0);
    const averageQualityScore = totalCalls > 0 ? totalQualityScore / totalCalls : 0;


    const agents = [...new Set(processedData.map(c => c.agent))];
    const agentPerformance = agents.map(agent => {
      const agentCalls = processedData.filter(c => c.agent === agent);
      const avgScore =
        agentCalls.reduce((acc, curr) => acc + (curr.qualityScore || 0), 0) /
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
      error: 'Failed to process file. Please check the file format and content.',
    };
  }
}
