"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { CallRecord } from "@/lib/types";

interface QAScoreTableProps {
  data: CallRecord[];
}

export function QAScoreTable({ data }: QAScoreTableProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 50) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };
  return (
    <div className="w-full h-96 overflow-y-auto border rounded-md">
      <Table>
        <TableHeader className="sticky top-0 bg-muted">
          <TableRow>
            <TableHead>Call ID</TableHead>
            <TableHead>Agent</TableHead>
            <TableHead>Department</TableHead>
            <TableHead className="text-center">Resolved</TableHead>
            <TableHead className="text-center">Satisfaction</TableHead>
            <TableHead className="text-center">QA Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((call) => (
            <TableRow key={call.callId}>
              <TableCell className="font-medium">{call.callId}</TableCell>
              <TableCell>{call.agent}</TableCell>
              <TableCell>{call.department}</TableCell>
              <TableCell className="text-center">
                {call.resolved === 'Y' ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">Yes</Badge>
                ) : (
                    <Badge variant="destructive">No</Badge>
                )}
              </TableCell>
              <TableCell className="text-center">{call.satisfactionRating}/5</TableCell>
              <TableCell className="text-center font-bold">
                 <Badge className={getScoreColor(call.qualityScore!)}>
                    {call.qualityScore}
                 </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
