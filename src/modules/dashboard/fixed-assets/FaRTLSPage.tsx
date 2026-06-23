"use client";

import { Building, MapPin, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUser } from "@/context/user-context";
import {
  useCreateSavedQueryMutation,
  useDeleteSavedQueryMutation,
  useGetRTLSFloorPlanQuery,
  useGetRTLSPositionsQuery,
  useGetSavedQueriesQuery,
} from "@/hooks/api/fixed-assets";
import {
  FaKpiStrip,
  FaShellHead,
  FaStat,
  formatIDRShort,
} from "@/modules/dashboard/fixed-assets";
import { FaQueryState } from "@/modules/dashboard/fixed-assets/FaQueryState";
import { useFaModal } from "@/modules/dashboard/fixed-assets/modals";

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

export function FaRTLSPage() {
  const router = useRouter();
  const { openModal } = useFaModal();
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const [siteId, setSiteId] = useState("JKT-HQ");
  const [floor, setFloor] = useState("8");
  const [queryOpen, setQueryOpen] = useState(false);
  const [queryName, setQueryName] = useState("");

  const { data: posResp, isError, isLoading } = useGetRTLSPositionsQuery({
    floor,
    organizationId,
    site_id: siteId,
  });
  const { data: fpResp } = useGetRTLSFloorPlanQuery({
    floor,
    organizationId,
    site_id: siteId,
  });
  const { data: savedQueriesResp } = useGetSavedQueriesQuery({ organizationId });
  const { mutateAsync: createSavedQuery } = useCreateSavedQueryMutation({
    organizationId,
  });
  const { mutateAsync: deleteSavedQuery } = useDeleteSavedQueryMutation({
    organizationId,
  });

  const positions = posResp?.data?.positions ?? [];
  const anchors = posResp?.data?.anchors ?? [];
  const avgAccuracy = positions.length > 0
    ? (positions.reduce((sum, p) => sum + p.accuracy_m, 0) / positions.length).toFixed(1)
    : null;
  const floorPlan = fpResp?.data;
  const savedQueries = savedQueriesResp?.data?.queries ?? [];
  const vbW = floorPlan?.width ?? 600;
  const vbH = floorPlan?.height ?? 360;

  const handleSaveQuery = async () => {
    if (!queryName) return;
    await createSavedQuery({ floor, name: queryName, site_id: siteId });
    setQueryOpen(false);
    setQueryName("");
  };

  const handleDeleteQuery = async (queryId: string) => {
    await deleteSavedQuery({ queryId });
  };

  return (
    <div>
      <FaShellHead
        actions={
          <>
            <button
              className="ks-btn ks-btn-sm"
              type="button"
              onClick={() => openModal("locateAsset")}
            >
              <Search size={14} />
              Locate asset
            </button>
            <button
              className="ks-btn ks-btn-sm"
              type="button"
            >
              <Building size={14} />
              {siteId}
            </button>
          </>
        }
        desc="Indoor positioning via BLE anchors · ±0.4 m accuracy · live"
        title="Real-Time Asset Location"
      />

      <FaKpiStrip>
        <FaStat label="Tracked assets" tone="brand" value={String(positions.length)} />
        <FaStat label="Accuracy" tone="info" value={avgAccuracy ? `±${avgAccuracy} m` : "—"} />
        <FaStat label="Zones" tone="success" value="—" />
        <FaStat
          label="Missing >24h"
          sub="needs attention"
          tone="danger"
          value="—"
        />
      </FaKpiStrip>

      <FaQueryState
        isEmpty={positions.length === 0}
        isError={isError}
        isLoading={isLoading}
      >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="ks-card">
          <div className="ks-card-head">
            <div>
              <div className="ks-card-title">JKT-HQ · Floor 8</div>
              <div className="ks-card-desc">
                live · {anchors.length} anchors · {positions.length} assets on
                floor
              </div>
            </div>
            <span className="ks-badge success">● live</span>
          </div>
          <div className="ks-card-body">
            <svg
              className="h-auto w-full"
              style={{ color: "hsl(var(--text-2))" }}
              viewBox={`0 0 ${vbW} ${vbH}`}
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
              <rect fill="url(#rtls-grid)" height={vbH} width={vbW} x="0" y="0" />

              {floorPlan?.floor_plan_url && (
                <image
                  height={vbH}
                  href={floorPlan.floor_plan_url}
                  opacity="0.5"
                  width={vbW}
                  x="0"
                  y="0"
                />
              )}

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

              {anchors.map((a) => (
                <g key={a.id}>
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

              {positions.map((p) => (
                <PulseDot key={p.asset_id} color="#3b82f6" x={p.x} y={p.y} />
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
                onClick={() => router.push("/dashboard/fixed-assets/register/IT-LP-9847/")}
              >
                <Search size={14} />
                Open profile
              </button>
            </div>
          </div>

          <div className="ks-card">
            <div className="ks-card-head">
              <div className="ks-card-title">Saved location queries</div>
              <button
                className="ks-btn ks-btn-sm"
                type="button"
                onClick={() => setQueryOpen(true)}
              >
                Save query
              </button>
            </div>
            <div className="ks-card-body">
              <div className="flex flex-col gap-2">
                {savedQueries.map((q) => (
                  <div
                    key={q.id}
                    className="flex items-center gap-2"
                  >
                    <button
                      className="ks-btn ks-btn-ghost ks-btn-sm"
                      style={{ flex: 1, justifyContent: "flex-start" }}
                      type="button"
                      onClick={() => {
                        setSiteId(q.site_id);
                        setFloor(q.floor);
                      }}
                    >
                      <MapPin size={13} />
                      {q.name}
                    </button>
                    <button
                      className="ks-btn ks-btn-ghost ks-btn-icon ks-btn-sm"
                      type="button"
                      onClick={() => handleDeleteQuery(q.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      </FaQueryState>
      <Dialog open={queryOpen} onOpenChange={setQueryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save location query</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            placeholder="Query name"
            value={queryName}
            onChange={(e) => setQueryName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSaveQuery(); }}
          />
          <DialogFooter>
            <Button onClick={handleSaveQuery}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
