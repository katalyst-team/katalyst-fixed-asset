"use client";

import * as React from "react";

import { Skeleton } from "@/components/ui/skeleton";

import { useOverview } from "./useOverview";

export const InventoryTrendChart = () => {
  const { inventoryTrendData, isLoading } = useOverview();

  const chartData = React.useMemo(() => {
    if (!inventoryTrendData.data?.data?.data) return [];
    return Object.values(inventoryTrendData.data.data.data)
      .map((v) => ({ date: v.date, total: v.total }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [inventoryTrendData.data?.data?.data]);

  if (isLoading) {
    return <Skeleton className="h-[260px] w-full" />;
  }

  if (chartData.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-[260px]"
        style={{ color: "hsl(var(--text-3))", fontSize: 13 }}
      >
        No data available
      </div>
    );
  }

  const W = 600;
  const H = 220;
  const PAD = { b: 28, l: 46, r: 14, t: 14 };
  const values = chartData.map((d) => d.total);
  const min = Math.min(...values) * 0.98;
  const max = Math.max(...values) * 1.02 || 1;
  const xStep = (W - PAD.l - PAD.r) / Math.max(chartData.length - 1, 1);
  const yScale = (v: number) =>
    PAD.t + (H - PAD.t - PAD.b) * (1 - (v - min) / (max - min || 1));
  const path = chartData
    .map((d, i) => `${i ? "L" : "M"}${PAD.l + i * xStep},${yScale(d.total)}`)
    .join(" ");
  const areaPath = `${path} L${PAD.l + (chartData.length - 1) * xStep},${H - PAD.b} L${PAD.l},${H - PAD.b} Z`;
  const yTicks = [0, 0.5, 1].map((t) => ({
    v: Math.round(min + (max - min) * t),
    y: yScale(min + (max - min) * t),
  }));

  // 5 evenly spaced X labels
  const xLabelCount = Math.min(5, chartData.length);
  const xLabels = Array.from({ length: xLabelCount }, (_, i) => {
    const idx = Math.floor((i / Math.max(xLabelCount - 1, 1)) * (chartData.length - 1));
    const d = new Date(chartData[idx].date);
    const label = d.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
    return { label, x: PAD.l + (i / Math.max(xLabelCount - 1, 1)) * (W - PAD.l - PAD.r) };
  });

  const formatY = (v: number) => {
    if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
    return v.toString();
  };

  return (
    <svg
      style={{ display: "block", height: 220, width: "100%" }}
      viewBox={`0 0 ${W} ${H}`}
    >
      <defs>
        <linearGradient id="gInv" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--brand))" stopOpacity="0.25" />
          <stop offset="100%" stopColor="hsl(var(--brand))" stopOpacity="0" />
        </linearGradient>
      </defs>
      {yTicks.map((t, i) => (
        <g key={i}>
          <line
            stroke="hsl(var(--border))"
            strokeDasharray={i ? "3 3" : "none"}
            x1={PAD.l}
            x2={W - PAD.r}
            y1={t.y}
            y2={t.y}
          />
          <text
            fill="hsl(var(--text-3))"
            fontFamily="var(--font-mono), Geist Mono, monospace"
            fontSize="10"
            textAnchor="end"
            x={PAD.l - 8}
            y={t.y + 3}
          >
            {formatY(t.v)}
          </text>
        </g>
      ))}
      <path d={areaPath} fill="url(#gInv)" />
      <path
        d={path}
        fill="none"
        stroke="hsl(var(--brand))"
        strokeWidth="2"
      />
      {xLabels.map((l, i) => (
        <text
          key={i}
          fill="hsl(var(--text-3))"
          fontFamily="var(--font-mono), Geist Mono, monospace"
          fontSize="10"
          textAnchor="middle"
          x={l.x}
          y={H - 8}
        >
          {l.label}
        </text>
      ))}
    </svg>
  );
};
