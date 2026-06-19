import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, FileUp, Upload, XCircle } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUser } from "@/context/user-context";
import { postCategoryDataService } from "@/services/category/postCategoryDataService";
import { CategoryItemType } from "@/types/category";

interface ParsedRow {
  attributeDefaults: { attribute_id: string; values: string[] }[];
  code: string;
  errors: string[];
  name: string;
  rowNumber: number;
}

interface ImportResult {
  errors: { error: string; row: number }[];
  failed: number;
  success: number;
}

interface SubCategoryImportModalProps {
  categoryId: string;
  organizationId: string;
  subCategories: CategoryItemType[];
}

const SubCategoryImportModal = ({
  categoryId,
  organizationId,
  subCategories,
}: SubCategoryImportModalProps) => {
  const { t } = useTranslation("category");
  const { hasMultipleStores, stores, tokenPayload } = useUser();
  const defaultStoreId = !hasMultipleStores && stores.length === 1 ? stores[0].id : "none";
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string>(defaultStoreId);
  const [importLabel, setImportLabel] = useState("");

  const queryClient = useQueryClient();

  const attrSchema = useMemo(() => {
    const schemaItem = subCategories.find((s) => s.attribute_items && s.attribute_items.length > 0);
    return schemaItem?.attribute_items ?? [];
  }, [subCategories]);

  const attrByName = useMemo(() => {
    const map: Record<string, { id: string; is_required: boolean }> = {};
    attrSchema.forEach((ai) => {
      map[ai.attribute.name] = { id: ai.attribute.id, is_required: ai.is_required };
    });
    return map;
  }, [attrSchema]);

  const nameCol = t("sub.import.columnName");
  const codeCol = t("sub.import.columnCode");
  // Fallback aliases to handle locale mismatch (template downloaded in different locale)
  const nameColAliases = useMemo(
    () => [nameCol, "Sub Category Name", "Nama Sub Category"],
    [nameCol]
  );
  const codeColAliases = useMemo(
    () => [codeCol, "Code", "Kode"],
    [codeCol]
  );

  const handleClose = useCallback(() => {
    setFile(null);
    setImportLabel("");
    setParsedRows([]);
    setProgress(0);
    setResult(null);
    setSelectedStoreId(defaultStoreId);
    setOpen(false);
  }, [defaultStoreId]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const uploaded = acceptedFiles[0];
      if (!uploaded) return;

      setFile(uploaded);
      setResult(null);
      setIsProcessing(true);

      try {
        const XLSX = await import("xlsx");
        const buffer = await uploaded.arrayBuffer();
        const workbook = XLSX.read(buffer);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];

        if (raw.length < 2) {
          toast.error(t("sub.import.emptyFile"));
          setFile(null);
          return;
        }

        // Strip BOM and normalize whitespace from headers
        const normalizeHeader = (h: unknown) =>
          String(h ?? "").replace(/^\uFEFF/, "").trim().toLowerCase();
        const headers = (raw[0] as string[]).map((h) => String(h ?? "").replace(/^\uFEFF/, "").trim());
        const headersLower = headers.map(normalizeHeader);
        const dataRows = raw.slice(1);

        // Only check duplicates within the file itself
        const seenCodes = new Set<string>();

        const parsed: ParsedRow[] = dataRows
          .map((row, idx) => {
            const cell = (i: number) => String(row[i] ?? "").trim();
            const byHeader = (colName: string) => {
              // Case-insensitive lookup with BOM/whitespace normalization
              const needle = normalizeHeader(colName);
              const i = headersLower.indexOf(needle);
              return i >= 0 ? cell(i) : "";
            };
            const byHeaderAliases = (aliases: string[]) => {
              for (const alias of aliases) {
                const val = byHeader(alias);
                if (val) return val;
              }
              return "";
            };

            const name = byHeaderAliases(nameColAliases);
            const code = byHeaderAliases(codeColAliases);

            if (!name && !code && headers.every((h) => !byHeader(h))) return null;

            const errors: string[] = [];
            if (!name) errors.push(t("sub.import.nameRequired"));

            if (code) {
              const codeLower = code.toLowerCase();
              if (seenCodes.has(codeLower)) {
                errors.push(t("sub.import.codeDuplicateFile", { code }));
              } else {
                seenCodes.add(codeLower);
              }
            }

            const attributeDefaults: { attribute_id: string; values: string[] }[] = [];
            Object.entries(attrByName).forEach(([attrName, { id }]) => {
              const val = byHeader(attrName);
              if (val) attributeDefaults.push({ attribute_id: id, values: [val] });
            });

            return { attributeDefaults, code, errors, name, rowNumber: idx + 2 };
          })
          .filter((r): r is ParsedRow => r !== null);

        setParsedRows(parsed);
      } catch {
        toast.error("Gagal membaca file");
        setFile(null);
      } finally {
        setIsProcessing(false);
      }
    },
    [attrByName, codeColAliases, nameColAliases, t]
  );

  const { getInputProps, getRootProps, isDragActive } = useDropzone({
    accept: {
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    maxFiles: 1,
    onDrop,
  });

  const handleImport = async () => {
    const validRows = parsedRows.filter((r) => r.errors.length === 0);
    if (validRows.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setImportLabel(`0 / ${validRows.length}`);

    const orgId = tokenPayload?.organization_id || organizationId;
    const attributeItems = attrSchema.map((ai) => ({
      attribute_id: ai.attribute.id,
      is_required: ai.is_required,
    }));

    const importResult: ImportResult = { errors: [], failed: 0, success: 0 };

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      setImportLabel(`${i + 1} / ${validRows.length}`);
      try {
        await postCategoryDataService({
          ...(row.attributeDefaults.length > 0 && { attribute_defaults: row.attributeDefaults }),
          ...(attributeItems.length > 0 && { attribute_items: attributeItems }),
          ...(row.code && { code: row.code }),
          ...(selectedStoreId !== "none" && { store_ids: [selectedStoreId] }),
          name: row.name,
          organization_id: orgId,
          parent_id: categoryId,
        });
        importResult.success += 1;
      } catch (err) {
        importResult.failed += 1;
        importResult.errors.push({
          error: err instanceof Error ? err.message : "Unknown error",
          row: row.rowNumber,
        });
      }
      setProgress(Math.round(((i + 1) / validRows.length) * 100));
    }

    // Invalidate once after all rows are processed
    queryClient.invalidateQueries({
      queryKey: ["subcategories", orgId, categoryId],
    });

    setResult(importResult);
    setIsProcessing(false);

    if (importResult.success > 0) {
      toast.success(
        t("sub.import.result", {
          defaultValue: `Import complete: ${importResult.success} success, ${importResult.failed} failed`,
          failed: importResult.failed,
          success: importResult.success,
        })
      );
    }
  };

  const validCount = parsedRows.filter((r) => r.errors.length === 0).length;
  const hasSchema = attrSchema.length > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Upload className="mr-1 h-4 w-4" />
          {t("sub.import.button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{t("sub.import.title")}</DialogTitle>
          <DialogDescription>{t("sub.import.description")}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-2">
          <div className="flex flex-col gap-4 py-2 pr-2">
            {!hasSchema && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{t("sub.import.noSchema")}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">{t("sub.import.storeLabel")}</label>
                <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("sub.import.storePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("sub.import.storeNone")}</SelectItem>
                    {stores.map((store) => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  Pastikan store yang dipilih sudah benar sebelum menyimpan
                </p>
              </div>

            {hasSchema && !result && (
              <div
                {...getRootProps()}
                className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                  isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/50"
                }`}
              >
                <input {...getInputProps()} />
                <FileUp className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {isDragActive ? "Drop file di sini..." : t("sub.import.dragDrop")}
                </p>
                {file && (
                  <p className="mt-2 text-sm font-medium text-foreground">{file.name}</p>
                )}
              </div>
            )}

            {isProcessing && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{t("sub.import.importing")} {importLabel}</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            {result && (
              <div className="space-y-2">
                <Alert variant={result.failed > 0 ? "destructive" : "default"}>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    {t("sub.import.result", {
                      defaultValue: `${result.success} success, ${result.failed} failed`,
                      failed: result.failed,
                      success: result.success,
                    })}
                  </AlertDescription>
                </Alert>
                {result.errors.map((e) => (
                  <Alert key={e.row} variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      {e.row > 0 ? `Row ${e.row}: ` : ""}{e.error}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {parsedRows.length > 0 && !result && (
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {t("sub.import.preview", {
                    count: parsedRows.length,
                    defaultValue: `Preview (${parsedRows.length} rows)`,
                  })}
                </p>
                <Table className="rounded-md border text-xs">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>{nameCol}</TableHead>
                      <TableHead>{codeCol}</TableHead>
                      <TableHead>Defaults</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedRows.map((row) => (
                      <TableRow key={row.rowNumber}>
                        <TableCell>{row.rowNumber}</TableCell>
                        <TableCell>{row.name || "-"}</TableCell>
                        <TableCell>{row.code || "-"}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {row.attributeDefaults.length > 0
                            ? `${row.attributeDefaults.length} attr`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {row.errors.length > 0 ? (
                            <span className="flex items-center gap-1 text-destructive">
                              <XCircle className="h-3 w-3" />
                              {row.errors[0]}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle2 className="h-3 w-3" />
                              OK
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={handleClose}>
            Tutup
          </Button>
          {!result && parsedRows.length > 0 && (
            <Button
              disabled={isProcessing || validCount === 0}
              onClick={handleImport}
            >
              {isProcessing
                ? t("sub.import.importing")
                : `${t("sub.import.startImport")} (${validCount})`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubCategoryImportModal;
