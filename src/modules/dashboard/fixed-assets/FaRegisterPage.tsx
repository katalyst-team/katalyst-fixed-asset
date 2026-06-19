"use client";

import { ChevronRight, Download, Filter, Plus, Search, Upload } from "lucide-react";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  avatarColor,
  catToLucide,
  catToneClass,
  formatIDRShort,
  initials,
} from "@/modules/dashboard/fixed-assets";
import {
  ASSETS,
  CAT_LABEL,
  STATUS_LABEL,
  STATUS_TONE,
} from "@/services/fixed-assets/mock";

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const h = 20;
  const w = 56;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg height={h} width={w}>
      <polyline
        fill="none"
        points={pts}
        stroke="hsl(var(--brand))"
        strokeWidth={1.5}
      />
    </svg>
  );
}

export function FaRegisterPage() {
  const router = useRouter();

  const [cat, setCat] = useState("");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState("");

  const filtered = useMemo(() => {
    return ASSETS.filter((a) => {
      if (q) {
        const ql = q.toLowerCase();
        if (!a.name.toLowerCase().includes(ql) && !a.id.toLowerCase().includes(ql)) {
          return false;
        }
      }
      if (cat && a.cat !== cat) return false;
      if (status && a.status !== status) return false;
      return true;
    });
  }, [q, cat, status]);

  const allChecked = filtered.length > 0 && filtered.every((a) => sel.has(a.id));

  const toggleAll = () => {
    setSel(allChecked ? new Set() : new Set(filtered.map((a) => a.id)));
  };

  const toggleOne = (id: string) => {
    setSel((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const goDetail = (id: string) => {
    router.push(`/dashboard/fixed-assets/register/${id}/`);
  };

  return (
    <div>
      <div className="ks-page-head">
        <div>
          <h1 className="ks-page-title">Asset Register</h1>
          <p className="ks-page-desc">{ASSETS.length} assets · searchable inventory</p>
        </div>
        <div className="ks-page-actions">
          <button
            className="ks-btn ks-btn-sm"
            type="button"
            onClick={() => toast("Import · opening CSV uploader")}
          >
            <Upload size={14} />
            Import
          </button>
          <button
            className="ks-btn ks-btn-sm"
            type="button"
            onClick={() => toast("Exporting register · CSV")}
          >
            <Download size={14} />
            Export
          </button>
          <button
            className="ks-btn ks-btn-primary ks-btn-sm"
            type="button"
            onClick={() => toast("Add asset · opening form")}
          >
            <Plus size={14} />
            Add Assets
          </button>
        </div>
      </div>

      <div className="ks-filterbar" style={{ marginBottom: 16 }}>
        <div className="ks-search-box" style={{ flex: 1, maxWidth: 320 }}>
          <Search size={14} />
          <input
            placeholder="Search by name or ID…"
            style={{
              background: "transparent",
              border: 0,
              color: "hsl(var(--text))",
              flex: 1,
              fontFamily: "inherit",
              fontSize: 13,
              outline: 0,
            }}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select
          className="ks-btn ks-btn-sm"
          style={{ appearance: "none" }}
          value={cat}
          onChange={(e) => setCat(e.target.value)}
        >
          <option value="">All categories</option>
          {Object.entries(CAT_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          className="ks-btn ks-btn-sm"
          style={{ appearance: "none" }}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <button
          className="ks-btn ks-btn-sm"
          type="button"
          onClick={() => toast("More filters · opening")}
        >
          <Filter size={14} />
          More
        </button>
        <span className="text-xs text-muted-foreground" style={{ marginLeft: "auto" }}>
          {filtered.length} of {ASSETS.length} assets
        </span>
      </div>

      {sel.size > 0 && (
        <div
          className="flex items-center gap-2"
          style={{
            background: "hsl(var(--brand-soft))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 12,
            marginBottom: 16,
            padding: "8px 16px",
          }}
        >
          <span className="text-sm font-semibold">{sel.size} selected</span>
          <div className="flex items-center gap-1" style={{ marginLeft: "auto" }}>
            <button className="ks-btn ks-btn-sm" type="button" onClick={() => toast(`Bulk transfer · ${sel.size} assets`)}>Transfer</button>
            <button className="ks-btn ks-btn-sm" type="button" onClick={() => toast(`Bulk dispose · ${sel.size} assets`)}>Dispose</button>
            <button className="ks-btn ks-btn-sm" type="button" onClick={() => toast(`Print labels · ${sel.size} assets`)}>Print</button>
            <button className="ks-btn ks-btn-sm" type="button" onClick={() => toast(`Change custodian · ${sel.size} assets`)}>Custodian</button>
            <button className="ks-btn ks-btn-sm" type="button" onClick={() => toast(`Export · ${sel.size} assets`)}>Export</button>
            <button className="ks-btn ks-btn-ghost ks-btn-sm" type="button" onClick={() => setSel(new Set())}>Clear</button>
          </div>
        </div>
      )}

      <div className="ks-card">
        <div style={{ overflowX: "auto" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "hsl(var(--surface-2))" }}>
                <th style={{ padding: "10px 12px", textAlign: "left", width: 36 }}>
                  <input checked={allChecked} type="checkbox" onChange={() => toggleAll()} />
                </th>
                <th className="font-medium text-muted-foreground p-3 text-left">Asset</th>
                <th className="font-medium text-muted-foreground p-3 text-left">Category</th>
                <th className="font-medium text-muted-foreground p-3 text-left">Location</th>
                <th className="font-medium text-muted-foreground p-3 text-left">Custodian</th>
                <th className="font-medium text-muted-foreground p-3 text-right">Value / NBV</th>
                <th className="font-medium text-muted-foreground p-3 text-left">Status</th>
                <th className="font-medium text-muted-foreground p-3 text-center">Activity</th>
                <th style={{ padding: "10px 12px", width: 32 }} />
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, idx) => {
                const Icon = catToLucide[a.cat] ?? catToLucide.furn;
                const isSel = sel.has(a.id);
                const nbv = a.val - a.dep;
                return (
                  <tr
                    key={a.id}
                    style={{
                      background: isSel ? "hsl(var(--brand-soft))" : undefined,
                      borderBottom: "1px solid hsl(var(--border))",
                      cursor: "pointer",
                    }}
                    onClick={() => goDetail(a.id)}
                  >
                    <td style={{ padding: "10px 12px" }} onClick={(e) => e.stopPropagation()}>
                      <input checked={isSel} type="checkbox" onChange={() => toggleOne(a.id)} />
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <div className="flex items-center gap-2">
                        <Icon size={16} style={{ color: "hsl(var(--text-3))", flexShrink: 0 }} />
                        <div>
                          <div className="font-medium">{a.name}</div>
                          <div className="font-mono text-xs text-muted-foreground">{a.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span className={`ks-badge ${catToneClass(a.cat)}`}>{CAT_LABEL[a.cat]}</span>
                    </td>
                    <td className="p-3 text-muted-foreground">{a.loc}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <div className="flex items-center gap-2">
                        <span
                          className="flex items-center justify-center text-xs font-semibold text-white"
                          style={{ background: avatarColor(idx), borderRadius: "50%", flexShrink: 0, height: 26, width: 26 }}
                        >
                          {initials(a.custodian)}
                        </span>
                        <span className="text-sm">{a.custodian}</span>
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono">
                      <div className="font-semibold">{formatIDRShort(a.val)}</div>
                      <div className="text-xs text-muted-foreground">NBV {formatIDRShort(nbv)}</div>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span className={`ks-badge ${STATUS_TONE[a.status]}`}>{STATUS_LABEL[a.status]}</span>
                    </td>
                    <td className="p-3 text-center">
                      <Sparkline data={a.spark} />
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <ChevronRight size={16} style={{ color: "hsl(var(--text-3))" }} />
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td className="p-8 text-center text-muted-foreground" colSpan={9}>
                    No assets match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div
          className="justify-between text-xs text-muted-foreground flex items-center"
          style={{ borderTop: "1px solid hsl(var(--border))", padding: "10px 18px" }}
        >
          <span>Showing {filtered.length} of {ASSETS.length}</span>
          <span>Page 1 of 1</span>
        </div>
      </div>
    </div>
  );
}
