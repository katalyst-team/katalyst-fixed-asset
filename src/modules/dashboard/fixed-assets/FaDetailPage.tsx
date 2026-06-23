"use client";

import { ArrowLeft, FileText, Pencil, Wrench } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import Loading from "@/components/shared/Loading";
import { useUser } from "@/context/user-context";
import {
  useGetAssetDetailQuery,
  useGetAssetDocDownloadQuery,
  useUpdateAssetMutation,
} from "@/hooks/api/fixed-assets";
import {
  catToLucide,
  FaMeter,
  FaProtoIcon,
  formatAge,
  formatIDRShort,
} from "@/modules/dashboard/fixed-assets";
import {
  CAT_LABEL,
  STATUS_LABEL,
  STATUS_TONE,
} from "@/modules/dashboard/fixed-assets/constants";
import { FaQueryError } from "@/modules/dashboard/fixed-assets/FaQueryState";
import { useFaModal } from "@/modules/dashboard/fixed-assets/modals";
import { safeOpenUrl } from "@/modules/dashboard/fixed-assets/safeOpenUrl";
import type { FaAsset, FaAssetDetail } from "@/types/fixed-assets";

const TABS = ["Overview", "Activity", "Maintenance", "Depreciation", "Documents"] as const;
type Tab = (typeof TABS)[number];

const LIFECYCLE = (a: FaAsset) => [
  { label: `Purchased · ${a.purchased}`, sub: a.supplier },
  { label: "Tagged & registered", sub: a.epc },
  { label: `Deployed · ${a.loc}`, sub: `Custodian: ${a.custodian}` },
  { label: `Current: ${STATUS_LABEL[a.status]}`, sub: `Age ${formatAge(a.age)}` },
];

function MetaRow({ label, val }: { label: string; val: string }) {
  return (
    <div
      className="flex items-center justify-between"
      style={{ borderBottom: "1px solid hsl(var(--border))", padding: "6px 0" }}
    >
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{val}</span>
    </div>
  );
}

function StatMini({ label, val }: { label: string; val: string }) {
  return (
    <div className="rounded-lg border border-border p-3" style={{ background: "hsl(var(--surface-2))" }}>
      <div className="mb-1 text-xs text-muted-foreground">{label}</div>
      <div className="font-mono text-lg font-semibold">{val}</div>
    </div>
  );
}

function DepChart({ asset }: { asset: FaAsset }) {
  const life = 5;
  const annual = asset.val / life;
  const h = 90;
  const w = 280;
  const pad = 10;
  const pts = Array.from({ length: life + 1 }, (_, y) => Math.max(0, asset.val - annual * y));
  const coords = pts.map((v, i) => ({
    x: pad + (i / life) * (w - pad * 2),
    y: pad + (1 - v / asset.val) * (h - pad * 2),
  }));
  const line = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");
  const lastX = coords[coords.length - 1].x.toFixed(1);
  const firstX = coords[0].x.toFixed(1);
  const area = `${line} L ${lastX} ${h - pad} L ${firstX} ${h - pad} Z`;
  return (
    <svg height={h} width={w}>
      <path d={area} fill="hsl(var(--brand-soft))" />
      <path d={line} fill="none" stroke="hsl(var(--brand))" strokeWidth={2} />
      {coords.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} fill="hsl(var(--brand))" r={2.5} />
      ))}
    </svg>
  );
}

function woBadge(status: string): string {
  if (status === "done") return "success";
  if (status === "in-progress") return "info";
  return "warn";
}

function prioBadge(p: string): string {
  if (p === "critical") return "danger";
  if (p === "high") return "warn";
  return "outline";
}

export function FaDetailPage() {
  const router = useRouter();
  const { openModal } = useFaModal();
  const assetId = typeof router.query.id === "string" ? router.query.id : "";
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { data: resp, isError, isLoading } = useGetAssetDetailQuery({ assetId, organizationId });
  const { mutateAsync: updateAsset } = useUpdateAssetMutation({ organizationId });
  const [tab, setTab] = useState<Tab>("Overview");
  const [docToDownload, setDocToDownload] = useState("");
  const { data: docResp } = useGetAssetDocDownloadQuery({
    assetId,
    docId: docToDownload,
    enabled: Boolean(docToDownload),
    organizationId,
  });

  useEffect(() => {
    if (docResp?.data?.download_url) {
      safeOpenUrl(docResp.data.download_url);
      setDocToDownload("");
    }
  }, [docResp]);

  const asset: FaAssetDetail | undefined = resp?.data?.asset ?? undefined;

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <FaQueryError />;
  }

  if (!asset) {
    return (
      <div className="ks-card">
        <div className="ks-card-body">
          <p className="text-sm text-muted-foreground">Asset not found.</p>
          <button
            className="ks-btn ks-btn-sm"
            style={{ marginTop: 12 }}
            type="button"
            onClick={() => router.back()}
          >
            <ArrowLeft size={14} />
            Back
          </button>
        </div>
      </div>
    );
  }

  const CatIcon = catToLucide[asset.cat] ?? catToLucide.furn;
  const nbv = asset.val - asset.dep;
  const depPct = Math.round((asset.dep / asset.val) * 100);
  const relatedWOs = asset && "maintenanceHistory" in asset ? (asset.maintenanceHistory ?? []) : [];
  const steps = LIFECYCLE(asset);

  return (
    <div>
      <div className="ks-page-head">
        <div>
          <button
            className="ks-btn ks-btn-ghost ks-btn-sm"
            style={{ marginBottom: 8 }}
            type="button"
            onClick={() => router.back()}
          >
            <ArrowLeft size={14} />
            Back
          </button>
          <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
            <h1 className="ks-page-title">{asset.name}</h1>
            <span className={`ks-badge ${STATUS_TONE[asset.status]}`}>{STATUS_LABEL[asset.status]}</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
            <span>{asset.id}</span>
            <span>·</span>
            <span>{asset.epc}</span>
            <span>·</span>
            <span>S/N {asset.serial}</span>
          </div>
        </div>
        <div className="ks-page-actions">
          <button className="ks-btn ks-btn-sm" type="button" onClick={() => openModal("disposal")}>Dispose</button>
          <button className="ks-btn ks-btn-sm" type="button" onClick={() => openModal("transfer")}>Transfer</button>
          <button className="ks-btn ks-btn-sm" type="button" onClick={() => openModal("workOrder")}>Service</button>
          <button className="ks-btn ks-btn-primary ks-btn-sm" type="button" onClick={() => updateAsset({ assetId: asset.id, data: {} })}>
            <Pencil size={14} />
            Edit
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "340px 1fr" }}>
        <div className="ks-card">
          <div className="ks-card-body">
            <div
              className="flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, hsl(var(--brand-soft)) 0%, hsl(var(--surface-2)) 100%)",
                borderRadius: 12,
                height: 180,
                marginBottom: 12,
              }}
            >
              <CatIcon size={48} style={{ color: "hsl(var(--brand))" }} />
            </div>
            <div
              className="flex items-center justify-center text-xs text-muted-foreground"
              style={{ border: "1px dashed hsl(var(--border))", borderRadius: 8, height: 60, marginBottom: 12 }}
            >
              QR Code
            </div>
            <MetaRow label="Category" val={CAT_LABEL[asset.cat]} />
            <MetaRow label="Location" val={asset.loc} />
            <MetaRow label="Custodian" val={asset.custodian} />
            <MetaRow label="Serial No." val={asset.serial} />
            <MetaRow label="EPC" val={asset.epc} />
            <MetaRow label="Acquired" val={asset.purchased} />
            <MetaRow label="Supplier" val={asset.supplier} />
            <MetaRow label="Warranty" val={asset.warranty} />
            <div style={{ marginTop: 12 }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                <span className="text-xs text-muted-foreground">Purchase value</span>
                <span className="font-mono text-sm">{formatIDRShort(asset.val)}</span>
              </div>
              <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                <span className="text-xs text-muted-foreground">Accumulated dep.</span>
                <span className="font-mono text-sm text-muted-foreground">−{formatIDRShort(asset.dep)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">Net book value</span>
                <span className="font-mono text-sm font-semibold">{formatIDRShort(nbv)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="ks-card">
          <div className="ks-card-head">
            <div className="ks-seg">
              {TABS.map((t) => (
                <button
                  key={t}
                  className={tab === t ? "on" : ""}
                  type="button"
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="ks-card-body">
            {tab === "Overview" && (
              <div>
                <div className="grid grid-cols-4 gap-2" style={{ marginBottom: 16 }}>
                  <StatMini label="Health" val="98%" />
                  <StatMini label="Age" val={formatAge(asset.age)} />
                  <StatMini label="Utilization" val="82%" />
                  <StatMini label="Last seen" val="live" />
                </div>
                <div className="mb-2 text-sm font-semibold">Lifecycle timeline</div>
                <div style={{ paddingLeft: 16, position: "relative" }}>
                  <div style={{ background: "hsl(var(--border))", bottom: 4, left: 5, position: "absolute", top: 4, width: 2 }} />
                  {steps.map((step, i) => (
                    <div key={i} style={{ paddingBottom: 14, position: "relative" }}>
                      <div
                        style={{
                          background: i === steps.length - 1 ? "hsl(var(--brand))" : "hsl(var(--surface-2))",
                          border: "2px solid hsl(var(--border))",
                          borderRadius: "50%",
                          height: 10,
                          left: -14,
                          position: "absolute",
                          top: 4,
                          width: 10,
                        }}
                      />
                      <div className="text-sm">{step.label}</div>
                      <div className="text-xs text-muted-foreground">{step.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "Activity" && (
              <div>
                {(asset && "activityLog" in asset ? (asset.activityLog ?? []) : []).slice(0, 6).map((it, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3"
                    style={{ borderBottom: "1px solid hsl(var(--border))", padding: "8px 0" }}
                  >
                    <span className={`ks-badge ${it.ic}`} style={{ flexShrink: 0 }}>
                      <FaProtoIcon name={it.icon} />
                    </span>
                    <span className="flex-1 text-sm">{it.txt}</span>
                    <span className="text-xs text-muted-foreground">{it.t}</span>
                  </div>
                ))}
              </div>
            )}

            {tab === "Maintenance" && (
              <div>
                {relatedWOs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center" style={{ padding: 40 }}>
                    <Wrench size={32} style={{ color: "hsl(var(--text-3))", marginBottom: 8 }} />
                    <p className="text-sm text-muted-foreground">No work orders for this asset.</p>
                    <button
                      className="ks-btn ks-btn-primary ks-btn-sm"
                      style={{ marginTop: 12 }}
                      type="button"
                      onClick={() => openModal("workOrder")}
                    >
                      <Wrench size={14} />
                      Create Work Order
                    </button>
                  </div>
                ) : (
                  relatedWOs.map((wo) => (
                    <div
                      key={wo.id}
                      className="flex items-center gap-3"
                      style={{ borderBottom: "1px solid hsl(var(--border))", padding: "8px 0" }}
                    >
                      <span className={`ks-badge ${prioBadge(wo.priority)}`} style={{ flexShrink: 0 }}>
                        {wo.priority}
                      </span>
                      <div className="flex-1">
                        <div className="text-sm">{wo.desc}</div>
                        <div className="font-mono text-xs text-muted-foreground">
                          {wo.id} · {wo.assignedTo} · ETA {wo.eta}
                        </div>
                      </div>
                      <span className={`ks-badge ${woBadge(wo.status)}`}>{wo.status}</span>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === "Depreciation" && (
              <div>
                <div className="grid grid-cols-4 gap-2" style={{ marginBottom: 16 }}>
                  <StatMini label="Purchase" val={formatIDRShort(asset.val)} />
                  <StatMini label="Annual dep." val={formatIDRShort(asset.val / 5)} />
                  <StatMini label="NBV" val={formatIDRShort(nbv)} />
                  <StatMini label="Dep. rate" val={`${depPct}%`} />
                </div>
                <div className="mb-2 text-sm font-semibold">Net book value · 5-year projection</div>
                <DepChart asset={asset} />
                <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                  {["Y0", "Y1", "Y2", "Y3", "Y4", "Y5"].map((yl) => (
                    <span key={yl}>{yl}</span>
                  ))}
                </div>
                <div style={{ marginTop: 16 }}>
                  <div className="mb-2 text-sm font-semibold">Depreciation progress</div>
                  <FaMeter pct={depPct} tone="brand" />
                </div>
              </div>
            )}

            {tab === "Documents" && (
              <div className="grid grid-cols-3 gap-2">
                {(asset && "docs" in asset ? (asset.docs ?? []) : []).map((doc, i) => (
                  <button
                    key={i}
                    className="rounded-lg border border-border p-3 text-left"
                    style={{ background: "hsl(var(--surface))" }}
                    type="button"
                    onClick={() => setDocToDownload(doc.n)}
                  >
                    <FileText size={20} style={{ color: "hsl(var(--text-3))", marginBottom: 6 }} />
                    <div className="truncate text-sm font-medium">{doc.n}</div>
                    <div className="text-xs text-muted-foreground">{doc.d}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
