
'use server';

import { z } from 'zod';
import type { CallRecord, QAData } from '@/lib/types';
import { calculateQualityScore } from '@/lib/call-data';
import * as xlsx from 'xlsx';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
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
      `Max file size is 10MB.`
    )
    .refine(
      file => file && (ACCEPTED_FILE_TYPES.includes(file.type) || file.name.endsWith('.csv') || file.name.endsWith('.xlsx')),
      '.csv and .xlsx files are supported.'
    ),
});

/**
 * Robustly finds the index of a column based on a list of possible names.
 * Normalizes both the header and the possible names to ignore case, spacing, and special characters.
 */
function getColumnIndex(headers: string[], possibleNames: string[]): number {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  const normalizedPossible = possibleNames.map(normalize);
  
  // First pass: look for exact normalized matches
  for (let i = 0; i < headers.length; i++) {
    if (!headers[i]) continue;
    const normalizedHeader = normalize(headers[i]);
    if (normalizedPossible.includes(normalizedHeader)) {
      return i;
    }
  }

  // Second pass: look for partial matches
  for (let i = 0; i < headers.length; i++) {
    if (!headers[i]) continue;
    const normalizedHeader = normalize(headers[i]);
    if (normalizedPossible.some(p => normalizedHeader.includes(p) || p.includes(normalizedHeader))) {
      return i;
    }
  }

  return -1;
}

/**
 * Robustly identifies a positive status from various input values.
 */
function checkStatus(val: any): 'Y' | 'N' {
  if (val === undefined || val === null || val === '') return 'N';
  const normalized = val.toString().toUpperCase().trim();
  const positiveValues = [
    'Y', 'YES', '1', 'TRUE', 'SUCCESS', 'RESOLVED', 
    'ANSWERED', 'HANDLED', 'PICKED UP', 'OK', 
    'COMPLETE', 'DONE', 'CORRECT', 'CHECKED', 
    'PASS', 'RESOLV', 'SOLVED', 'POSITIVE', 'SUCCESSFUL',
    'CONFIRMED', 'FIXED', 'VALIDATED', 'RESOLVD', 'ANSRD',
    'ANSWERD', 'RESOVLED', 'ANSWRD', 'PICK'
  ];
  return positiveValues.some(p => normalized === p || normalized.includes(p)) ? 'Y' : 'N';
}

/**
 * Parses CSV text into CallRecord objects with high fault tolerance.
 */
function parseCsv(csv: string): CallRecord[] {
  const lines = csv.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  const parseLine = (line: string) => {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') inQuotes = !inQuotes;
      else if (char === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else cur += char;
    }
    result.push(cur.trim());
    return result;
  };

  const headers = parseLine(lines[0]).map(h => h.replace(/^\ufeff/, '').trim());

  const columnMapping = {
    callId: getColumnIndex(headers, ['Call Id', 'callId', 'id', 'CallID', 'Ref', 'Reference', 'UID', 'Ticket', 'CallRef', 'RecordID']),
    date: getColumnIndex(headers, ['Date', 'timestamp', 'CallDate', 'Time', 'Created', 'DateTime', 'Day', 'Period']),
    agent: getColumnIndex(headers, ['Agent', 'User', 'Staff', 'Name', 'Employee', 'Representative', 'Worker', 'Op', 'Operator']),
    department: getColumnIndex(headers, ['Department', 'Dept', 'Team', 'BusinessUnit', 'Group', 'TeamName', 'Queue']),
    answered: getColumnIndex(headers, ['Answered', 'IsAnswered', 'Ans', 'Handled', 'PickedUp', 'Picked', 'Status', 'Answerd', 'Answrd']),
    resolved: getColumnIndex(headers, ['Resolved', 'IsResolved', 'IssueResolved', 'Res', 'FCR', 'Closed', 'Resovled', 'Resolvd']),
    speedOfAnswer: getColumnIndex(headers, ['Speed of Answer', 'ASA', 'WaitTime', 'AnswerTime', 'Delay', 'RingTime', 'Wait', 'HoldTime']),
    avgTalkDuration: getColumnIndex(headers, ['Avg Talk Duration', 'AHT', 'TalkTime', 'Duration', 'Length', 'Talk', 'CallTime']),
    satisfactionRating: getColumnIndex(headers, ['Satisfaction Rating', 'CSAT', 'Satisfaction', 'Rating', 'Score', 'Stars', 'Feedback', 'NPS']),
  };

  return lines.slice(1)
    .map((line, idx) => {
      const values = parseLine(line);
      if (values.length === 0 || values.every(v => !v)) return null;

      const safeParseFloat = (val: any) => {
        if (val === undefined || val === null || val === '') return 0;
        const stringVal = val.toString().trim();
        const match = stringVal.match(/[0-9.]+/);
        const num = match ? parseFloat(match[0]) : 0;
        return isNaN(num) ? 0 : num;
      };

      const record: Omit<CallRecord, 'qualityScore'> = {
        callId: values[columnMapping.callId] || `CALL-${idx + 1}`,
        date: values[columnMapping.date] || new Date().toISOString().split('T')[0],
        agent: values[columnMapping.agent] || 'Unknown Agent',
        department: values[columnMapping.department] || 'Support',
        answered: checkStatus(values[columnMapping.answered]),
        resolved: checkStatus(values[columnMapping.resolved]),
        speedOfAnswer: Math.round(safeParseFloat(values[columnMapping.speedOfAnswer])),
        avgTalkDuration: values[columnMapping.avgTalkDuration]?.toString() || '00:00',
        satisfactionRating: safeParseFloat(values[columnMapping.satisfactionRating]),
      };

      return {
        ...record,
        qualityScore: calculateQualityScore(record)
      };
    })
    .filter((record): record is CallRecord => record !== null);
}

export async function analyzeQaData(
  prevState: any,
  formData: FormData
): Promise<{ data: QAData | null; error: string | null }> {
  try {
    const file = formData.get('file') as File;
    const parsed = qaSchema.safeParse({ file });

    if (!parsed.success) {
      const errorMessages = parsed.error.issues
        .map(issue => issue.message)
        .join(' ');
      return { data: null, error: errorMessages };
    }

    let csvText: string;
    if (file.name.endsWith('.csv')) {
      csvText = await file.text();
    } else {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = xlsx.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      csvText = xlsx.utils.sheet_to_csv(worksheet);
    }

    const processedData = parseCsv(csvText);

    if (processedData.length === 0) {
      return {
        data: null,
        error: 'The uploaded file is empty or does not contain recognizable headers.',
      };
    }

    const totalCalls = processedData.length;
    const totalAnswered = processedData.filter(c => c.answered === 'Y').length;
    const totalResolved = processedData.filter(c => c.resolved === 'Y').length;

    const totalSatisfaction = processedData.reduce((acc, curr) => acc + (curr.satisfactionRating || 0), 0);
    const averageSatisfaction = totalCalls > 0 ? totalSatisfaction / totalCalls : 0;

    const totalQualityScore = processedData.reduce((acc, curr) => acc + (curr.qualityScore || 0), 0);
    const averageQualityScore = totalCalls > 0 ? totalQualityScore / totalCalls : 0;

    const agents = Array.from(new Set(processedData.map(c => c.agent)));
    const agentPerformance = agents.map(agent => {
      const agentCalls = processedData.filter(c => c.agent === agent);
      const totalAgentCalls = agentCalls.length;
      const agentScoreSum = agentCalls.reduce((acc, curr) => acc + (curr.qualityScore || 0), 0);
      const agentSatSum = agentCalls.reduce((acc, curr) => acc + (curr.satisfactionRating || 0), 0);

      const avgScore = totalAgentCalls > 0 ? agentScoreSum / totalAgentCalls : 0;
      const avgSat = totalAgentCalls > 0 ? agentSatSum / totalAgentCalls : 0;
      const resolvedCalls = agentCalls.filter(c => c.resolved === 'Y').length;

      return {
        agent,
        score: Math.round(avgScore),
        totalCalls: totalAgentCalls,
        avgSatisfaction: parseFloat(avgSat.toFixed(2)),
        resolvedCalls
      };
    }).sort((a, b) => b.score - a.score);

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
      error: `Failed to process file: ${e.message || 'The file format might be incompatible.'}`,
    };
  }
}
