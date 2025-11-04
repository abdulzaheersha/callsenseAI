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
import type { AgentPerformanceData } from "@/lib/types";
import { Star, TrendingUp, TrendingDown, Phone, CheckCircle } from "lucide-react";

interface AgentPerformanceTableProps {
  data: AgentPerformanceData[];
}

export function AgentPerformanceTable({ data }: AgentPerformanceTableProps) {
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
            <TableHead>Agent</TableHead>
            <TableHead className="text-center">QA Score</TableHead>
            <TableHead className="text-center">Avg. Sat.</TableHead>
            <TableHead className="text-center">Total Calls</TableHead>
            <TableHead className="text-center">Resolved</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((agent) => (
            <TableRow key={agent.agent}>
              <TableCell className="font-medium">{agent.agent}</TableCell>
              <TableCell className="text-center font-bold">
                 <Badge className={getScoreColor(agent.score)}>
                    {agent.score}
                 </Badge>
              </TableCell>
              <TableCell className="text-center flex items-center justify-center gap-1">
                <Star className="h-4 w-4 text-yellow-400" />
                {agent.avgSatisfaction.toFixed(1)}
                </TableCell>
              <TableCell className="text-center">{agent.totalCalls}</TableCell>
              <TableCell className="text-center">{agent.resolvedCalls}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
