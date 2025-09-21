import type { AnalysisResult } from "@/lib/types";

function escapeCsvCell(cell: string) {
  if (cell.includes(',')) {
    return `"${cell.replace(/"/g, '""')}"`;
  }
  return cell;
}

export function exportAnalysisToCsv(result: AnalysisResult) {
  const headers = [
    'fileName',
    'analysisDate',
    'agentScore',
    'overallSentiment',
    'positiveScore',
    'negativeScore',
    'complianceViolations',
    'transcript'
  ];

  const violations = result.compliance.violations.join('; ');

  const row = [
    result.fileName,
    result.analysisDate,
    result.score.toString(),
    result.sentiment.sentiment,
    result.sentiment.positiveScore.toString(),
    result.sentiment.negativeScore.toString(),
    violations,
    result.transcription.transcript
  ].map(escapeCsvCell);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), row.join(',')].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `CallSense_Analysis_${result.fileName.split('.')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
