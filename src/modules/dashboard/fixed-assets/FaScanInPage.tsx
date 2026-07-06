/* eslint-disable max-lines */
"use client";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Download,
  Radio,
  Upload,
} from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";
import { toast } from "sonner";

import { useUser } from "@/context/user-context";
import {
  useDeployScanInMutation,
  useGetPOQuery,
  useGetScanInHistoryQuery,
  useImportPOMutation,
} from "@/hooks/api/fixed-assets";
import {
  catToLucide,
  catToneClass,
  FaShellHead,
  formatIDR,
  formatIDRShort,
} from "@/modules/dashboard/fixed-assets";
import { CAT_LABEL } from "@/modules/dashboard/fixed-assets/constants";
import type { DeployScanInRequest } from "@/types/fixed-assets";

interface PoLineItem {
  cat: string;
  id: string;
  name: string;
  qty: number;
  size: string;
  tagType: string;
  unit: number;
}

interface PoRecord {
  date: string;
  id: string;
  items: number;
  status: string;
  supplier: string;
  value: number;
}

interface ScanEntry {
  epc: string;
  id: string;
  name: string;
  rssi: number;
  t: string;
}

const STEPS = ["Select PO", "Tagging RFID", "QC + Deploy"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="ks-card">
      <div className="ks-card-body">
        <div className="flex items-center">
          {STEPS.map((label, i) => {
            const done = i < current;
            const active = i === current;
            return (
              <div key={label} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                      done
                        ? "bg-[hsl(var(--brand))] text-white"
                        : active
                          ? "border-2 border-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.1)] text-[hsl(var(--brand))]"
                          : "border border-border bg-muted text-muted-foreground"
                    }`}
                  >
                    {done ? <CheckCircle2 size={16} /> : i + 1}
                  </div>
                  <span className={`text-sm font-medium ${active ? "text-foreground" : "text-muted-foreground"}`}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="mx-4 h-px w-16 bg-border sm:w-24" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ScanPortal({ scanning }: { scanning: boolean }) {
  return (
    <div className="relative flex items-center justify-center py-6">
      <svg height={180} width={180}>
        <circle cx={90} cy={90} fill="none" r={80} stroke="hsl(var(--brand))" strokeOpacity={0.12} strokeWidth={2} />
        <circle cx={90} cy={90} fill="none" r={58} stroke="hsl(var(--brand))" strokeOpacity={0.2} strokeWidth={2} />
        <circle cx={90} cy={90} fill="none" r={38} stroke="hsl(var(--brand))" strokeOpacity={0.35} strokeWidth={2} />
        <circle cx={90} cy={90} fill="hsl(var(--brand))" fillOpacity={scanning ? 0.2 : 0.08} r={22} stroke="hsl(var(--brand))" strokeWidth={2} />
      </svg>
      <div className="absolute">
        <Radio className={scanning ? "animate-pulse text-[hsl(var(--brand))]" : "text-muted-foreground"} size={32} />
      </div>
    </div>
  );
}

export function FaScanInPage() {
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { data: poResp } = useGetPOQuery({ organizationId });
  const { mutateAsync: deployScanIn } = useDeployScanInMutation({
    organizationId,
  });
  const { mutateAsync: importPO } = useImportPOMutation({ organizationId });
  const { data: historyResp } = useGetScanInHistoryQuery({ organizationId });
  const RECENT_SCANS: ScanEntry[] = (historyResp?.data?.history ?? []).map((h) => ({
    epc: h.epc,
    id: h.asset_id,
    name: h.asset_name,
    rssi: 0,
    t: h.deployed_at,
  }));
  const apiPOs = poResp?.data?.purchase_orders ?? [];

  const PO_QUEUE: PoRecord[] = apiPOs.map((p) => ({
    date: p.date,
    id: p.id,
    items: p.lines.length,
    status: p.status,
    supplier: p.supplier,
    value: p.lines.reduce((s, l) => s + l.unit_cost * l.qty, 0),
  }));

  const [step, setStep] = useState(0);
  const [selectedPo, setSelectedPo] = useState(0);
  const [scannedCount, setScannedCount] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [custodian, setCustodian] = useState("Dewi Anggraini");
  const [loc, setLoc] = useState("JKT-HQ · Floor 8");
  const [costCenter, setCostCenter] = useState("CC-8100 · Engineering");
  const [qcPassed, setQcPassed] = useState(true);
  const poFileRef = useRef<HTMLInputElement>(null);

  const selectedPO = apiPOs[selectedPo];
  const PO_LINES: PoLineItem[] = (selectedPO?.lines ?? []).map((l) => ({
    cat: l.cat,
    id: l.id,
    name: `${CAT_LABEL[l.cat] ?? l.cat} · ${l.tag_type}`,
    qty: l.qty,
    size: l.size,
    tagType: l.tag_type,
    unit: l.unit_cost,
  }));

  const totalItems = PO_LINES.reduce((s, l) => s + l.qty, 0);
  const po = PO_QUEUE[selectedPo] ?? { date: "", id: "", items: 0, status: "", supplier: "", value: 0 };
  const remaining = totalItems - scannedCount;
  const pct = totalItems > 0 ? (scannedCount / totalItems) * 100 : 0;

  const handleDeploy = async () => {
    const assets: DeployScanInRequest["assets"] = [];
    let count = 0;
    for (const line of PO_LINES) {
      for (let i = 0; i < line.qty && count < scannedCount; i++) {
        assets.push({
          epc: `E280-${line.id}-${count}`,
          line_id: line.id,
          name: line.name,
          serial: `SN-${line.id}-${count}`,
          tid: `TID-${line.id}-${count}`,
          val: line.unit,
        });
        count++;
      }
    }
    await deployScanIn({
      assets,
      cost_center: costCenter,
      custodian,
      loc,
      po_id: po.id,
      qc_passed: qcPassed,
    });
    setScannedCount(0);
    setStep(0);
  };

  const handleImportPO = () => {
    poFileRef.current?.click();
  };

  const handlePOFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await importPO({ file });
    e.target.value = "";
  };

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScannedCount((c) => Math.min(c + 1, totalItems));
      toast.success("Tag encoded · EPC written");
    }, 700);
  };

  return (
    <div className="space-y-4">
      <FaShellHead
        actions={
          <>
            <button
              className="ks-btn ks-btn-ghost"
              type="button"
              onClick={handleImportPO}
            >
              <Upload size={15} />
              Import PO
            </button>
            <input
              ref={poFileRef}
              accept=".csv,.xlsx,.xls"
              className="hidden"
              type="file"
              onChange={handlePOFileChange}
            />
            <button
              className="ks-btn ks-btn-ghost"
              type="button"
            >
              <Download size={15} />
              History
            </button>
          </>
        }
        desc="RFID tagging workflow — receive, tag, and deploy new assets"
        title="Scan-In · Asset Receiving"
      />

      <StepIndicator current={step} />

      {step === 0 && (
        <div className="ks-grid-2">
          <div className="ks-card">
            <div className="ks-card-head">
              <div>
                <div className="ks-card-title">PO Queue</div>
                <div className="ks-card-desc">{PO_QUEUE.length} awaiting receiving</div>
              </div>
            </div>
            <div className="ks-card-body space-y-2">
              {PO_QUEUE.map((p, i) => (
                <button
                  key={p.id}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    i === selectedPo
                      ? "border-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.06)]"
                      : "border-border hover:bg-muted"
                  }`}
                  type="button"
                  onClick={() => setSelectedPo(i)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{p.id}</span>
                    <span className={`ks-badge ${p.status === "received" ? "success" : "warn"}`}>
                      {p.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{p.supplier}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{p.items} items</span>
                    <span>·</span>
                    <span>{formatIDRShort(p.value)}</span>
                    <span>·</span>
                    <span>{p.date}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="ks-card">
            <div className="ks-card-head">
              <div>
                <div className="ks-card-title">{po.id} · Detail</div>
                <div className="ks-card-desc">{po.supplier} · {po.date}</div>
              </div>
              <span className={`ks-badge ${po.status === "received" ? "success" : "warn"}`}>
                {po.status}
              </span>
            </div>
            <div className="ks-card-body">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left font-medium text-muted-foreground p-3">Item</th>
                    <th className="text-left font-medium text-muted-foreground p-3">Qty</th>
                    <th className="text-left font-medium text-muted-foreground p-3">Tag</th>
                    <th className="text-right font-medium text-muted-foreground p-3">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {PO_LINES.map((line) => {
                    const Icon = catToLucide[line.cat] ?? catToLucide.furn;
                    return (
                      <tr key={line.id}>
                        <td className="p-3 border-t border-border">
                          <div className="flex items-center gap-2">
                            <Icon size={14} />
                            <span className="font-medium">{line.name}</span>
                            <span className={`ks-badge ${catToneClass(line.cat)}`}>{CAT_LABEL[line.cat]}</span>
                          </div>
                        </td>
                        <td className="p-3 border-t border-border">{line.qty}</td>
                        <td className="p-3 border-t border-border text-muted-foreground">{line.size}</td>
                        <td className="p-3 border-t border-border text-right">{formatIDR(line.unit)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <div className="text-sm text-muted-foreground">
                  Total <span className="font-semibold text-foreground">{totalItems} units</span>
                </div>
                <button
                  className="ks-btn ks-btn-primary"
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setScannedCount(0);
                    toast.success("RFID tagging station ready");
                  }}
                >
                  Start tagging
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="ks-grid-2">
          <div className="ks-card">
            <div className="ks-card-head">
              <div>
                <div className="ks-card-title">Item Info</div>
                <div className="ks-card-desc">Tagging targets for {po.id}</div>
              </div>
            </div>
            <div className="ks-card-body space-y-3">
              {PO_LINES.map((line) => {
                const Icon = catToLucide[line.cat] ?? catToLucide.furn;
                return (
                  <div key={line.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon size={14} />
                        <span className={`ks-badge ${catToneClass(line.cat)}`}>{CAT_LABEL[line.cat]}</span>
                        <span className="font-medium">{line.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{line.qty} units</span>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">Tag: {line.size} · Chip: {line.tagType}</div>
                  </div>
                );
              })}
              <div className="flex items-center gap-2 pt-1">
                <button
                  className="ks-btn ks-btn-ghost"
                  type="button"
                  onClick={() => setStep(0)}
                >
                  <ArrowLeft size={15} />
                  Back
                </button>
                <button
                  className="ks-btn ks-btn-primary"
                  type="button"
                  onClick={() => setStep(2)}
                >
                  QC + Deploy
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>

          <div className="ks-card">
            <div className="ks-card-head">
              <div>
                <div className="ks-card-title">RFID Tagging Station</div>
                <div className="ks-card-desc">Place blank tag on writer pad</div>
              </div>
            </div>
            <div className="ks-card-body">
              <ScanPortal scanning={scanning} />
              <div className="flex flex-col items-center gap-3">
                <div className="text-2xl font-bold">{scannedCount}<span className="text-muted-foreground"> / {totalItems}</span></div>
                <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-[hsl(var(--brand))]"
                    style={{ transition: "width .3s", width: `${pct}%` }}
                  />
                </div>
                <button
                  className="ks-btn ks-btn-primary"
                  disabled={scanning || scannedCount >= totalItems}
                  type="button"
                  onClick={handleScan}
                >
                  <Radio size={16} />
                  {scanning ? "Writing EPC…" : "Scan & encode"}
                </button>
              </div>
              <div className="mt-4 border-t border-border pt-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">Recently scanned</p>
                <div className="space-y-1">
                  {RECENT_SCANS.map((s) => (
                    <div key={s.id} className="flex items-center justify-between rounded px-2 py-1.5 text-xs hover:bg-muted">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="text-[hsl(var(--success))]" size={13} />
                        <span className="font-medium">{s.id}</span>
                        <span className="text-muted-foreground">{s.name}</span>
                      </div>
                      <span className="text-muted-foreground">RSSI {s.rssi}dBm · {s.t} ago</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="ks-grid-2">
          <div className="ks-card">
            <div className="ks-card-head">
              <div>
                <div className="ks-card-title">QC + Deploy</div>
                <div className="ks-card-desc">Assign custody and confirm quality</div>
              </div>
            </div>
            <div className="ks-card-body space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Custodian</label>
                <input
                  className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-[hsl(var(--brand))]"
                  placeholder="Search employee"
                  value={custodian}
                  onChange={(e) => setCustodian(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Location</label>
                <select
                  className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-[hsl(var(--brand))]"
                  value={loc}
                  onChange={(e) => setLoc(e.target.value)}
                >
                  <option>JKT-HQ · Floor 8</option>
                  <option>JKT-HQ · Floor 12</option>
                  <option>BDG-Office</option>
                  <option>JKT-Workshop</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Cost Center</label>
                <select
                  className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-[hsl(var(--brand))]"
                  value={costCenter}
                  onChange={(e) => setCostCenter(e.target.value)}
                >
                  <option>CC-8100 · Engineering</option>
                  <option>CC-8200 · Operations</option>
                  <option>CC-8300 · Facilities</option>
                </select>
              </div>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border p-3 text-sm">
                <input
                  checked={qcPassed}
                  type="checkbox"
                  onChange={(e) => setQcPassed(e.target.checked)}
                />
                <span>QC inspection passed — packaging & accessory complete</span>
              </label>
              <button
                className="ks-btn ks-btn-ghost mt-1"
                type="button"
                onClick={() => setStep(1)}
              >
                <ArrowLeft size={15} />
                Back
              </button>
            </div>
          </div>

          <div className="ks-card">
            <div className="ks-card-head">
              <div>
                <div className="ks-card-title">Deploy Summary</div>
                <div className="ks-card-desc">Ready to register {scannedCount} assets</div>
              </div>
            </div>
            <div className="ks-card-body space-y-3">
              <div className="ks-grid-3">
                <div className="rounded-lg border border-border p-3 text-center">
                  <p className="text-2xl font-bold">{totalItems}</p>
                  <p className="text-xs text-muted-foreground">Total units</p>
                </div>
                <div className="rounded-lg border border-border p-3 text-center">
                  <p className="text-2xl font-bold text-[hsl(var(--brand))]">{scannedCount}</p>
                  <p className="text-xs text-muted-foreground">Tagged</p>
                </div>
                <div className="rounded-lg border border-border p-3 text-center">
                  <p className="text-2xl font-bold text-[hsl(var(--success))]">{remaining}</p>
                  <p className="text-xs text-muted-foreground">Remaining</p>
                </div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">Acquisition value</p>
                <p className="mt-1 text-xl font-bold">{formatIDR(PO_LINES.reduce((s, l) => s + l.unit * l.qty, 0))}</p>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-[hsl(var(--brand)/0.3)] bg-[hsl(var(--brand)/0.06)] p-3 text-sm">
                <CheckCircle2 className="text-[hsl(var(--success))]" size={16} />
                <span>All {scannedCount} tags encoded · EPCIS events queued</span>
              </div>
              <button
                className="ks-btn ks-btn-primary w-full"
                type="button"
                onClick={handleDeploy}
              >
                <CheckCircle2 size={16} />
                Deploy to register
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
