import { Header } from "@/components/app/Header";
import { callData, calculateQualityScore } from "@/lib/call-data";
import type { CallRecord } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AgentPerformanceChart } from "@/components/app/AgentPerformanceChart";
import { QAScoreTable } from "@/components/app/QAScoreTable";
import { BarChart, Users, Star, Phone } from "lucide-react";

export default async function QAScorePage() {
  const processedData: CallRecord[] = callData.map((record) => ({
    ...record,
    qualityScore: calculateQualityScore(record),
  }));

  const totalCalls = processedData.length;
  const totalAnswered = processedData.filter((c) => c.answered === 'Y').length;
  const totalResolved = processedData.filter((c) => c.resolved === 'Y').length;
  
  const averageSatisfaction =
    processedData.reduce((acc, curr) => acc + curr.satisfactionRating, 0) /
    totalCalls;
  
  const averageQualityScore =
    processedData.reduce((acc, curr) => acc + curr.qualityScore!, 0) /
    totalCalls;

  const agents = [...new Set(processedData.map((c) => c.agent))];
  const agentPerformance = agents.map((agent) => {
    const agentCalls = processedData.filter((c) => c.agent === agent);
    const avgScore =
      agentCalls.reduce((acc, curr) => acc + curr.qualityScore!, 0) /
      agentCalls.length;
    return { agent, score: Math.round(avgScore) };
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow  p-4 sm:p-6 lg:p-8 bg-muted/40">
        <div className="w-full max-w-7xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">
            QA Score Dashboard
          </h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Calls
                </CardTitle>
                <Phone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCalls}</div>
                <p className="text-xs text-muted-foreground">
                  {totalAnswered} answered, {totalResolved} resolved
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
                  {averageSatisfaction.toFixed(2)} / 5
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all calls
                </p>
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
                  {averageQualityScore.toFixed(0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on QA metric
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Agents
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{agents.length}</div>
                <p className="text-xs text-muted-foreground">
                  Currently active
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Agent Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <AgentPerformanceChart data={agentPerformance} />
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Call Details</CardTitle>
              </CardHeader>
              <CardContent>
                <QAScoreTable data={processedData} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
