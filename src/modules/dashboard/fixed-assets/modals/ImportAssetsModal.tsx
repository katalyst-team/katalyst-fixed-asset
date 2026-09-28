"use client";

import { ArrowLeft, Download, FileUp } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/user-context";
import { useBulkCreateAssetMutation } from "@/hooks/api/fixed-assets";
import { cn } from "@/lib/utils";
import { CAT_LABEL } from "@/modules/dashboard/fixed-assets/constants";
import {
  useFaLocationOptions,
  useFaPeopleOptions,
} from "@/modules/dashboard/fixed-assets/modals/types";
import type { AssetCategory } from "@/types/fixed-assets";

const MAX_ROWS = 1000;

type ImportField =
  | "cat"
  | "custodian"
  | "epc"
  | "loc"
  | "name"
  | "purchased"
  | "serial"
  | "supplier"
  | "val"
  | "warranty";

const FIELD_ALIASES: Record<ImportField, string[]> = {
  cat: ["cat", "category", "kategori", "kategori aset"],
  custodian: ["custodian", "penanggung jawab", "pj", "pic"],
  epc: ["epc", "rfid", "tag id"],
  loc: ["loc", "location", "lokasi"],
  name: ["name", "asset name", "nama", "nama aset"],
  purchased: ["purchased", "purchase date", "tanggal beli", "tanggal perolehan"],
  serial: ["serial", "serial number", "no seri", "sn"],
  supplier: ["supplier", "vendor", "pemasok"],
  val: ["val", "value", "nilai", "harga", "nilai perolehan"],
  warranty: ["warranty", "garansi"],
};

const CATEGORY_BY_LABEL: Record<string, AssetCategory> = Object.fromEntries(
  Object.entries(CAT_LABEL).map(([slug, label]) => [
    label.toLowerCase(),
    slug as AssetCategory,
  ]),
);

interface ImportAssetsModalProps {
  onClose: () => void;
  open: boolean;
}

interface ParsedFile {
  headers: string[];
  rows: string[][];
}

function normalizeCell(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return String(value ?? "").trim();
}

function normalizeCategory(raw: string): AssetCategory | null {
  const key = raw.toLowerCase().replace(/[^a-z ]/g, "").trim();
  if (!key) return null;
  const slugs = Object.keys(CAT_LABEL) as AssetCategory[];
  const slug = slugs.find((s) => s === key);
  if (slug) return slug;
  return CATEGORY_BY_LABEL[key] ?? null;
}

function normalizeDate(raw: string): string | null {
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const match = raw.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (match) {
    const [, d, m, y] = match;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return null;
}

function normalizeValue(raw: string): number | null {
  if (!raw) return 0;
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return null;
  return Number(digits);
}

export function ImportAssetsModal({ onClose, open }: ImportAssetsModalProps) {
  const { t } = useTranslation("fixed-assets");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { isPending: isSaving, mutateAsync } = useBulkCreateAssetMutation({
    organizationId,
  });
  const peopleOptions = useFaPeopleOptions();
  const locationOptions = useFaLocationOptions();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<ParsedFile | null>(null);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState("");
  const [defaultCat, setDefaultCat] = useState<string>("furn");
  const [mapping, setMapping] = useState<Record<number, ImportField | "skip">>(
    {},
  );

  function autoMap(headers: string[]): Record<number, ImportField | "skip"> {
    const next: Record<number, ImportField | "skip"> = {};
    headers.forEach((header, index) => {
      const key = header.toLowerCase().replace(/[^a-z ]/g, "").trim();
      const field = (Object.keys(FIELD_ALIASES) as ImportField[]).find((f) =>
        FIELD_ALIASES[f].includes(key),
      );
      next[index] = field ?? "skip";
    });
    return next;
  }

  async function handleFile(selected: File | null) {
    if (!selected) return;
    setParseError("");
    try {
      const buffer = await selected.arrayBuffer();
      const workbook = XLSX.read(buffer, { cellDates: true });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const grid = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
        defval: "",
        header: 1,
      });
      if (grid.length < 2) {
        setParseError(t("modals.importAssets.parseError"));
        return;
      }
      if (grid.length - 1 > MAX_ROWS) {
        setParseError(t("modals.importAssets.tooManyRows"));
        return;
      }
      const headers = (grid[0] ?? []).map(normalizeCell);
      const rows = grid
        .slice(1)
        .map((row) => headers.map((_, i) => normalizeCell(row[i])));
      setFile({ headers, rows });
      setFileName(selected.name);
      setMapping(autoMap(headers));
    } catch {
      setParseError(t("modals.importAssets.parseError"));
    }
  }

  function handleDownloadTemplate() {
    const csv =
      "name,category,location,custodian,value,serial,supplier,purchased,warranty\nLaptop ThinkPad,IT Equipment,HQ Floor 2,Budi Santoso,15000000,SN-001,PT Sumber Aman,2026-01-15,2029-01-15";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "asset-import-template.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const nameCol = Object.keys(mapping).find(
    (i) => mapping[Number(i)] === "name",
  );

  function fieldLabel(field: ImportField): string {
    if (field === "cat") return t("modals.createAsset.categoryLabel");
    if (field === "epc") return t("modals.importAssets.epc");
    if (field === "loc") return t("modals.createAsset.locationLabel");
    if (field === "val") return t("modals.createAsset.valueLabel");
    return t(`modals.createAsset.${field}Label`);
  }

  const parsed = useMemo(() => {
    if (!file) return null;
    const catMapped = Object.values(mapping).includes("cat");
    const rows = file.rows.map((row, index) => {
      const errors: string[] = [];
      const get = (field: ImportField) => {
        const col = Object.keys(mapping).find(
          (i) => mapping[Number(i)] === field,
        );
        return col === undefined ? "" : (row[Number(col)] ?? "");
      };
      const name = get("name");
      if (!name) errors.push(t("modals.importAssets.missingName"));
      let cat = get("cat");
      if (cat) {
        const normalized = normalizeCategory(cat);
        if (!normalized) {
          errors.push(t("modals.importAssets.invalidCategory"));
        }
        cat = normalized ?? "";
      } else {
        cat = defaultCat;
      }
      let purchased = get("purchased");
      const purchasedOut = normalizeDate(purchased);
      if (purchasedOut === null) {
        errors.push(t("modals.importAssets.invalidDate"));
        purchased = "";
      } else {
        purchased = purchasedOut;
      }
      let warranty = get("warranty");
      const warrantyOut = normalizeDate(warranty);
      if (warrantyOut === null) {
        errors.push(t("modals.importAssets.invalidDate"));
        warranty = "";
      } else {
        warranty = warrantyOut;
      }
      const valRaw = get("val");
      const val = normalizeValue(valRaw);
      if (val === null) errors.push(t("modals.importAssets.invalidValue"));
      const matchOption = (
        options: Array<{ label: string; value: string }>,
        raw: string,
      ) => {
        if (!raw) return "";
        const found = options.find(
          (option) => option.label.toLowerCase() === raw.toLowerCase(),
        );
        return found ? found.value : raw;
      };
      return {
        cat: cat as AssetCategory,
        custodian: matchOption(peopleOptions, get("custodian")),
        epc: get("epc"),
        errors,
        index,
        loc: matchOption(locationOptions, get("loc")),
        name,
        purchased,
        serial: get("serial"),
        supplier: get("supplier"),
        val: val ?? 0,
        warranty,
      };
    });
    return { catMapped, rows };
  }, [file, mapping, defaultCat, peopleOptions, locationOptions, t]);

  const validRows = (parsed?.rows ?? []).filter((r) => r.errors.length === 0);
  const errorCount = (parsed?.rows ?? []).length - validRows.length;

  function handleReset() {
    setFile(null);
    setFileName("");
    setMapping({});
    setParseError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleImport() {
    if (!parsed || validRows.length === 0) return;
    const result = await mutateAsync({
      assets: validRows.map((row) => ({
        cat: row.cat,
        custodian: row.custodian,
        epc: row.epc,
        loc: row.loc,
        name: row.name,
        purchased: row.purchased,
        serial: row.serial,
        supplier: row.supplier,
        val: row.val,
        warranty: row.warranty,
      })),
    }).catch(() => null);
    if (!result) return;
    toast.success(t("toasts.assetsImported"));
    onClose();
  }

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("modals.importAssets.title")}</DialogTitle>
          <DialogDescription>
            {t("modals.importAssets.description")}
          </DialogDescription>
        </DialogHeader>

        {!file ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <input
              ref={fileInputRef}
              accept=".csv,.xlsx,.xls"
              className="hidden"
              type="file"
              onChange={(event) => void handleFile(event.target.files?.[0] ?? null)}
            />
            <button
              className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-10 py-8 transition-colors hover:bg-muted"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileUp className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm font-medium">
                {t("modals.importAssets.chooseFile")}
              </span>
              <span className="text-xs text-muted-foreground">
                {t("modals.importAssets.fileHint")}
              </span>
            </button>
            <button
              className="ks-btn ks-btn-ghost ks-btn-sm"
              type="button"
              onClick={handleDownloadTemplate}
            >
              <Download size={14} />
              {t("modals.importAssets.downloadTemplate")}
            </button>
            {parseError ? (
              <p className="text-sm text-destructive">{parseError}</p>
            ) : null}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{fileName}</span>
              <span className="text-muted-foreground">
                {file.rows.length} {t("modals.importAssets.rowsFound")}
              </span>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">
                {t("modals.importAssets.mappingTitle")}
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {file.headers.map((header, index) => (
                  <div key={header + index} className="flex items-center gap-2">
                    <span className="w-32 shrink-0 truncate text-xs text-muted-foreground" title={header}>
                      {header || `#${index + 1}`}
                    </span>
                    <Select
                      value={mapping[index] ?? "skip"}
                      onValueChange={(value) =>
                        setMapping((prev) => ({ ...prev, [index]: value as ImportField | "skip" }))
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="skip">
                          {t("modals.importAssets.skip")}
                        </SelectItem>
                        {(Object.keys(FIELD_ALIASES) as ImportField[]).map(
                          (field) => (
                            <SelectItem key={field} value={field}>
                              {fieldLabel(field)}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
              {!parsed?.catMapped ? (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {t("modals.importAssets.defaultCategory")}
                  </span>
                  <Select value={defaultCat} onValueChange={setDefaultCat}>
                    <SelectTrigger className="h-8 w-40 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CAT_LABEL).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
              {!nameCol ? (
                <p className="mt-2 text-sm text-destructive">
                  {t("modals.importAssets.nameColumnRequired")}
                </p>
              ) : null}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">
                  {t("modals.importAssets.previewTitle")}
                </span>
                <span className="text-muted-foreground">
                  {validRows.length} {t("modals.importAssets.ok")}
                  {errorCount > 0
                    ? ` · ${errorCount} ${t("modals.importAssets.rowsWithErrors")}`
                    : ""}
                </span>
              </div>
              <div className="max-h-56 overflow-y-auto rounded-md border">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-muted">
                    <tr>
                      <th className="px-2 py-1.5 text-left font-medium">
                        {t("modals.importAssets.colName")}
                      </th>
                      <th className="px-2 py-1.5 text-left font-medium">
                        {t("modals.importAssets.colCategory")}
                      </th>
                      <th className="px-2 py-1.5 text-right font-medium">
                        {t("modals.importAssets.colValue")}
                      </th>
                      <th className="px-2 py-1.5 text-left font-medium">
                        {t("modals.importAssets.colIssues")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(parsed?.rows ?? []).slice(0, 100).map((row) => (
                      <tr
                        key={row.index}
                        className={cn(
                          "border-t",
                          row.errors.length > 0 && "text-destructive",
                        )}
                      >
                        <td className="max-w-40 truncate px-2 py-1.5">
                          {row.name || "—"}
                        </td>
                        <td className="px-2 py-1.5">
                          {CAT_LABEL[row.cat] ?? row.cat}
                        </td>
                        <td className="px-2 py-1.5 text-right tabular-nums">
                          {row.val.toLocaleString("id-ID")}
                        </td>
                        <td className="px-2 py-1.5">
                          {row.errors.length > 0 ? row.errors.join(", ") : "✓"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <DialogFooter>
              <button
                className="ks-btn ks-btn-ghost"
                disabled={isSaving}
                type="button"
                onClick={handleReset}
              >
                <ArrowLeft size={14} />
                {t("modals.importAssets.back")}
              </button>
              <button
                className="ks-btn ks-btn-primary"
                disabled={isSaving || validRows.length === 0 || !nameCol}
                type="button"
                onClick={() => void handleImport()}
              >
                {t("modals.importAssets.importBtn")}
                {validRows.length > 0 ? ` (${validRows.length})` : ""}
              </button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
