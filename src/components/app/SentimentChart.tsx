"use client"

import * as React from "react"
import { Pie, PieChart } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"

export type ChartData = {
    name: string;
    value: number;
    fill: string;
}[];

interface SentimentChartProps {
    data: ChartData;
}

export function SentimentChart({ data }: SentimentChartProps) {
    const chartConfig = {
        positive: {
            label: "Positive",
        },
        negative: {
            label: "Negative",
        },
    }

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <PieChart accessibilityLayer>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          strokeWidth={5}
        >
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="name" />} />
      </PieChart>
    </ChartContainer>
  )
}
