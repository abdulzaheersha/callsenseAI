"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  Award,
  Smile,
  ShieldAlert,
  Download,
  RotateCcw,
} from "lucide-react";
import type { AnalysisResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SentimentChart, type ChartData } from "./SentimentChart";
import { exportAnalysisToCsv } from "@/lib/csv";

interface AnalysisDashboardProps {
  result: AnalysisResult;
  onReset: () => void;
}

export function AnalysisDashboard({ result, onReset }: AnalysisDashboardProps) {
  const sentimentChartData: ChartData = [
    { name: "Positive", value: result.sentiment.positiveScore, fill: "hsl(var(--chart-1))" },
    { name: "Negative", value: result.sentiment.negativeScore, fill: "hsl(var(--chart-2))" },
  ];

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return <Badge className="bg-green-500 text-white">Positive</Badge>;
      case "negative":
        return <Badge variant="destructive">Negative</Badge>;
      case "neutral":
        return <Badge variant="secondary">Neutral</Badge>;
      default:
        return <Badge>{sentiment}</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 printable-area animate-in fade-in-50 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analysis Report</h2>
          <p className="text-muted-foreground">
            File: {result.fileName} | Date: {result.analysisDate}
          </p>
        </div>
        <div className="flex items-center gap-2 no-print shrink-0">
          <Button onClick={handlePrint}>
            <Download className="mr-2 h-4 w-4" /> Export PDF
          </Button>
          <Button onClick={() => exportAnalysisToCsv(result)}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button variant="outline" onClick={onReset}>
            <RotateCcw className="mr-2 h-4 w-4" /> New Analysis
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-md card-printable">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agent Score</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-7xl font-bold ${getScoreColor(result.score)}`}>
                {result.score}
              </div>
              <p className="text-xs text-muted-foreground">out of 100</p>
            </CardContent>
          </Card>

          <Card className="shadow-md card-printable">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Sentiment Analysis
              </CardTitle>
              <Smile className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full">
                <SentimentChart data={sentimentChartData} />
              </div>
              <div className="text-center mt-4">
                <span className="text-sm text-muted-foreground">Overall Sentiment: </span>
                {getSentimentBadge(result.sentiment.sentiment)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-md card-printable">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5" />
                Compliance Report
              </CardTitle>
              <CardDescription>
                Detected violations based on provided keywords.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result.compliance.violations.length > 0 ? (
                <ul className="space-y-3">
                  {result.compliance.violations.map((violation, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <ShieldAlert className="h-5 w-5 text-destructive mt-1 shrink-0" />
                      <p className="text-destructive-foreground font-medium">{violation}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-6 bg-green-50 rounded-lg">
                    <Award className="h-10 w-10 text-green-500 mb-2"/>
                    <p className="font-semibold text-green-700">No compliance violations found.</p>
                    <p className="text-sm text-green-600">Excellent work!</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-md card-printable">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Call Transcript
              </CardTitle>
              <CardDescription>
                Full transcription of the call recording.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64 w-full rounded-md border p-4">
                <p className="text-sm leading-relaxed">
                  {result.transcription.transcript}
                </p>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
