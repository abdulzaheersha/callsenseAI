"use client";

import type { QAData } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AgentPerformanceTable } from "@/components/app/AgentPerformanceTable";
import { QAScoreTable } from "@/components/app/QAScoreTable";
import { BarChart, Users, Star, Phone, RotateCcw } from "lucide-react";
import { Button } from "../ui/button";

interface QADashboardProps {
  qaData: QAData;
}

export function QADashboard({ qaData }: QADashboardProps) {
  const handleReset = () => {
    window.location.reload();
  };

  return (
    <div className="w-full mx-auto space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            QA Score Dashboard
          </h2>
          <p className="text-muted-foreground">
            Displaying analysis from your uploaded dataset.
          </p>
        </div>
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="mr-2 h-4 w-4" /> New Analysis
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qaData.totalCalls}</div>
            <p className="text-xs text-muted-foreground">
              {qaData.totalAnswered} answered, {qaData.totalResolved} resolved
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Satisfaction
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(qaData.averageSatisfaction || 0).toFixed(2)} / 5
            </div>
            <p className="text-xs text-muted-foreground">Across all calls</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Quality Score
            </CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(qaData.averageQualityScore || 0).toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">Based on QA metric</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qaData.agentCount}</div>
            <p className="text-xs text-muted-foreground">From uploaded data</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Agent Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <AgentPerformanceTable data={qaData.agentPerformance} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Call Details</CardTitle>
          </CardHeader>
          <CardContent>
            <QAScoreTable data={qaData.records} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
