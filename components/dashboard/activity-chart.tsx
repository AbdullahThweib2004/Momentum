"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";

export function ActivityChart({
  data,
}: {
  data: { date: string; count: number }[];
}) {
  const total = useMemo(
    () => data.reduce((sum, d) => sum + d.count, 0),
    [data]
  );
  const maxCount = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="h-[240px] w-full">
      {total === 0 ? (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          No posts published in the last 30 days yet.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, bottom: 0, left: -20 }}
          >
            <defs>
              <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.28} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              minTickGap={28}
              tickFormatter={(v) => format(parseISO(v), "MMM d")}
            />
            <YAxis
              allowDecimals={false}
              domain={[0, maxCount + 1]}
              tickLine={false}
              axisLine={false}
              width={40}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              cursor={{ stroke: "hsl(var(--border))" }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--popover))",
                color: "hsl(var(--popover-foreground))",
                fontSize: 12,
                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              }}
              labelFormatter={(v) => format(parseISO(v as string), "MMMM d, yyyy")}
              formatter={(value) => [`${value} post${value === 1 ? "" : "s"}`, "Published"]}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#activityFill)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
