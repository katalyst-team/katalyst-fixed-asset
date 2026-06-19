"use client";

import { Building, MapPin, Search } from "lucide-react";
import { toast } from "sonner";

import {
  FaKpiStrip,
  FaShellHead,
  FaStat,
  formatIDRShort,
} from "@/modules/dashboard/fixed-assets";

interface PulseDotProps {
  color: string;
  dur?: string;
  x: number;
  y: number;
}

function PulseDot({ color, dur = "2.4s", x, y }: PulseDotProps) {
  return (
    <g>
      <circle cx={x} cy={y} fill={color} opacity="0.25" r="6">
        <animate attributeName="r" dur={dur} repeatCount="indefinite" values="6;14;6" />
        <animate attributeName="opacity" dur={dur} repeatCount="indefinite" values="0.25;0;0.25" />
      </circle>
      <circle cx={x} cy={y} fill={color} r="4" />
    </g>
  );
}

const ROOMS = [
  { fill: "rgba(59,130,246,0.07)", h: 140, label: "Open Workstations", w: 250, x: 20, y: 20 },
  { fill: "rgba(6,182,212,0.07)", h: 70, label: "Meeting 8A", w: 120, x: 20, y: 170 },
  { fill: "rgba(6,182,212,0.07)", h: 70, label: "Meeting 8B", w: 120, x: 150, y: 170 },
  { fill: "rgba(245,158,11,0.07)", h: 90, label: "IT room", w: 250, x: 20, y: 250 },
  { fill: "rgba(16,185,129,0.07)", h: 150, label: "Engineering", w: 150, x: 280, y: 20 },
  { fill: "rgba(139,92,246,0.07)", h: 160, label: "Design", w: 150, x: 280, y: 180 },
  { fill: "rgba(100,116,139,0.08)", h: 320, label: "Gate / Lift", w: 140, x: 440, y: 20 },
];

const ANCHORS = [
  { x: 145, y: 90 },
  { x: 80, y: 205 },
  { x: 145, y: 295 },
  { x: 355, y: 95 },
  { x: 355, y: 260 },
  { x: 510, y: 180 },
];

const ASSET_DOTS = [
  { color: "#10b981", x: 60, y: 70 },
  { color: "#3b82f6", x: 210, y: 110 },
  { color: "#f59e0b", x: 90, y: 210 },
  { color: "#8b5cf6", x: 340, y: 70 },
  { color: "#ec4899", x: 320, y: 250 },
  { color: "#10b981", x: 480, y: 300 },
];

const INFO_ROWS = [
  { k: "Asset", v: 'MacBook Pro 16" M3 Max' },
  { k: "Asset ID", v: "IT-LP-9847" },
  { k: "Zone", v: "Open Workstations" },
  { k: "Floor", v: "JKT-HQ · Floor 8" },
  { k: "Custodian", v: "Dewi A." },
  { k: "Last seen", v: "live · 2s ago" },
  { k: "Battery", v: "84%" },
  { k: "Value", v: formatIDRShort(50400000) },
];

const SAVED_QUERIES = [
  "Floor 8 · all laptops",
  "Missing > 24h",
  "Engineering zone",
  "High-value (> Rp 50 jt)",
  "Out-of-zone alerts",
];

export function FaRTLSPage() {
  return (
    <div>
      <FaShellHead
        actions={
          <>
            <button
              className="ks-btn ks-btn-sm"
              type="button"
              onClick={() => toast.info("Open locate bar")}
            >
              <Search size={14} />
              Locate asset
            </button>
            <button
              className="ks-btn ks-btn-sm"
              type="button"
              onClick={() => toast.info("Switch site")}
            >
              <Building size={14} />
              JKT-HQ
            </button>
          </>
        }
        desc="Indoor positioning via BLE anchors · ±0.4 m accuracy · live"
        title="Real-Time Asset Location"
      />

      <FaKpiStrip>
        <FaStat label="Tracked assets" tone="brand" value="2,420" />
        <FaStat label="Accuracy" tone="info" value="±0.4 m" />
        <FaStat label="Zones" tone="success" value="28" />
        <FaStat
          label="Missing >24h"
          sub="needs attention"
          tone="danger"
          value="4"
        />
      </FaKpiStrip>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="ks-card">
          <div className="ks-card-head">
            <div>
              <div className="ks-card-title">JKT-HQ · Floor 8</div>
              <div className="ks-card-desc">
                live · 6 anchors · 142 assets on floor
              </div>
            </div>
            <span className="ks-badge success">● live</span>
          </div>
          <div className="ks-card-body">
            <svg
              className="h-auto w-full"
              style={{ color: "hsl(var(--text-2))" }}
              viewBox="0 0 600 360"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  height="20"
                  id="rtls-grid"
                  patternUnits="userSpaceOnUse"
                  width="20"
                >
                  <path
                    d="M 20 0 L 0 0 0 20"
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity="0.1"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect fill="url(#rtls-grid)" height="360" width="600" x="0" y="0" />

              {ROOMS.map((r) => (
                <g key={r.label}>
                  <rect
                    fill={r.fill}
                    height={r.h}
                    rx="4"
                    stroke="currentColor"
                    strokeOpacity="0.25"
                    strokeWidth="1"
                    width={r.w}
                    x={r.x}
                    y={r.y}
                  />
                  <text
                    fill="currentColor"
                    fillOpacity="0.7"
                    fontSize="11"
                    fontWeight="600"
                    x={r.x + 10}
                    y={r.y + 20}
                  >
                    {r.label}
                  </text>
                </g>
              ))}

              {ANCHORS.map((a, i) => (
                <g key={"anchor-" + i}>
                  <circle cx={a.x} cy={a.y} fill="#22d3ee" r="5" />
                  <circle
                    cx={a.x}
                    cy={a.y}
                    fill="none"
                    r="9"
                    stroke="#22d3ee"
                    strokeOpacity="0.5"
                    strokeWidth="1"
                  />
                </g>
              ))}

              {ASSET_DOTS.map((d, i) => (
                <PulseDot key={"dot-" + i} color={d.color} x={d.x} y={d.y} />
              ))}

              <g>
                <circle cx="465" cy="100" fill="#ef4444" opacity="0.3" r="8">
                  <animate
                    attributeName="r"
                    dur="1.6s"
                    repeatCount="indefinite"
                    values="8;18;8"
                  />
                  <animate
                    attributeName="opacity"
                    dur="1.6s"
                    repeatCount="indefinite"
                    values="0.3;0;0.3"
                  />
                </circle>
                <circle cx="465" cy="100" fill="#ef4444" r="6" />
                <rect fill="#ef4444" height="14" rx="3" width="66" x="432" y="76" />
                <text
                  dominantBaseline="middle"
                  fill="#fff"
                  fontSize="9"
                  fontWeight="700"
                  textAnchor="middle"
                  x="465"
                  y="83"
                >
                  IT-LP-9847
                </text>
              </g>
            </svg>

            <div className="ks-chart-legend" style={{ marginTop: 12 }}>
              <span className="ks-legend-item">
                <span
                  className="ks-legend-swatch"
                  style={{ background: "#22d3ee" }}
                />
                BLE anchor
              </span>
              <span className="ks-legend-item">
                <span
                  className="ks-legend-swatch"
                  style={{ background: "#3b82f6" }}
                />
                Asset
              </span>
              <span className="ks-legend-item">
                <span
                  className="ks-legend-swatch"
                  style={{ background: "#ef4444" }}
                />
                Alert
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="ks-card">
            <div className="ks-card-head">
              <div className="ks-card-title">Selected · IT-LP-9847</div>
              <MapPin size={14} />
            </div>
            <div className="ks-card-body">
              <div className="grid grid-cols-2 gap-3">
                {INFO_ROWS.map((row) => (
                  <div key={row.k}>
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      {row.k}
                    </div>
                    <div className="text-sm font-medium">{row.v}</div>
                  </div>
                ))}
              </div>
              <button
                className="ks-btn ks-btn-primary ks-btn-sm"
                style={{ marginTop: 14 }}
                type="button"
                onClick={() => toast.info("Open asset profile · IT-LP-9847")}
              >
                <Search size={14} />
                Open profile
              </button>
            </div>
          </div>

          <div className="ks-card">
            <div className="ks-card-head">
              <div className="ks-card-title">Saved location queries</div>
            </div>
            <div className="ks-card-body">
              <div className="flex flex-col gap-2">
                {SAVED_QUERIES.map((q) => (
                  <button
                    key={q}
                    className="ks-btn ks-btn-ghost ks-btn-sm"
                    style={{ justifyContent: "flex-start" }}
                    type="button"
                    onClick={() => toast.info("Running query: " + q)}
                  >
                    <MapPin size={13} />
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
