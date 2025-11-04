"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  score: {
    label: "Avg. Score",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

interface AgentPerformanceChartProps {
    data: { agent: string, score: number }[];
}

export function AgentPerformanceChart({ data }: AgentPerformanceChartProps) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-96">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <YAxis dataKey="score" domain={[0, 100]} />
        <XAxis
          dataKey="agent"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <Bar dataKey="score" fill="var(--color-score)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
