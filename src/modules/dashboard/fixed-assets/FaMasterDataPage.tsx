/* eslint-disable max-lines */
"use client";

import { Download, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUser } from "@/context/user-context";
import {
  useCreateFAMasterDataMutation,
  useDeleteFAMasterDataMutation,
  useGetFAMasterDataQuery,
  useImportFAMasterDataMutation,
  useUpdateFAMasterDataMutation,
} from "@/hooks/api/fixed-assets";
import { avatarColor, FaMeter, FaProtoIcon, FaShellHead, initials } from "@/modules/dashboard/fixed-assets";
import { FaQueryState } from "@/modules/dashboard/fixed-assets/FaQueryState";
import { useFaPermission } from "@/modules/dashboard/fixed-assets/useFaPermission";
import type { FaMasterDataSection, FaMasterDataSectionTab } from "@/types/fixed-assets";

interface TreeItem {
  icon?: string;
  n: string;
  sub?: string;
}
interface TreeGroup {
  icon: string;
  items: TreeItem[];
  n: string;
}

const CAT_TREE: TreeGroup[] = [
  { icon: "laptop", items: [{ n: "Laptops" }, { n: "Desktops" }, { n: "Monitors" }, { n: "Servers" }], n: "IT Equipment" },
  { icon: "chair", items: [{ n: "Chairs" }, { n: "Desks" }, { n: "Cabinets" }], n: "Furniture" },
  { icon: "flask", items: [{ n: "Instruments" }, { n: "Glassware" }], n: "Lab Equipment" },
  { icon: "cog", items: [{ n: "CNC" }, { n: "Press" }, { n: "Conveyor" }], n: "Machinery" },
  { icon: "cross", items: [{ n: "Patient Monitors" }, { n: "Imaging" }], n: "Medical" },
  { icon: "wrench", items: [{ n: "Power Tools" }, { n: "Hand Tools" }, { n: "Safety" }], n: "Tools" },
  { icon: "truck", items: [{ n: "Forklifts" }, { n: "Vans" }], n: "Vehicles" },
];

const LOC_TREE: TreeGroup[] = [
  { icon: "pin", items: [{ n: "Floor 8" }, { n: "Floor 12" }, { n: "Lobby" }], n: "JKT-HQ" },
  { icon: "pin", items: [{ n: "Rack B" }, { n: "Rack C" }], n: "JKT-DC" },
  { icon: "pin", items: [{ n: "Crib" }, { n: "Bay 1-3" }], n: "JKT-WS" },
  { icon: "pin", items: [{ n: "Cell A" }, { n: "Cell B" }], n: "Mfg-1" },
  { icon: "pin", items: [{ n: "ICU-2" }, { n: "OR3" }], n: "RS Husada" },
  { icon: "pin", items: [{ n: "Bay 1" }, { n: "Bay 2" }], n: "BDG-WH" },
];

const CUSTODIANS = [
  { assets: 84, dept: "Finance & Admin", email: "bambang.w@indojaya.id", loc: "JKT-HQ · F8", name: "Bambang Wijaya", role: "Admin" },
  { assets: 42, dept: "IT", email: "dewi.a@indojaya.id", loc: "JKT-HQ · F8", name: "Dewi Anggraini", role: "Manager" },
  { assets: 28, dept: "Operations", email: "rahmat.s@indojaya.id", loc: "JKT-HQ · F12", name: "Rahmat Santoso", role: "Auditor" },
  { assets: 142, dept: "Operations", email: "andi.p@indojaya.id", loc: "JKT-WS · Crib", name: "Andi Pratama", role: "Operator" },
  { assets: 18, dept: "Finance & Admin", email: "ratna.i@indojaya.id", loc: "JKT-HQ · F8", name: "Ratna Indira", role: "Manager" },
  { assets: 64, dept: "Manufacturing", email: "eko.p@indojaya.id", loc: "Mfg-1 · Cell A", name: "Eko Pranata", role: "Operator" },
  { assets: 22, dept: "Lab", email: "ratna.l@indojaya.id", loc: "JKT-Lab", name: "Dr. Ratna", role: "Manager" },
  { assets: 38, dept: "Maintenance", email: "galang.t@indojaya.id", loc: "JKT-WS", name: "Galang Tirta", role: "Operator" },
];

const COST_CENTERS = [
  { assets: 1420, budget: 840000000, code: "CC-1001", depr: 14200000, name: "Engineering", pct: 78, pic: "Dewi A." },
  { assets: 820, budget: 420000000, code: "CC-1002", depr: 8400000, name: "Operations", pct: 62, pic: "Rahmat S." },
  { assets: 640, budget: 1240000000, code: "CC-1003", depr: 21800000, name: "Manufacturing", pct: 91, pic: "Eko P." },
  { assets: 248, budget: 180000000, code: "CC-1004", depr: 3200000, name: "Facilities", pct: 44, pic: "Budi S." },
  { assets: 184, budget: 320000000, code: "CC-1005", depr: 6800000, name: "Lab & QC", pct: 88, pic: "Dr. Ratna" },
  { assets: 96, budget: 96000000, code: "CC-1006", depr: 1800000, name: "Sales", pct: 52, pic: "Citra W." },
];

const SUPPLIERS = [
  { assets: 142, cat: "IT Hardware", id: "SUP-001", lastPO: "08 Jan 2025", lead: "7d", name: "PT. Dell Indonesia", rating: 4.8, tier: "Gold" },
  { assets: 84, cat: "IT Hardware", id: "SUP-002", lastPO: "12 Jan 2025", lead: "10d", name: "PT. Apple Indonesia", rating: 4.9, tier: "Gold" },
  { assets: 68, cat: "Power Tools", id: "SUP-003", lastPO: "02 Dec 2024", lead: "14d", name: "PT. Astra Hilti", rating: 4.6, tier: "Silver" },
  { assets: 42, cat: "Lab Instruments", id: "SUP-004", lastPO: "19 Oct 2024", lead: "21d", name: "PT. Mettler Toledo", rating: 4.7, tier: "Silver" },
  { assets: 24, cat: "Medical", id: "SUP-005", lastPO: "14 Dec 2023", lead: "30d", name: "PT. Philips Indonesia", rating: 4.5, tier: "Silver" },
  { assets: 12, cat: "Furniture", id: "SUP-006", lastPO: "18 Oct 2022", lead: "18d", name: "PT. Aeron Mebel", rating: 4.2, tier: "Bronze" },
];

const ASSET_CLASSES = [
  { assets: 4820, gl: "1.02.01 · 52.02.01", method: "Straight Line", minCap: 2500000, name: "IT Equipment", tax: "Kelompok 2", ul: 4 },
  { assets: 2840, gl: "1.02.02 · 52.02.02", method: "Straight Line", minCap: 1000000, name: "Furniture", tax: "Kelompok 2", ul: 8 },
  { assets: 2140, gl: "1.02.03 · 52.02.03", method: "Straight Line", minCap: 1000000, name: "Tools", tax: "Kelompok 2", ul: 4 },
  { assets: 842, gl: "1.02.04 · 52.02.04", method: "Straight Line", minCap: 10000000, name: "Vehicles", tax: "Kelompok 3", ul: 8 },
  { assets: 620, gl: "1.02.05 · 52.02.05", method: "Straight Line", minCap: 5000000, name: "Lab Equipment", tax: "Kelompok 2", ul: 5 },
  { assets: 142, gl: "1.02.06 · 52.02.06", method: "Straight Line", minCap: 50000000, name: "Medical Devices", tax: "Kelompok 4", ul: 5 },
  { assets: 18, gl: "1.02.07 · 52.02.07", method: "Straight Line", minCap: 50000000, name: "Industrial Machinery", tax: "Kelompok 3", ul: 10 },
  { assets: 14, gl: "1.02.08 · 52.02.08", method: "Straight Line", minCap: 100000000, name: "Buildings (FA)", tax: "Bangunan", ul: 20 },
];

function TabBar({
  active,
  onSelect,
  sections,
}: {
  active: FaMasterDataSectionTab;
  onSelect: (t: FaMasterDataSectionTab) => void;
  sections: FaMasterDataSection[];
}) {
  return (
    <div className="ks-card" style={{ overflow: "visible" }}>
      <div style={{ borderBottom: "1px solid hsl(var(--border))", display: "flex" }}>
        {sections.map((s) => {
          const on = s.tab === active;
          return (
            <button
              key={s.tab}
              style={{
                alignItems: "center",
                background: on ? "hsl(var(--brand-soft))" : "transparent",
                borderBottom: on ? "2px solid hsl(var(--brand))" : "2px solid transparent",
                color: on ? "hsl(var(--brand))" : "hsl(var(--text-2))",
                cursor: "pointer",
                display: "flex",
                flex: 1,
                flexDirection: "column",
                fontFamily: "inherit",
                gap: 2,
                padding: "12px 10px",
              }}
              type="button"
              onClick={() => onSelect(s.tab as FaMasterDataSectionTab)}
            >
              <span style={{ alignItems: "center", display: "flex", fontSize: 13, fontWeight: 600, gap: 6 }}>
                <FaProtoIcon name={s.icon} size={14} />
                {s.label}
              </span>
              <span style={{ color: "hsl(var(--text-3))", fontSize: 11 }}>{s.rows[0].desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TreeColumn({ groups, onSelect }: { groups: TreeGroup[]; onSelect: (g: TreeGroup, i: TreeItem) => void }) {
  return (
    <div className="ks-card" style={{ maxHeight: 520, overflowY: "auto" }}>
      {groups.map((g) => (
        <div key={g.n}>
          <div style={{ alignItems: "center", color: "hsl(var(--text-3))", display: "flex", fontSize: 11, fontWeight: 700, gap: 6, padding: "10px 14px 4px", textTransform: "uppercase" }}>
            <FaProtoIcon name={g.icon} size={12} />
            {g.n}
          </div>
          {g.items.map((i) => (
            <button
              key={i.n}
              style={{ background: "transparent", border: 0, color: "hsl(var(--text))", cursor: "pointer", display: "block", fontFamily: "inherit", fontSize: 13, padding: "6px 14px 6px 34px", textAlign: "left", width: "100%" }}
              type="button"
              onClick={() => onSelect(g, i)}
            >
              {i.n}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="p-3 text-left font-medium text-muted-foreground">{children}</th>;
}
function Td({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <td className="border-t border-border p-3" style={style}>{children}</td>;
}

interface RowActionProps {
  canManage: boolean;
  onDelete: (id: string) => void;
  onEdit: (id: string, name: string) => void;
}

function ActionButtons({ canManage, id, name, onDelete, onEdit }: { id: string; name: string } & RowActionProps) {
  if (!canManage) return null;
  return (
    <div style={{ display: "flex", gap: 4 }}>
      <button className="ks-btn ks-btn-icon ks-btn-ghost" type="button" onClick={() => onEdit(id, name)}>
        <Pencil size={14} />
      </button>
      <button className="ks-btn ks-btn-icon ks-btn-ghost" type="button" onClick={() => onDelete(id)}>
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function CategoryTab({ canManage, onDelete, onEdit }: RowActionProps) {
  const [sel, setSel] = useState<{ g: TreeGroup; i: TreeItem } | null>({ g: CAT_TREE[0], i: CAT_TREE[0].items[0] });
  return (
    <div style={{ display: "grid", gap: 16, gridTemplateColumns: "220px 1fr 1fr" }}>
      <TreeColumn groups={CAT_TREE} onSelect={(g, i) => setSel({ g, i })} />
      <div className="ks-card">
        <div className="ks-card-head"><span className="ks-card-title">Sub-Categories</span><span className="ks-badge outline">{sel?.g.n}</span></div>
        <div className="ks-card-body" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {(sel?.g.items ?? []).map((i) => (
            <div key={i.n} style={{ alignItems: "center", background: i.n === sel?.i.n ? "hsl(var(--brand-soft))" : "hsl(var(--surface-2))", borderRadius: 8, color: i.n === sel?.i.n ? "hsl(var(--brand))" : "hsl(var(--text))", display: "flex", fontSize: 13, justifyContent: "space-between", padding: "8px 12px" }}>
              <span>{i.n}</span>
              <span className="ks-badge outline">{Math.floor(Math.random() * 8) + 2} codes</span>
            </div>
          ))}
        </div>
      </div>
      <div className="ks-card">
        <div className="ks-card-head">
          <span className="ks-card-title">{sel?.i.n ?? "Detail"}</span>
          <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
            <span className="ks-badge success">PSAK 16 synced</span>
            {sel?.i && <ActionButtons canManage={canManage} id={sel.i.n} name={sel.i.n} onDelete={onDelete} onEdit={onEdit} />}
          </div>
        </div>
        <div className="ks-card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={{ color: "hsl(var(--text-3))", fontSize: 11, fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>PSAK 16 Attributes</div>
            {[["Asset Class", sel?.g.n ?? ""], ["Useful Life", "4 — 8 years"], ["Depreciation", "Straight Line"], ["Min. Capitalize", "Rp 2.500.000"], ["GL Asset / Acc. Dep.", "1.02.01 / 52.02.01"]].map(([k, v]) => (
              <div key={k} style={{ borderTop: "1px solid hsl(var(--border))", color: "hsl(var(--text-2))", display: "flex", fontSize: 13, justifyContent: "space-between", padding: "7px 0" }}>
                <span>{k}</span><span style={{ color: "hsl(var(--text))", fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ color: "hsl(var(--text-3))", fontSize: 11, fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>Sync Status</div>
            <div style={{ alignItems: "center", display: "flex", fontSize: 12, gap: 8 }}>
              <span className="ks-badge success">ERP</span><span className="ks-badge success">Tax (DJP)</span><span className="ks-badge warn">Audit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LocationTab({ canManage, onDelete, onEdit }: RowActionProps) {
  const [sel, setSel] = useState<TreeItem>(LOC_TREE[0].items[0]);
  return (
    <div style={{ display: "grid", gap: 16, gridTemplateColumns: "220px 1fr 1fr" }}>
      <TreeColumn groups={LOC_TREE} onSelect={(_g, i) => setSel(i)} />
      <div className="ks-card">
        <div className="ks-card-head"><span className="ks-card-title">Zones &amp; Gates</span><span className="ks-badge info">{sel.n}</span></div>
        <div className="ks-card-body" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {["Zone A · 142 assets", "Zone B · 84 assets", "Zone C · 48 assets", "Gate-IN · RFID", "Gate-OUT · RFID"].map((z) => (
            <div key={z} style={{ alignItems: "center", background: "hsl(var(--surface-2))", borderRadius: 8, display: "flex", fontSize: 13, justifyContent: "space-between", padding: "8px 12px" }}>
              <span>{z}</span>
              <FaProtoIcon name="pin" size={12} />
            </div>
          ))}
        </div>
      </div>
      <div className="ks-card">
        <div className="ks-card-head">
          <span className="ks-card-title">{sel.n} · Detail</span>
          <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
            <span className="ks-badge success">Online</span>
            <ActionButtons canManage={canManage} id={sel.n} name={sel.n} onDelete={onDelete} onEdit={onEdit} />
          </div>
        </div>
        <div className="ks-card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[["Site", "JKT-HQ"],["Floor", sel.n],["Total Assets", "4,820"],["Readers", "8 active"],["Geofence", "Enabled"]].map(([k, v]) => (
            <div key={k} style={{ borderTop: "1px solid hsl(var(--border))", color: "hsl(var(--text-2))", display: "flex", fontSize: 13, justifyContent: "space-between", padding: "7px 0" }}>
              <span>{k}</span><span style={{ color: "hsl(var(--text))", fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CustodianTab({ canManage, onDelete, onEdit }: RowActionProps) {
  const [q, setQ] = useState("");
  const rows = CUSTODIANS.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()) || c.email.includes(q.toLowerCase()));
  return (
    <div className="ks-card">
      <div className="ks-card-head">
        <span className="ks-card-title">Custodians · {CUSTODIANS.length}</span>
        <div className="ks-search-box" style={{ width: 260 }}>
          <Search size={14} />
          <input placeholder="Search name or email…" style={{ background: "transparent", border: 0, color: "hsl(var(--text))", fontFamily: "inherit", fontSize: 13, outline: "none", width: "100%" }} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <Th>Name</Th><Th>Role</Th><Th>Department</Th><Th>Location</Th><Th>Assets</Th><Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c, idx) => (
            <tr key={c.email}>
              <Td>
                <div style={{ alignItems: "center", display: "flex", gap: 10 }}>
                  <span style={{ alignItems: "center", background: avatarColor(idx), borderRadius: "50%", color: "#fff", display: "flex", fontSize: 11, fontWeight: 700, height: 30, justifyContent: "center", width: 30 }}>{initials(c.name)}</span>
                  <span>{c.name}<br /><span style={{ color: "hsl(var(--text-3))", fontSize: 11 }}>{c.email}</span></span>
                </div>
              </Td>
              <Td><span className="ks-badge info">{c.role}</span></Td>
              <Td>{c.dept}</Td>
              <Td>{c.loc}</Td>
              <Td><span style={{ fontWeight: 600 }}>{c.assets}</span></Td>
              <Td><ActionButtons canManage={canManage} id={c.email} name={c.name} onDelete={onDelete} onEdit={onEdit} /></Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CostCenterTab({ canManage, onDelete, onEdit }: RowActionProps) {
  return (
    <div className="ks-card">
      <div className="ks-card-head"><span className="ks-card-title">Cost Centers · 28</span></div>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <Th>Code</Th><Th>Name</Th><Th>PIC</Th><Th>Assets</Th><Th>Budget</Th><Th>Usage</Th><Th>Depr/month</Th><Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {COST_CENTERS.map((c) => (
            <tr key={c.code}>
              <Td><span style={{ fontFamily: "ui-monospace, monospace" }}>{c.code}</span></Td>
              <Td style={{ fontWeight: 600 }}>{c.name}</Td>
              <Td>{c.pic}</Td>
              <Td>{c.assets.toLocaleString("id-ID")}</Td>
              <Td>{"Rp " + (c.budget / 1e6).toFixed(0) + " jt"}</Td>
              <Td style={{ minWidth: 120 }}><FaMeter pct={c.pct} tone={c.pct > 85 ? "warn" : "brand"} /><span style={{ color: "hsl(var(--text-3))", fontSize: 11 }}>{c.pct}%</span></Td>
              <Td>{"Rp " + (c.depr / 1e6).toFixed(1) + " jt"}</Td>
              <Td><ActionButtons canManage={canManage} id={c.code} name={c.name} onDelete={onDelete} onEdit={onEdit} /></Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SupplierTab({ canManage, onDelete, onEdit }: RowActionProps) {
  const [tier, setTier] = useState("All");
  const tiers = ["All", "Gold", "Silver", "Bronze"];
  const rows = tier === "All" ? SUPPLIERS : SUPPLIERS.filter((s) => s.tier === tier);
  return (
    <div className="ks-card">
      <div className="ks-card-head">
        <span className="ks-card-title">Suppliers · 68</span>
        <div className="ks-chips">
          {tiers.map((t) => (
            <button key={t} className={"ks-chip" + (t === tier ? " on" : "")} type="button" onClick={() => setTier(t)}>{t}</button>
          ))}
        </div>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <Th>Supplier</Th><Th>Tier</Th><Th>Category</Th><Th>Lead time</Th><Th>Active assets</Th><Th>Rating</Th><Th>Last PO</Th><Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => (
            <tr key={s.id}>
              <Td>
                <div style={{ fontWeight: 600 }}>{s.name}</div>
                <div style={{ color: "hsl(var(--text-3))", fontSize: 11 }}>{s.id}</div>
              </Td>
              <Td><span className={"ks-badge " + (s.tier === "Gold" ? "warn" : s.tier === "Silver" ? "outline" : "outline")}>{s.tier}</span></Td>
              <Td>{s.cat}</Td>
              <Td>{s.lead}</Td>
              <Td>{s.assets}</Td>
              <Td>{"★ " + s.rating.toFixed(1)}</Td>
              <Td>{s.lastPO}</Td>
              <Td><ActionButtons canManage={canManage} id={s.id} name={s.name} onDelete={onDelete} onEdit={onEdit} /></Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AssetClassTab({ canManage, onDelete, onEdit }: RowActionProps) {
  return (
    <div className="ks-card">
      <div className="ks-card-head"><span className="ks-card-title">Asset Classes · PSAK 16</span></div>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <Th>Class</Th><Th>Useful life</Th><Th>Tax group</Th><Th>Method</Th><Th>Min capitalize</Th><Th>GL accounts</Th><Th>Assets</Th><Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {ASSET_CLASSES.map((c) => (
            <tr key={c.name}>
              <Td style={{ fontWeight: 600 }}>{c.name}</Td>
              <Td>{c.ul} yrs</Td>
              <Td><span className="ks-badge outline">{c.tax}</span></Td>
              <Td>{c.method}</Td>
              <Td>{"Rp " + (c.minCap / 1e6).toFixed(1) + " jt"}</Td>
              <Td style={{ fontFamily: "ui-monospace, monospace", fontSize: 11 }}>{c.gl}</Td>
              <Td>{c.assets.toLocaleString("id-ID")}</Td>
              <Td><ActionButtons canManage={canManage} id={c.name} name={c.name} onDelete={onDelete} onEdit={onEdit} /></Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FaMasterDataPage() {
  const { tokenPayload } = useUser();
  const { canManage } = useFaPermission();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { data: resp, isError, isLoading } = useGetFAMasterDataQuery({ organizationId });
  const sections = resp?.data?.masterDataSections ?? [];
  const [tab, setTab] = useState<FaMasterDataSectionTab>("cat");
  const fileRef = useRef<HTMLInputElement>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const createMutation = useCreateFAMasterDataMutation({ organizationId });
  const deleteMutation = useDeleteFAMasterDataMutation({ organizationId });
  const importMutation = useImportFAMasterDataMutation({ organizationId });
  const updateMutation = useUpdateFAMasterDataMutation({ organizationId });

  const handleAdd = () => {
    setEditingId(null);
    setInputValue("");
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync({ id, section: tab });
  };

  const handleEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setInputValue(currentName);
    setDialogOpen(true);
  };

  const handleDialogSubmit = async () => {
    if (!inputValue) return;
    if (editingId) {
      await updateMutation.mutateAsync({ data: { name: inputValue }, id: editingId, section: tab });
    } else {
      await createMutation.mutateAsync({ data: { name: inputValue }, section: tab });
    }
    setDialogOpen(false);
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await importMutation.mutateAsync({ file, section: tab });
    e.target.value = "";
  };

  const handleImport = () => {
    fileRef.current?.click();
  };

  return (
    <div>
      <FaShellHead
        actions={
          <>
            {canManage && (
              <button className="ks-btn" type="button" onClick={handleImport}><Download size={14} />Import CSV</button>
            )}
            <input
              ref={fileRef}
              accept=".csv,.xlsx,.xls"
              className="hidden"
              type="file"
              onChange={handleFileChange}
            />
            {canManage && (
              <button className="ks-btn ks-btn-primary" type="button" onClick={handleAdd}><Plus size={14} />Add</button>
            )}
          </>
        }
        desc="Manage categories, locations, custodians, cost centers, suppliers and asset classes."
        title="Master Data"
      />
      <div style={{ marginBottom: 16 }}>
        <TabBar active={tab} sections={sections} onSelect={setTab} />
      </div>
      <FaQueryState
        emptyDescription="No master data rows for this section."
        emptyTitle="No data"
        isEmpty={sections.length === 0}
        isError={isError}
        isLoading={isLoading}
      >
        {tab === "cat" && <CategoryTab canManage={canManage} onDelete={handleDelete} onEdit={handleEdit} />}
        {tab === "loc" && <LocationTab canManage={canManage} onDelete={handleDelete} onEdit={handleEdit} />}
        {tab === "cust" && <CustodianTab canManage={canManage} onDelete={handleDelete} onEdit={handleEdit} />}
        {tab === "cc" && <CostCenterTab canManage={canManage} onDelete={handleDelete} onEdit={handleEdit} />}
        {tab === "sup" && <SupplierTab canManage={canManage} onDelete={handleDelete} onEdit={handleEdit} />}
        {tab === "cls" && <AssetClassTab canManage={canManage} onDelete={handleDelete} onEdit={handleEdit} />}
      </FaQueryState>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit name" : "Add new"}</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            placeholder="Enter name"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleDialogSubmit(); }}
          />
          <DialogFooter>
            <Button onClick={handleDialogSubmit}>{editingId ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
