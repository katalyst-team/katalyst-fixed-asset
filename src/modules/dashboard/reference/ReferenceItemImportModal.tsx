"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  FileUp,
  Upload,
  XCircle,
} from "lucide-react";
import { useTranslation } from "next-i18next";
import { useCallback, useState } from "react";
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
import { Label } from "@/components/ui/label";
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
import useGetStoreDataQuery from "@/hooks/api/store/useGetStoreDataQuery";
import { createReferenceItemService } from "@/services/reference/createReferenceItemService";

interface ParsedRow {
  code: string;
  errors: string[];
  name: string;
  rowNumber: number;
  sort_order: number;
  store_id: string;
}

interface ImportResult {
  errors: { error: string; row: number }[];
  failed: number;
  success: number;
}

interface ReferenceItemImportModalProps {
  groupId: string;
}

const ReferenceItemImportModal = ({ groupId }: ReferenceItemImportModalProps) => {
  const { t } = useTranslation(["reference", "common"]);
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("none");

  const queryClient = useQueryClient();
  const { data: storeData } = useGetStoreDataQuery({ organizationId });
  const stores = storeData?.data?.stores ?? [];

  const handleClose = useCallback(() => {
    setFile(null);
    setParsedRows([]);
    setProgress(0);
    setResult(null);
    setOpen(false);
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
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
      const raw = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

      if (raw.length < 2) {
        toast.error(t("reference:import.emptyFile", "File is empty or has no data rows"));
        setFile(null);
        setIsProcessing(false);
        return;
      }

      const headers = (raw[0] as string[]).map((h) => String(h ?? "").replace(/^\uFEFF/, "").trim().toLowerCase());
      const nameIdx = headers.findIndex((h) => h.startsWith("name"));
      const codeIdx = headers.findIndex((h) => h.startsWith("code"));
      const sortIdx = headers.findIndex((h) => h.startsWith("sort"));
      const storeIdx = headers.findIndex((h) => h.startsWith("store"));

      if (nameIdx === -1) {
        toast.error(t("reference:import.missingNameColumn", "Missing required column: Name"));
        setFile(null);
        setIsProcessing(false);
        return;
      }

      const dataRows = raw.slice(1);
      const cell = (row: unknown[], i: number) =>
        i >= 0 ? String(row[i] ?? "").trim() : "";

      const parsed: ParsedRow[] = dataRows
        .map((row, idx) => {
          const name = cell(row, nameIdx);
          const code = cell(row, codeIdx);
          const sortRaw = cell(row, sortIdx);
          const storeFromFile = cell(row, storeIdx);

          const errors: string[] = [];
          if (!name) errors.push(t("reference:import.errorNameRequired", "Name is required"));

          return {
            code,
            errors,
            name,
            rowNumber: idx + 2,
            sort_order: sortRaw ? parseInt(sortRaw, 10) || 0 : 0,
            store_id: storeFromFile,
          };
        })
        .filter((r) => r.name || r.errors.length > 0);

      setParsedRows(parsed);
    } catch {
      toast.error(t("reference:import.parseError", "Failed to parse file"));
      setFile(null);
    } finally {
      setIsProcessing(false);
    }
  }, [t]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    maxFiles: 1,
    onDrop,
  });

  const validRows = parsedRows.filter((r) => r.errors.length === 0);
  const invalidRows = parsedRows.filter((r) => r.errors.length > 0);

  // Resolve effective store_id: modal picker overrides file column
  const effectiveStoreId = (row: ParsedRow): string | undefined => {
    if (selectedStoreId !== "none") {
      return selectedStoreId === "global" ? undefined : selectedStoreId;
    }
    return row.store_id || undefined;
  };

  const handleImport = async () => {
    if (validRows.length === 0) return;

    setIsProcessing(true);
    setProgress(0);

    const errors: { error: string; row: number }[] = [];
    let success = 0;

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      try {
        await createReferenceItemService({
          data: {
            code: row.code || undefined,
            name: row.name,
            sort_order: row.sort_order,
          },
          groupId,
          organizationId,
          store_id: effectiveStoreId(row),
        });
        success++;
      } catch (err) {
        errors.push({
          error: err instanceof Error ? err.message : "Unknown error",
          row: row.rowNumber,
        });
      }
      setProgress(Math.round(((i + 1) / validRows.length) * 100));
    }

    // Invalidate once after all rows are processed
    queryClient.invalidateQueries({ queryKey: ["referenceItems", organizationId, groupId] });

    setResult({ errors, failed: errors.length, success });
    setIsProcessing(false);

    if (errors.length === 0) {
      toast.success(
        t("reference:import.success", "Imported {{count}} items", {
          count: success,
        })
      );
    } else {
      toast.warning(
        t("reference:import.partial", "Imported {{success}}, failed {{failed}}", {
          failed: errors.length,
          success,
        })
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Upload className="mr-1.5 h-4 w-4" />
          {t("reference:buttons.import", "Import")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t("reference:modal.import.title", "Import Reference Items")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "reference:modal.import.description",
              "Upload an Excel file (.xlsx) to bulk-create reference items. Use the Export Template button to get the correct format."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Store override picker */}
          <div className="space-y-1.5">
            <Label>
              {t("reference:fields.store", "Store")}
              <span className="ml-1 text-xs text-muted-foreground">
                ({t("reference:import.storeOverrideHint", "overrides Store ID column in file")})
              </span>
            </Label>
            <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  {t("reference:import.storeFromFile", "Use Store ID from file")}
                </SelectItem>
                <SelectItem value="global">
                  {t("reference:fields.storeGlobal", "Global (all stores)")}
                </SelectItem>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dropzone */}
          {!file && (
            <div
              {...getRootProps()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
            >
              <input {...getInputProps()} />
              <FileUp className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">
                {isDragActive
                  ? t("reference:import.dropHere", "Drop file here")
                  : t("reference:import.dragOrClick", "Drag & drop or click to select")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("reference:import.acceptedFormats", ".xlsx files only")}
              </p>
            </div>
          )}

          {/* Parsed preview */}
          {file && !result && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{file.name}</span>
                <div className="flex gap-3 text-xs">
                  {validRows.length > 0 && (
                    <span className="text-green-600">
                      <CheckCircle2 className="mr-0.5 inline h-3.5 w-3.5" />
                      {validRows.length} valid
                    </span>
                  )}
                  {invalidRows.length > 0 && (
                    <span className="text-destructive">
                      <XCircle className="mr-0.5 inline h-3.5 w-3.5" />
                      {invalidRows.length} invalid
                    </span>
                  )}
                </div>
              </div>

              <ScrollArea className="h-[200px] rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Row</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Sort</TableHead>
                      <TableHead>Store ID</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedRows.map((row) => (
                      <TableRow
                        key={row.rowNumber}
                        className={row.errors.length > 0 ? "bg-destructive/5" : undefined}
                      >
                        <TableCell>{row.rowNumber}</TableCell>
                        <TableCell>{row.name || <span className="text-muted-foreground">-</span>}</TableCell>
                        <TableCell>{row.code || "-"}</TableCell>
                        <TableCell>{row.sort_order}</TableCell>
                        <TableCell className="max-w-[120px] truncate text-xs text-muted-foreground">
                          {row.store_id || "-"}
                        </TableCell>
                        <TableCell>
                          {row.errors.length === 0 ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <span className="text-xs text-destructive">
                              {row.errors.join(", ")}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>

              {isProcessing && (
                <Progress className="h-2" value={progress} />
              )}

              <Button
                className="w-full text-xs"
                size="sm"
                variant="ghost"
                onClick={() => { setFile(null); setParsedRows([]); }}
              >
                {t("reference:import.changeFile", "Change file")}
              </Button>
            </div>
          )}

          {/* Result */}
          {result && (
            <Alert variant={result.failed > 0 ? "destructive" : "default"}>
              {result.failed > 0 ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <AlertDescription>
                {t("reference:import.resultSummary", "Imported {{success}} items. {{failed}} failed.", {
                  failed: result.failed,
                  success: result.success,
                })}
                {result.errors.length > 0 && (
                  <ul className="mt-1 list-inside list-disc text-xs">
                    {result.errors.map((e) => (
                      <li key={e.row}>Row {e.row}: {e.error}</li>
                    ))}
                  </ul>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {result ? t("common:close", "Close") : t("common:cancel", "Cancel")}
          </Button>
          {!result && validRows.length > 0 && (
            <Button disabled={isProcessing} onClick={handleImport}>
              <Upload className="mr-1.5 h-4 w-4" />
              {isProcessing
                ? t("reference:import.importing", "Importing... {{progress}}%", { progress })
                : t("reference:import.importCount", "Import {{count}} items", { count: validRows.length })}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReferenceItemImportModal;
