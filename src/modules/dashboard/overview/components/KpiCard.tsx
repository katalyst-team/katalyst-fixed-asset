import { TrendingDown, TrendingUp } from "lucide-react";
import * as React from "react";

export type Tone = "brand" | "success" | "warn" | "danger";
export type DeltaTone = "success" | "danger" | "flat";

const toneIconClass: Record<Tone, string> = {
  brand: "ks-kpi-mini-square brand",
  danger: "ks-kpi-mini-square danger",
  success: "ks-kpi-mini-square success",
  warn: "ks-kpi-mini-square warn",
};

function MiniSparkline({
  color,
  data,
  height = 32,
}: {
  color: string;
  data: number[];
  height?: number;
}) {
  if (!data || data.length < 2) return <div style={{ height }} />;
  const W = 200;
  const H = height;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const xStep = W / (data.length - 1 || 1);
  const path = data
    .map(
      (v, i) =>
        `${i ? "L" : "M"}${i * xStep},${H - 2 - ((v - min) / range) * (H - 4)}`,
    )
    .join(" ");
  const area = `${path} L${W},${H} L0,${H} Z`;
  const gid = `kspark-${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg
      preserveAspectRatio="none"
      style={{ display: "block", height, marginTop: 8, width: "100%" }}
      viewBox={`0 0 ${W} ${H}`}
    >
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

export function deltaPercent(series: number[]): {
  delta: string;
  tone: DeltaTone;
} | null {
  if (!series || series.length < 2) return null;
  const start = series[0];
  const end = series[series.length - 1];
  if (start === 0) return null;
  const pct = ((end - start) / start) * 100;
  if (Math.abs(pct) < 0.05) return { delta: "0.0%", tone: "flat" };
  const tone: DeltaTone = pct >= 0 ? "success" : "danger";
  const sign = pct >= 0 ? "+" : "";
  return { delta: `${sign}${pct.toFixed(1)}%`, tone };
}

interface KpiCardProps {
  data: number[];
  delta?: string;
  deltaTone?: DeltaTone;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  tone: Tone;
  value: string;
}

export function KpiCard({
  data,
  delta,
  deltaTone,
  icon: Icon,
  label,
  tone,
  value,
}: KpiCardProps) {
  const colorVar = `hsl(var(--${tone === "brand" ? "brand" : tone === "success" ? "success" : tone === "warn" ? "warn" : "destructive"}))`;
  return (
    <div className="ks-kpi-cardspark">
      <div className="ks-kpi-cardspark-top">
        <div className={toneIconClass[tone]}>
          <Icon size={18} />
        </div>
        {delta && deltaTone && (
          <span className={`ks-kpi-delta ${deltaTone}`}>
            {deltaTone === "success" ? (
              <TrendingUp size={10} />
            ) : deltaTone === "danger" ? (
              <TrendingDown size={10} />
            ) : null}
            {delta}
          </span>
        )}
      </div>
      <div className="ks-kpi-cardspark-value">{value}</div>
      <div className="ks-kpi-cardspark-label">{label}</div>
      <MiniSparkline color={colorVar} data={data} />
    </div>
  );
}

export default KpiCard;
