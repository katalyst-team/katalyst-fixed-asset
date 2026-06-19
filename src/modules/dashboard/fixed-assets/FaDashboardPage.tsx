"use client";

import {
  Download,
  FileText,
  Plus,
  RefreshCw,
  Truck,
  Upload,
  Wrench,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { useUser } from "@/context/user-context";
import useGetFADashboardQuery from "@/hooks/api/fixed-assets";
import {
  avatarColor,
  catToLucide,
  FaKpiStrip,
  FaMeter,
  FaProtoIcon,
  FaShellHead,
  FaStat,
  formatIDRShort,
  initials,
} from "@/modules/dashboard/fixed-assets";
import {
  ASSETS,
  CATEGORY_STATS,
  FINANCIAL_CATEGORIES,
  MAINTENANCE_UPCOMING,
  RECENT_ACTIVITY,
  RFID_READS,
  SITES,
} from "@/services/fixed-assets/mock";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const HEATMAP: number[][] = [
  [2, 3, 4, 5, 4, 3],
  [3, 4, 5, 5, 4, 2],
  [4, 5, 5, 4, 3, 1],
  [3, 4, 4, 5, 4, 3],
  [4, 5, 5, 5, 4, 2],
  [2, 3, 3, 4, 3, 1],
  [1, 2, 2, 3, 2, 1],
];

const QUICK_ACTIONS = [
  { icon: Download, label: "Scan-In" },
  { icon: Upload, label: "Scan-Out" },
  { icon: Truck, label: "Transfer" },
  { icon: FileText, label: "Audit" },
  { icon: Wrench, label: "Work Order" },
  { icon: Plus, label: "Register" },
];

function heatOpacity(v: number): string {
  return `${0.12 + v * 0.176}`;
}

function rowBorder(isLast: boolean): string | undefined {
  return isLast ? undefined : "1px solid hsl(var(--border))";
}

export function FaDashboardPage() {
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { data: resp } = useGetFADashboardQuery(organizationId);

  const d = resp?.data;
  const activity = d?.activity ?? RECENT_ACTIVITY;
  const categoryStats = d?.categoryStats ?? CATEGORY_STATS;
  const financialCategories = d?.financialCategories ?? FINANCIAL_CATEGORIES;
  const maintenanceUpcoming = d?.maintenanceUpcoming ?? MAINTENANCE_UPCOMING;
  const rfidReads = d?.rfidReads ?? RFID_READS;
  const sites = d?.sites ?? SITES;

  const topValue = ASSETS
    .filter((a) => a.val > 100_000_000)
    .sort((a, b) => b.val - a.val)
    .slice(0, 6);

  return (
    <div>
      <FaShellHead
        actions={
          <>
            <button
              className="ks-btn ks-btn-sm"
              type="button"
              onClick={() => toast("Data refreshed · 12,420 assets")}
            >
              <RefreshCw size={14} />
              Refresh
            </button>
            <button
              className="ks-btn ks-btn-sm"
              type="button"
              onClick={() => toast("Exporting dashboard · CSV")}
            >
              <Download size={14} />
              Export
            </button>
            <button
              className="ks-btn ks-btn-primary ks-btn-sm"
              type="button"
              onClick={() => toast("Register new asset · opening form")}
            >
              <Plus size={14} />
              Add Assets
            </button>
          </>
        }
        desc="12,420 assets · 12 sites · last sync 2s ago"
        title="Good afternoon, Bambang"
      />

      <FaKpiStrip>
        <FaStat label="Total assets" sub="4 net new today" tone="brand" value="12,420" />
        <FaStat label="Capital value" sub="PSAK 16 net book" tone="info" value={formatIDRShort(14_800_000_000)} />
        <FaStat label="Utilization" sub="+3.2% vs last wk" tone="success" value="72%" />
        <FaStat label="Active alerts" sub="3 critical" tone="danger" value="28" />
        <FaStat label="Audit progress" sub="Zone B3 done" tone="warn" value="78%" />
      </FaKpiStrip>

      <div className="ks-grid-2" style={{ marginBottom: 16 }}>
        <div className="ks-card">
          <div className="ks-card-head">
            <div>
              <div className="ks-card-title">Quick actions</div>
              <div className="ks-card-desc">Daily operations</div>
            </div>
          </div>
          <div className="ks-card-body">
            <div className="grid grid-cols-3 gap-2">
              {QUICK_ACTIONS.map((qa) => {
                const Icon = qa.icon;
                return (
                  <button
                    key={qa.label}
                    className="ks-btn"
                    style={{ justifyContent: "flex-start" }}
                    type="button"
                    onClick={() => toast(`${qa.label} · opening…`)}
                  >
                    <Icon size={14} />
                    {qa.label}
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-2" style={{ marginTop: 12 }}>
              <div
                className="rounded-lg border border-border p-3"
                style={{ background: "hsl(var(--brand-soft))" }}
              >
                <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                  <Zap size={14} style={{ color: "hsl(var(--brand))" }} />
                  <span className="text-xs font-semibold">AI Insight</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  3 assets trending toward failure within 7 days
                </p>
              </div>
              <div
                className="rounded-lg border border-border p-3"
                style={{ background: "hsl(var(--danger-soft))" }}
              >
                <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                  <FileText size={14} style={{ color: "hsl(var(--destructive))" }} />
                  <span className="text-xs font-semibold">Loss Prevention</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  1 exit alert · Forklift left geofence 4h ago
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="ks-card">
          <div className="ks-card-head">
            <div>
              <div className="ks-card-title">Recent activity</div>
              <div className="ks-card-desc">Live feed</div>
            </div>
            <span className="ks-badge success">Live</span>
          </div>
          <div className="ks-card-body" style={{ padding: 0 }}>
            {activity.map((it, i) => (
              <div
                key={i}
                className="flex items-center gap-3"
                style={{ borderBottom: rowBorder(i === activity.length - 1), padding: "10px 18px" }}
              >
                <span className={`ks-badge ${it.ic}`} style={{ flexShrink: 0 }}>
                  <FaProtoIcon name={it.icon} />
                </span>
                <span className="flex-1 text-sm" style={{ color: "hsl(var(--text))" }}>
                  {it.txt}
                </span>
                <span className="text-xs text-muted-foreground">{it.t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ks-grid-3" style={{ marginBottom: 16 }}>
        <div className="ks-card">
          <div className="ks-card-head">
            <div className="ks-card-title">Category distribution</div>
          </div>
          <div className="ks-card-body">
            {categoryStats.map((cs) => {
              const Icon = catToLucide[cs.cat] ?? catToLucide.furn;
              return (
                <div key={cs.cat} style={{ marginBottom: 12 }}>
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon size={14} style={{ color: "hsl(var(--text-3))" }} />
                      <span className="text-sm">{cs.n}</span>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">
                      {cs.v.toLocaleString()} · {cs.pct}%
                    </span>
                  </div>
                  <FaMeter pct={cs.pct} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="ks-card">
          <div className="ks-card-head">
            <div>
              <div className="ks-card-title">Utilization · 7 days</div>
              <div className="ks-card-desc">Check-in / check-out density</div>
            </div>
          </div>
          <div className="ks-card-body">
            <div className="flex gap-1" style={{ marginBottom: 6 }}>
              <span style={{ width: 28 }} />
              {["6a", "9a", "12p", "3p", "6p", "9p"].map((h) => (
                <span key={h} className="flex-1 text-center text-xs text-muted-foreground">{h}</span>
              ))}
            </div>
            {HEATMAP.map((row, ri) => (
              <div key={ri} className="flex items-center gap-1" style={{ marginBottom: 4 }}>
                <span className="text-xs text-muted-foreground" style={{ width: 28 }}>{DAYS[ri]}</span>
                {row.map((v, ci) => (
                  <div
                    key={ci}
                    className="flex-1"
                    style={{
                      background: `hsl(var(--brand) / ${heatOpacity(v)})`,
                      borderRadius: 3,
                      height: 22,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="ks-card">
          <div className="ks-card-head">
            <div className="ks-card-title">Top-value assets</div>
          </div>
          <div className="ks-card-body" style={{ padding: 0 }}>
            {topValue.map((a, i) => {
              const Icon = catToLucide[a.cat] ?? catToLucide.furn;
              return (
                <div
                  key={a.id}
                  className="flex items-center gap-3"
                  style={{ borderBottom: rowBorder(i === topValue.length - 1), padding: "10px 18px" }}
                >
                  <Icon size={14} style={{ color: "hsl(var(--text-3))" }} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm">{a.name}</div>
                    <div className="font-mono text-xs text-muted-foreground">{a.id}</div>
                  </div>
                  <span className="font-mono text-sm font-semibold">{formatIDRShort(a.val)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="ks-grid-2" style={{ marginBottom: 16 }}>
        <div className="ks-card">
          <div className="ks-card-head">
            <div>
              <div className="ks-card-title">Site rollup</div>
              <div className="ks-card-desc">{sites.length} sites</div>
            </div>
          </div>
          <div className="ks-card-body">
            <div className="grid grid-cols-3 gap-2">
              {sites.map((s) => (
                <div
                  key={s.n}
                  className="rounded-lg border border-border p-3"
                  style={{ background: "hsl(var(--surface))" }}
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-xs font-semibold">{s.n}</span>
                    <span className={`ks-badge ${s.status === "on" ? "success" : "danger"}`} style={{ fontSize: 10 }} />
                  </div>
                  <div className="text-xs text-muted-foreground">{s.city}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <div className="font-mono text-sm">{s.assets}</div>
                      <div className="text-xs text-muted-foreground">{formatIDRShort(s.val)}</div>
                    </div>
                    <span className="font-mono text-xs">{s.pct}%</span>
                  </div>
                  {s.sub && (
                    <div className="mt-1 text-xs" style={{ color: "hsl(var(--destructive))" }}>{s.sub}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="ks-card">
          <div className="ks-card-head">
            <div>
              <div className="ks-card-title">Live RFID gate reads</div>
              <div className="ks-card-desc">Real-time custody events</div>
            </div>
          </div>
          <div className="ks-card-body" style={{ padding: 0 }}>
            {rfidReads.map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-3"
                style={{ borderBottom: rowBorder(i === rfidReads.length - 1), padding: "10px 18px" }}
              >
                <span className={`ks-badge ${r.dir === "in" ? "success" : "warn"}`} style={{ flexShrink: 0 }}>
                  {r.dir === "in" ? "IN" : "OUT"}
                </span>
                <span className="flex-1 font-mono text-sm">{r.a}</span>
                <span className="text-xs text-muted-foreground">{r.g}</span>
                <span
                  className="flex items-center justify-center text-xs font-semibold text-white"
                  style={{ background: avatarColor(i), borderRadius: "50%", height: 24, width: 24 }}
                >
                  {initials(r.who)}
                </span>
                <span className="font-mono text-xs text-muted-foreground">{r.t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ks-grid-2">
        <div className="ks-card">
          <div className="ks-card-head">
            <div>
              <div className="ks-card-title">Financial summary</div>
              <div className="ks-card-desc">PSAK 16 · net book value by class</div>
            </div>
          </div>
          <div className="ks-card-body">
            {financialCategories.map((fc) => (
              <div key={fc.n} style={{ marginBottom: 14 }}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm">{fc.n}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {formatIDRShort(fc.nbv)} / {formatIDRShort(fc.cost)}
                  </span>
                </div>
                <FaMeter
                  pct={fc.pct}
                  tone={fc.pct >= 60 ? "success" : fc.pct >= 40 ? "brand" : "warn"}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="ks-card">
          <div className="ks-card-head">
            <div>
              <div className="ks-card-title">Maintenance</div>
              <div className="ks-card-desc">Next 30 days</div>
            </div>
          </div>
          <div className="ks-card-body" style={{ padding: 0 }}>
            {maintenanceUpcoming.map((m, i) => (
              <div
                key={i}
                className="flex items-center gap-3"
                style={{ borderBottom: rowBorder(i === maintenanceUpcoming.length - 1), padding: "10px 18px" }}
              >
                <span className={`ks-badge ${m.tone || "outline"}`} style={{ flexShrink: 0 }}>
                  <FaProtoIcon name={m.icon} />
                </span>
                <span className="flex-1 text-sm">{m.t}</span>
                <div className="text-right">
                  <div className="font-mono text-xs">{m.dt}</div>
                  <div className="text-xs text-muted-foreground">{m.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
