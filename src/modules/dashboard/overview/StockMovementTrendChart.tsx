"use client";

import * as React from "react";

import { Skeleton } from "@/components/ui/skeleton";

import { useOverview } from "./useOverview";

export const StockMovementTrendChart = () => {
  const { isLoading, stockMovementTrendData } = useOverview();

  const chartData = React.useMemo(() => {
    if (!stockMovementTrendData.data?.data?.data) return [];
    return Object.values(stockMovementTrendData.data.data.data)
      .map((v) => ({
        date: v.date,
        inbound: v.inbound,
        outbound: v.outbound,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [stockMovementTrendData.data?.data?.data]);

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
  const H = 240;
  const PAD = { b: 30, l: 44, r: 14, t: 14 };
  const inboundData = chartData.map((d) => d.inbound);
  const outboundData = chartData.map((d) => d.outbound);
  const maxV = Math.max(...inboundData, ...outboundData) * 1.1 || 1;
  const xStep = (W - PAD.l - PAD.r) / Math.max(chartData.length - 1, 1);
  const yScale = (v: number) =>
    PAD.t + (H - PAD.t - PAD.b) * (1 - v / maxV);

  const pathFor = (data: number[]) =>
    data.map((v, i) => `${i ? "L" : "M"}${PAD.l + i * xStep},${yScale(v)}`).join(" ");
  const areaFor = (data: number[]) =>
    `${pathFor(data)} L${PAD.l + (data.length - 1) * xStep},${H - PAD.b} L${PAD.l},${H - PAD.b} Z`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    v: Math.round(maxV * t),
    y: yScale(maxV * t),
  }));

  const xLabelCount = Math.min(5, chartData.length);
  const xLabels = Array.from({ length: xLabelCount }, (_, i) => {
    const idx = Math.floor((i / Math.max(xLabelCount - 1, 1)) * (chartData.length - 1));
    const d = new Date(chartData[idx].date);
    const label = d.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
    return {
      label,
      x: PAD.l + (i / Math.max(xLabelCount - 1, 1)) * (W - PAD.l - PAD.r),
    };
  });

  return (
    <svg
      style={{ display: "block", height: 240, width: "100%" }}
      viewBox={`0 0 ${W} ${H}`}
    >
      <defs>
        <linearGradient id="gIn" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--brand))" stopOpacity="0.22" />
          <stop offset="100%" stopColor="hsl(var(--brand))" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="gOut" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.18" />
          <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
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
            {t.v.toLocaleString()}
          </text>
        </g>
      ))}
      <path d={areaFor(inboundData)} fill="url(#gIn)" />
      <path d={pathFor(inboundData)} fill="none" stroke="hsl(var(--brand))" strokeWidth="2" />
      <path d={areaFor(outboundData)} fill="url(#gOut)" />
      <path d={pathFor(outboundData)} fill="none" stroke="hsl(var(--accent))" strokeWidth="2" />
      {xLabels.map((l, i) => (
        <text
          key={i}
          fill="hsl(var(--text-3))"
          fontFamily="var(--font-mono), Geist Mono, monospace"
          fontSize="10"
          textAnchor="middle"
          x={l.x}
          y={H - 10}
        >
          {l.label}
        </text>
      ))}
    </svg>
  );
};
