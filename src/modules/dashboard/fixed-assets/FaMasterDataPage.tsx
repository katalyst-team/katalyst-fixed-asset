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
import { FaProtoIcon, FaShellHead } from "@/modules/dashboard/fixed-assets";
import { CAT_LABEL } from "@/modules/dashboard/fixed-assets/constants";
import { FaQueryState } from "@/modules/dashboard/fixed-assets/FaQueryState";
import { useFaPermission } from "@/modules/dashboard/fixed-assets/useFaPermission";
import type { FaMasterDataRow, FaMasterDataSection, FaMasterDataSectionTab } from "@/types/fixed-assets";

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
      <div style={{ borderBottom: "1px solid hsl(var(--border))", display: "flex", overflowX: "auto" }}>
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
                flex: "1 0 140px",
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
              <span style={{ color: "hsl(var(--text-3))", fontSize: 11 }}>{s.rows.length} entries</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="p-3 text-left font-medium text-muted-foreground">{children}</th>;
}
function Td({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <td className="border-t border-border p-3" style={style}>{children}</td>;
}

function rowLabel(tab: FaMasterDataSectionTab, row: FaMasterDataRow): string {
  return tab === "cat" ? (CAT_LABEL[row.name] ?? row.name) : row.name;
}

function RowsTab({
  canManage,
  onDelete,
  onEdit,
  section,
}: {
  canManage: boolean;
  onDelete: (id: string) => void;
  onEdit: (id: string, name: string) => void;
  section: FaMasterDataSection;
}) {
  const [q, setQ] = useState("");
  const rows = section.rows.filter((r) => rowLabel(section.tab as FaMasterDataSectionTab, r).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="ks-card">
      <div className="ks-card-head">
        <span className="ks-card-title">{section.label} · {section.rows.length}</span>
        <div className="ks-search-box" style={{ maxWidth: 260, width: "100%" }}>
          <Search size={14} />
          <input
            placeholder="Search…"
            style={{ background: "transparent", border: 0, color: "hsl(var(--text))", fontFamily: "inherit", fontSize: 13, outline: "none", width: "100%" }}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <Th>Name</Th><Th>Detail</Th><Th>Assets</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.id || `${section.tab}-${idx}`}>
                <Td style={{ fontWeight: 600 }}>{rowLabel(section.tab as FaMasterDataSectionTab, r)}</Td>
                <Td>{r.desc || "—"}</Td>
                <Td>{r.count.toLocaleString("id-ID")}</Td>
                <Td>
                  {canManage && r.id && (
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="ks-btn ks-btn-icon ks-btn-ghost" type="button" onClick={() => onEdit(r.id, r.name)}>
                        <Pencil size={14} />
                      </button>
                      <button className="ks-btn ks-btn-icon ks-btn-ghost" type="button" onClick={() => onDelete(r.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function FaMasterDataPage() {
  const { tokenPayload } = useUser();
  const { canManage } = useFaPermission();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { data: resp, isError, isLoading } = useGetFAMasterDataQuery({ organizationId });
  const sections = resp?.data?.master_data_sections ?? [];
  const [tab, setTab] = useState<FaMasterDataSectionTab>("cat");
  const fileRef = useRef<HTMLInputElement>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const createMutation = useCreateFAMasterDataMutation({ organizationId });
  const deleteMutation = useDeleteFAMasterDataMutation({ organizationId });
  const importMutation = useImportFAMasterDataMutation({ organizationId });
  const updateMutation = useUpdateFAMasterDataMutation({ organizationId });

  const activeSection = sections.find((s) => s.tab === tab);

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
            {canManage && tab !== "cat" && (
              <button className="ks-btn" type="button" onClick={handleImport}><Download size={14} />Import CSV</button>
            )}
            <input
              ref={fileRef}
              accept=".csv,.xlsx,.xls"
              className="hidden"
              type="file"
              onChange={handleFileChange}
            />
            {canManage && tab !== "cat" && (
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
        {activeSection && (
          <RowsTab canManage={canManage} section={activeSection} onDelete={handleDelete} onEdit={handleEdit} />
        )}
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
