"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { Stats } from "@/lib/types";
import { useApi } from "@/hooks/use-api";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChartIcon } from "lucide-react";

export function WinLossChart() {
  const { data, loading } = useApi<Stats>("/api/trades/stats", { intervalMs: 15000 });

  if (loading && !data) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const { winLossDist } = data;
  const chartData = [
    { name: "Wins", value: winLossDist.wins, color: "#10b981" },
    { name: "Losses", value: winLossDist.losses, color: "#ef4444" },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
          <PieChartIcon className="h-4 w-4" />
          Win / Loss
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={72}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-around mt-2 text-xs">
          <div className="text-center">
            <div className="font-semibold text-emerald-600">{winLossDist.wins}</div>
            <div className="text-muted-foreground">Wins ({winLossDist.winRate.toFixed(1)}%)</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-red-600">{winLossDist.losses}</div>
            <div className="text-muted-foreground">Losses</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
