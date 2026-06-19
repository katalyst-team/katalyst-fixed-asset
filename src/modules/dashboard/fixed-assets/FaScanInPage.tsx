"use client";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Download,
  Radio,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  catToLucide,
  catToneClass,
  FaShellHead,
  formatIDR,
  formatIDRShort,
} from "@/modules/dashboard/fixed-assets";
import {
  CAT_LABEL,
  RFID_ORDER_ITEMS,
} from "@/services/fixed-assets/mock";

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

const PO_QUEUE: PoRecord[] = [
  { date: "12 Jan 2025", id: "PO-2025-0042", items: 24, status: "received", supplier: "PT. Apple Indonesia", value: 1209600000 },
  { date: "10 Jan 2025", id: "PO-2025-0038", items: 18, status: "partial", supplier: "PT. Astra Hilti", value: 176400000 },
  { date: "08 Jan 2025", id: "PO-2025-0031", items: 48, status: "received", supplier: "PT. Aeron Mebel", value: 1070400000 },
  { date: "04 Jan 2025", id: "PO-2025-0024", items: 2, status: "received", supplier: "PT. Astra Toyota", value: 890000000 },
];

const PO_LINES: PoLineItem[] = RFID_ORDER_ITEMS.map((r) => ({
  cat: r.cat,
  id: r.id,
  name: `${CAT_LABEL[r.cat]} · ${r.tagType}`,
  qty: r.qty,
  size: r.size,
  tagType: r.tagType,
  unit:
    r.cat === "it"
      ? 50400000
      : r.cat === "veh"
        ? 445000000
        : r.cat === "furn"
          ? 22300000
          : 9800000,
}));

const RECENT_SCANS: ScanEntry[] = [
  { epc: "E280-1170-0000-50CA-9847", id: "IT-LP-9847", name: 'MacBook Pro 16" M3 Max', rssi: -48, t: "2s" },
  { epc: "E280-1170-0000-50CA-0142", id: "TL-DR-0142", name: "Hilti TE 6-A22 Hammer Drill", rssi: -52, t: "5s" },
  { epc: "E280-1170-0000-50CA-1284", id: "IT-MN-1284", name: 'Dell U3223QE 32" Monitor', rssi: -46, t: "8s" },
];

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
  const [step, setStep] = useState(0);
  const [selectedPo, setSelectedPo] = useState(0);
  const [scannedCount, setScannedCount] = useState(0);
  const [scanning, setScanning] = useState(false);

  const totalItems = PO_LINES.reduce((s, l) => s + l.qty, 0);
  const po = PO_QUEUE[selectedPo];
  const remaining = totalItems - scannedCount;
  const pct = totalItems > 0 ? (scannedCount / totalItems) * 100 : 0;

  const handleDeploy = () => {
    toast.success(`Deployed ${scannedCount} assets to register`);
    setScannedCount(0);
    setStep(0);
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
              onClick={() => toast.info("Opening Import PO dialog")}
            >
              <Upload size={15} />
              Import PO
            </button>
            <button
              className="ks-btn ks-btn-ghost"
              type="button"
              onClick={() => toast.info("Loading receiving history")}
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
                  defaultValue="Dewi Anggraini"
                  placeholder="Search employee"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Location</label>
                <select
                  className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-[hsl(var(--brand))]"
                  defaultValue="JKT-HQ · Floor 8"
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
                  defaultValue="CC-8100 · Engineering"
                >
                  <option>CC-8100 · Engineering</option>
                  <option>CC-8200 · Operations</option>
                  <option>CC-8300 · Facilities</option>
                </select>
              </div>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border p-3 text-sm">
                <input defaultChecked type="checkbox" />
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
