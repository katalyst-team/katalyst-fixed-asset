"use client";

import { Download, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useTranslation } from "next-i18next";
import { type ChangeEvent, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type {
  CreateMasterDataRequest,
  FaMasterDataRow,
  FaMasterDataSection,
  FaMasterDataSectionTab,
} from "@/types/fixed-assets";

type ExtraFieldKey = Exclude<keyof CreateMasterDataRequest, "name" | "parent_id">;

interface FieldDef {
  key: ExtraFieldKey;
  labelKey: string;
  options?: { labelKey: string; value: string }[];
  type?: "text" | "number" | "select";
}

const SECTION_FIELDS: Partial<Record<FaMasterDataSectionTab, FieldDef[]>> = {
  cc: [
    { key: "code", labelKey: "page.masterData.field.code" },
    { key: "department", labelKey: "page.masterData.field.department" },
  ],
  cls: [
    { key: "psak16_code", labelKey: "page.masterData.field.psak16Code" },
    {
      key: "depreciation_method",
      labelKey: "page.masterData.field.depreciationMethod",
      options: [
        { labelKey: "page.masterData.field.methodStraightLine", value: "straight-line" },
        { labelKey: "page.masterData.field.methodDecliningBalance", value: "declining-balance" },
      ],
      type: "select",
    },
    { key: "useful_life_years", labelKey: "page.masterData.field.usefulLifeYears", type: "number" },
  ],
  cust: [
    { key: "email", labelKey: "page.masterData.field.email" },
    { key: "department", labelKey: "page.masterData.field.department" },
    { key: "employee_id", labelKey: "page.masterData.field.employeeId" },
  ],
  loc: [
    { key: "address", labelKey: "page.masterData.field.address" },
    { key: "city", labelKey: "page.masterData.field.city" },
  ],
  sup: [
    { key: "contact", labelKey: "page.masterData.field.contactPerson" },
    { key: "phone", labelKey: "page.masterData.field.phone" },
    { key: "email", labelKey: "page.masterData.field.email" },
  ],
};

type FormState = Record<string, string>;

function rowToFormState(row: FaMasterDataRow | null): FormState {
  if (!row) return { name: "" };
  return {
    address: row.address ?? "",
    city: row.city ?? "",
    code: row.code ?? "",
    contact: row.contact ?? "",
    department: row.department ?? "",
    depreciation_method: row.depreciation_method ?? "",
    email: row.email ?? "",
    employee_id: row.employee_id ?? "",
    name: row.name,
    phone: row.phone ?? "",
    psak16_code: row.psak16_code ?? "",
    useful_life_years: row.useful_life_years != null ? String(row.useful_life_years) : "",
  };
}

function formStateToRequest(form: FormState): CreateMasterDataRequest {
  return {
    ...form,
    name: form.name ?? "",
    useful_life_years: form.useful_life_years ? Number(form.useful_life_years) : undefined,
  };
}

function TabBar({
  active,
  onSelect,
  sections,
}: {
  active: FaMasterDataSectionTab;
  onSelect: (t: FaMasterDataSectionTab) => void;
  sections: FaMasterDataSection[];
}) {
  const { t } = useTranslation("fixed-assets");
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
              <span style={{ color: "hsl(var(--text-3))", fontSize: 11 }}>{t("page.masterData.entriesCount", { count: s.rows.length })}</span>
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
  canDelete,
  canManage,
  onDelete,
  onEdit,
  section,
}: {
  canDelete: boolean;
  canManage: boolean;
  onDelete: (id: string) => void;
  onEdit: (row: FaMasterDataRow) => void;
  section: FaMasterDataSection;
}) {
  const { t } = useTranslation("fixed-assets");
  const [q, setQ] = useState("");
  const rows = section.rows.filter((r) => rowLabel(section.tab as FaMasterDataSectionTab, r).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="ks-card">
      <div className="ks-card-head">
        <span className="ks-card-title">{section.label} · {section.rows.length}</span>
        <div className="ks-search-box" style={{ maxWidth: 260, width: "100%" }}>
          <Search size={14} />
          <input
            placeholder={t("page.masterData.searchPlaceholder")}
            style={{ background: "transparent", border: 0, color: "hsl(var(--text))", fontFamily: "inherit", fontSize: 13, outline: "none", width: "100%" }}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <Th>{t("page.masterData.columns.name")}</Th><Th>{t("page.masterData.columns.detail")}</Th><Th>{t("page.masterData.columns.assets")}</Th><Th>{t("page.masterData.columns.actions")}</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.id || `${section.tab}-${idx}`}>
                <Td style={{ fontWeight: 600 }}>{rowLabel(section.tab as FaMasterDataSectionTab, r)}</Td>
                <Td>{r.desc || "—"}</Td>
                <Td>{r.count.toLocaleString("id-ID")}</Td>
                <Td>
                  {r.id && (
                    <div style={{ display: "flex", gap: 4 }}>
                      {canManage && (
                        <button aria-label={t("page.masterData.edit")} className="ks-btn ks-btn-icon ks-btn-ghost" type="button" onClick={() => onEdit(r)}>
                          <Pencil size={14} />
                        </button>
                      )}
                      {canDelete && (
                        <button aria-label={t("page.masterData.delete")} className="ks-btn ks-btn-icon ks-btn-ghost" type="button" onClick={() => onDelete(r.id)}>
                          <Trash2 size={14} />
                        </button>
                      )}
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
  const { t } = useTranslation("fixed-assets");
  const { tokenPayload } = useUser();
  const { canCreate, canDelete, canManage } = useFaPermission();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { data: resp, isError, isLoading } = useGetFAMasterDataQuery({ organizationId });
  const sections = resp?.data?.master_data_sections ?? [];
  const [tab, setTab] = useState<FaMasterDataSectionTab>("cat");
  const fileRef = useRef<HTMLInputElement>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>({ name: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const createMutation = useCreateFAMasterDataMutation({ organizationId });
  const deleteMutation = useDeleteFAMasterDataMutation({ organizationId });
  const importMutation = useImportFAMasterDataMutation({ organizationId });
  const updateMutation = useUpdateFAMasterDataMutation({ organizationId });

  const activeSection = sections.find((s) => s.tab === tab);
  const extraFields = SECTION_FIELDS[tab] ?? [];

  const handleAdd = () => {
    setEditingId(null);
    setForm(rowToFormState(null));
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync({ id, section: tab });
  };

  const handleEdit = (row: FaMasterDataRow) => {
    setEditingId(row.id);
    setForm(rowToFormState(row));
    setDialogOpen(true);
  };

  const handleDialogSubmit = async () => {
    if (!form.name) return;
    const data = formStateToRequest(form);
    if (editingId) {
      await updateMutation.mutateAsync({ data, id: editingId, section: tab });
    } else {
      await createMutation.mutateAsync({ data, section: tab });
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
              <button className="ks-btn" type="button" onClick={handleImport}><Download size={14} />{t("page.masterData.importCsv")}</button>
            )}
            <input
              ref={fileRef}
              accept=".csv,.xlsx,.xls"
              className="hidden"
              type="file"
              onChange={handleFileChange}
            />
            {canCreate && tab !== "cat" && (
              <button className="ks-btn ks-btn-primary" type="button" onClick={handleAdd}><Plus size={14} />{t("page.masterData.add")}</button>
            )}
          </>
        }
        desc={t("page.masterData.description")}
        title={t("page.masterData.title")}
      />
      <div style={{ marginBottom: 16 }}>
        <TabBar active={tab} sections={sections} onSelect={setTab} />
      </div>
      <FaQueryState
        emptyDescription={t("page.masterData.noDataDesc")}
        emptyTitle={t("page.masterData.noData")}
        isEmpty={sections.length === 0}
        isError={isError}
        isLoading={isLoading}
      >
        {activeSection && (
          <RowsTab canDelete={canDelete} canManage={canManage} section={activeSection} onDelete={handleDelete} onEdit={handleEdit} />
        )}
      </FaQueryState>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? t("page.masterData.editSection", { section: activeSection?.label ?? "" }) : t("page.masterData.addSection", { section: activeSection?.label ?? "" })}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="md-name">{t("page.masterData.field.name")}</Label>
              <Input
                autoFocus
                id="md-name"
                placeholder={t("page.masterData.namePlaceholder")}
                value={form.name ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            {extraFields.map((field) => (
              <div key={field.key} className="flex flex-col gap-1.5">
                <Label htmlFor={`md-${field.key}`}>{t(field.labelKey)}</Label>
                {field.type === "select" ? (
                  <Select
                    value={form[field.key] ?? ""}
                    onValueChange={(v) => setForm((f) => ({ ...f, [field.key]: v }))}
                  >
                    <SelectTrigger id={`md-${field.key}`}>
                      <SelectValue placeholder={t("page.masterData.selectField", { field: t(field.labelKey) })} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{t(o.labelKey)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={`md-${field.key}`}
                    type={field.type === "number" ? "number" : "text"}
                    value={form[field.key] ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={handleDialogSubmit}>{editingId ? t("page.masterData.save") : t("page.masterData.add")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
