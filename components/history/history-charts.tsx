"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// A small, cohesive categorical palette (works in light & dark).
const PALETTE = [
  "hsl(174 72% 38%)",
  "hsl(199 89% 48%)",
  "hsl(258 70% 62%)",
  "hsl(322 70% 55%)",
  "hsl(24 90% 55%)",
  "hsl(47 90% 50%)",
  "hsl(142 60% 42%)",
  "hsl(217 80% 58%)",
];

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid hsl(var(--border))",
  background: "hsl(var(--popover))",
  color: "hsl(var(--popover-foreground))",
  fontSize: 12,
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
};

export function TopicBarChart({
  data,
}: {
  data: { topic: string; count: number }[];
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
        No published posts yet.
      </div>
    );
  }
  return (
    <div style={{ height: Math.max(200, data.length * 44) }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
          barCategoryGap={10}
        >
          <XAxis
            type="number"
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            type="category"
            dataKey="topic"
            width={140}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--muted))" }}
            contentStyle={tooltipStyle}
            formatter={(v) => [`${v} post${v === 1 ? "" : "s"}`, "Published"]}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function FrequencyBarChart({
  data,
}: {
  data: { label: string; count: number }[];
}) {
  const total = data.reduce((s, d) => s + d.count, 0);
  if (total === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
        No posting activity yet.
      </div>
    );
  }
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: -20 }}>
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            width={40}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--muted))" }}
            contentStyle={tooltipStyle}
            formatter={(v) => [`${v} post${v === 1 ? "" : "s"}`, "Published"]}
          />
          <Bar
            dataKey="count"
            fill="hsl(var(--primary))"
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
