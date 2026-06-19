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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUser } from "@/context/user-context";
import useCreateCategoryDataMutation from "@/hooks/api/category/useCreateCategoryDataMutation";

import { useCategoryList } from "./useCategoryList";

interface ParsedRow {
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

interface CategoryImportModalProps {
  organizationId: string;
}

const CategoryImportModal = ({ organizationId }: CategoryImportModalProps) => {
  const { t } = useTranslation("category");
  const { tokenPayload } = useUser();
  const { categoryData } = useCategoryList();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);

  const { mutateAsync: createCategory } = useCreateCategoryDataMutation();

  // Build sets of existing names and codes (lowercased for case-insensitive comparison)
  const existingNames = useMemo(
    () => new Set(categoryData.map((c) => c.name.toLowerCase())),
    [categoryData]
  );
  const existingCodes = useMemo(
    () => new Set(categoryData.map((c) => c.code?.toLowerCase()).filter(Boolean)),
    [categoryData]
  );

  const nameCol = t("list.import.columnName");
  const codeCol = t("list.import.columnCode");
  // Fallback aliases to handle locale mismatch (template downloaded in different locale)
  const nameColAliases = useMemo(
    () => [nameCol, "Category Name", "Nama Category"],
    [nameCol]
  );
  const codeColAliases = useMemo(
    () => [codeCol, "Code", "Kode"],
    [codeCol]
  );

  const handleClose = useCallback(() => {
    setFile(null);
    setParsedRows([]);
    setProgress(0);
    setResult(null);
    setOpen(false);
  }, []);

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
          toast.error(t("list.import.emptyFile"));
          setFile(null);
          return;
        }

        // Strip BOM and normalize whitespace from headers
        const normalizeHeader = (h: unknown) =>
          String(h ?? "").replace(/^\uFEFF/, "").trim().toLowerCase();
        const headers = (raw[0] as string[]).map((h) => String(h ?? "").replace(/^\uFEFF/, "").trim());
        const headersLower = headers.map(normalizeHeader);
        const dataRows = raw.slice(1);

        // Track names/codes seen within the Excel file itself for intra-file duplicate check
        const seenNames = new Set<string>();
        const seenCodes = new Set<string>();

        const parsed: ParsedRow[] = dataRows
          .map((row, idx) => {
            const byHeader = (colName: string) => {
              const needle = normalizeHeader(colName);
              const i = headersLower.indexOf(needle);
              return i >= 0 ? String(row[i] ?? "").trim() : "";
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

            if (!name && !code) return null;

            const errors: string[] = [];

            if (!name) {
              errors.push(t("list.import.nameRequired"));
            } else {
              const nameLower = name.toLowerCase();
              if (existingNames.has(nameLower)) {
                errors.push(t("list.import.nameDuplicateApi", { name }));
              } else if (seenNames.has(nameLower)) {
                errors.push(t("list.import.nameDuplicateFile", { name }));
              } else {
                seenNames.add(nameLower);
              }
            }

            if (code) {
              const codeLower = code.toLowerCase();
              if (existingCodes.has(codeLower)) {
                errors.push(t("list.import.codeDuplicateApi", { code }));
              } else if (seenCodes.has(codeLower)) {
                errors.push(t("list.import.codeDuplicateFile", { code }));
              } else {
                seenCodes.add(codeLower);
              }
            }

            return { code, errors, name, rowNumber: idx + 2 };
          })
          .filter((r): r is ParsedRow => r !== null);

        setParsedRows(parsed);
      } catch {
        toast.error("Failed to read file");
        setFile(null);
      } finally {
        setIsProcessing(false);
      }
    },
    [codeColAliases, existingCodes, existingNames, nameColAliases, t]
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

    const importResult: ImportResult = { errors: [], failed: 0, success: 0 };
    const orgId = tokenPayload?.organization_id || organizationId;

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      try {
        await createCategory({
          ...(row.code && { code: row.code }),
          name: row.name,
          organization_id: orgId,
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

    setResult(importResult);
    setIsProcessing(false);

    if (importResult.success > 0) {
      toast.success(
        t("list.import.result", {
          defaultValue: `Import complete: ${importResult.success} success, ${importResult.failed} failed`,
          failed: importResult.failed,
          success: importResult.success,
        })
      );
    }
  };

  const validCount = parsedRows.filter((r) => r.errors.length === 0).length;
  const invalidCount = parsedRows.filter((r) => r.errors.length > 0).length;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Upload className="mr-1 h-4 w-4" />
          {t("list.import.button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("list.import.title")}</DialogTitle>
          <DialogDescription>{t("list.import.description")}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-2">
          <div className="flex flex-col gap-4 py-2 pr-2">
            {!result && (
              <div
                {...getRootProps()}
                className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/30 hover:border-primary/50"
                }`}
              >
                <input {...getInputProps()} />
                <FileUp className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {isDragActive ? "Drop file here..." : t("list.import.dragDrop")}
                </p>
                {file && (
                  <p className="mt-2 text-sm font-medium text-foreground">{file.name}</p>
                )}
              </div>
            )}

            {isProcessing && progress > 0 && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("list.import.importing")}</p>
                <Progress value={progress} />
              </div>
            )}

            {result && (
              <div className="space-y-2">
                <Alert variant={result.failed > 0 ? "destructive" : "default"}>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    {t("list.import.result", {
                      defaultValue: `${result.success} success, ${result.failed} failed`,
                      failed: result.failed,
                      success: result.success,
                    })}
                  </AlertDescription>
                </Alert>
                {result.errors.map((e) => (
                  <Alert key={e.row} variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Row {e.row}: {e.error}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {parsedRows.length > 0 && !result && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {t("list.import.preview", {
                      count: parsedRows.length,
                      defaultValue: `Preview (${parsedRows.length} rows)`,
                    })}
                  </p>
                  <div className="flex gap-2 text-xs">
                    {validCount > 0 && (
                      <span className="text-green-600">{validCount} valid</span>
                    )}
                    {invalidCount > 0 && (
                      <span className="text-destructive">{invalidCount} invalid</span>
                    )}
                  </div>
                </div>
                <Table className="rounded-md border text-xs">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>{nameCol}</TableHead>
                      <TableHead>{codeCol}</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedRows.map((row) => (
                      <TableRow key={row.rowNumber}>
                        <TableCell>{row.rowNumber}</TableCell>
                        <TableCell>{row.name || "-"}</TableCell>
                        <TableCell>{row.code || "-"}</TableCell>
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
            {t("list.import.close")}
          </Button>
          {!result && parsedRows.length > 0 && (
            <Button disabled={isProcessing || validCount === 0} onClick={handleImport}>
              {isProcessing
                ? t("list.import.importing")
                : `${t("list.import.startImport")} (${validCount})`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryImportModal;
