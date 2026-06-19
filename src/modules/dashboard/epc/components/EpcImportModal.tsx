/* eslint-disable max-lines */
import {
  CheckCircle2,
  FileUp,
  Info,
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
import useCreateRfidDataMutation from "@/hooks/api/rfid/useCreateRfidDataMutation";
import { CreateRfidPayload, RfidCategory, RfidStatus, RfidType } from "@/types/rfid";

interface EpcImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedRow {
  rowNumber: number;
  data: Record<string, string>;
  errors: string[];
}

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}

export const EpcImportModal: React.FC<EpcImportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation(["epc", "common"]);
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const { mutateAsync: createRfidData } = useCreateRfidDataMutation({
    organizationId,
  });

  const handleClose = useCallback(() => {
    setFile(null);
    setParsedData([]);
    setImportProgress(0);
    setImportResult(null);
    onClose();
  }, [onClose]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const uploadedFile = acceptedFiles[0];
      if (!uploadedFile) return;

      setFile(uploadedFile);
      setImportResult(null);

      // Parse CSV file
      try {
        setIsProcessing(true);
        const XLSX = await import("xlsx");
        const data = await uploadedFile.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        }) as string[][];

        if (jsonData.length < 2) {
          toast.error(
            t("epc:import.emptyFile", "Excel file is empty or has no data"),
          );
          setFile(null);
          return;
        }

        // Parse headers and rows — strip BOM and normalize whitespace
        const headers = (jsonData[0] as string[]).map((h) =>
          String(h ?? "").replace(/^\uFEFF/, "").trim()
        );
        const rows = jsonData.slice(1);

        const parsed: ParsedRow[] = rows
          .map((row, index) => {
            const rowData: Record<string, string> = {};
            headers.forEach((header, colIndex) => {
              rowData[header] = String(row[colIndex] || "").trim();
            });

            // Skip completely empty rows
            const hasData = Object.values(rowData).some((val) => val !== "");
            if (!hasData) return null;

            const errors: string[] = [];

            // Validate required fields
            if (!rowData["Name"]) {
              errors.push("Name is required");
            }
            if (!rowData["EPC Code"]) {
              errors.push("EPC Code is required");
            }

            // Validate Type
            const typeValue = rowData["Type"]?.toUpperCase().trim();
            if (!typeValue) {
              errors.push("Type is required");
            } else if (
              typeValue !== RfidType.REUSABLE &&
              typeValue !== RfidType.DISPOSABLE
            ) {
              errors.push("Type must be REUSABLE or DISPOSABLE");
            }

            // Validate Category
            const categoryValue = rowData["Category"]?.toUpperCase().trim();
            if (!categoryValue) {
              errors.push("Category is required");
            } else if (
              categoryValue !== RfidCategory.SINGLE &&
              categoryValue !== RfidCategory.PACKAGE
            ) {
              errors.push("Category must be SINGLE or PACKAGE");
            }

            // Validate Status
            const statusValue = rowData["Status"]?.toUpperCase().trim();
            if (!statusValue) {
              errors.push("Status is required");
            } else if (
              statusValue !== RfidStatus.ACTIVE &&
              statusValue !== RfidStatus.INACTIVE
            ) {
              errors.push("Status must be ACTIVE or INACTIVE");
            }

            return {
              data: rowData,
              errors,
              rowNumber: index + 2, // +2 because index starts at 0 and we skip header row
            };
          })
          .filter((row): row is ParsedRow => row !== null);

        setParsedData(parsed);
      } catch (error) {
        console.error("Failed to parse Excel file:", error);
        toast.error(t("epc:import.parseError", "Failed to parse Excel file"));
        setFile(null);
      } finally {
        setIsProcessing(false);
      }
    },
    [t],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/vnd.ms-excel": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "text/csv": [".csv"],
    },
    maxFiles: 1,
    onDrop,
  });

  const handleImport = async () => {
    if (!parsedData.length) return;

    // Check if there are any rows with errors
    const rowsWithErrors = parsedData.filter((row) => row.errors.length > 0);
    if (rowsWithErrors.length > 0) {
      toast.error(
        t(
          "epc:import.hasErrors",
          "Cannot import: Some rows have validation errors. Please fix them first.",
        ),
      );
      return;
    }

    setIsProcessing(true);
    setImportProgress(0);

    const results: ImportResult = {
      errors: [],
      failed: 0,
      success: 0,
    };

    // Collect all valid RFIDs for bulk creation
    const rfids: CreateRfidPayload["rfids"] = [];

    for (const row of parsedData) {
      try {
        const typeValue = row.data["Type"]?.toUpperCase().trim();
        const categoryValue = row.data["Category"]?.toUpperCase().trim();
        const statusValue = row.data["Status"]?.toUpperCase().trim();

        // Normalize type value
        let normalizedType: RfidType;
        if (typeValue === RfidType.REUSABLE) {
          normalizedType = RfidType.REUSABLE;
        } else {
          normalizedType = RfidType.DISPOSABLE;
        }

        // Normalize category value
        let normalizedCategory: RfidCategory;
        if (categoryValue === RfidCategory.SINGLE) {
          normalizedCategory = RfidCategory.SINGLE;
        } else {
          normalizedCategory = RfidCategory.PACKAGE;
        }

        // Normalize status value
        let normalizedStatus: RfidStatus;
        if (statusValue === RfidStatus.ACTIVE) {
          normalizedStatus = RfidStatus.ACTIVE;
        } else {
          normalizedStatus = RfidStatus.INACTIVE;
        }

        rfids.push({
          category: normalizedCategory,
          epc: row.data["EPC Code"],
          name: row.data["Name"],
          status: normalizedStatus,
          type: normalizedType,
        });

        results.success++;
      } catch (error) {
        console.error(`Failed to process row ${row.rowNumber}:`, error);
        results.failed++;
        results.errors.push({
          error: error instanceof Error ? error.message : "Unknown error",
          row: row.rowNumber,
        });
      }

      setImportProgress(Math.round((rfids.length / parsedData.length) * 100));
    }

    // Bulk create RFIDs
    if (rfids.length > 0) {
      try {
        await createRfidData({ rfids });
      } catch (error) {
        console.error("Failed to create RFIDs:", error);

        // Hook already shows error toast with metadata.message via toastError
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        results.failed = rfids.length;
        results.success = 0;
        results.errors = rfids.map((_, i) => ({
          error: errorMessage,
          row: i + 2,
        }));

        setImportResult(results);
        setIsProcessing(false);
        return;
      }
    }

    setImportResult(results);
    setIsProcessing(false);

    // Success - hook already shows toast and invalidates query
    handleClose();
  };

  const validRows = parsedData.filter((row) => row.errors.length === 0);
  const errorRows = parsedData.filter((row) => row.errors.length > 0);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileUp className="h-5 w-5" />
            {t("epc:import.title", "Import EPCs from Excel")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "epc:import.description",
              "Upload an Excel file to bulk create EPC/RFID tags. Use the template for correct format.",
            )}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 py-4 pr-4">
            {/* Instructions */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm space-y-2">
                <p className="font-semibold">
                  {t("epc:import.instructions", "Instructions:")}
                </p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>
                    {t(
                      "epc:import.step1",
                      "Download the template using 'Export Template' button",
                    )}
                  </li>
                  <li>{t("epc:import.step2", "Fill in your EPC/RFID data")}</li>
                  <li>
                    {t(
                      "epc:import.step3",
                      "Upload the completed Excel file here",
                    )}
                  </li>
                  <li>
                    {t(
                      "epc:import.step4",
                      "Review the preview and click 'Import'",
                    )}
                  </li>
                </ol>
              </AlertDescription>
            </Alert>

            {/* File Upload Area */}
            {!file && (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">
                  {isDragActive
                    ? t("epc:import.dropHere", "Drop the file here...")
                    : t(
                        "epc:import.dragDrop",
                        "Drag & drop an Excel file here",
                      )}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("epc:import.orClick", "or click to select a file")}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {t(
                    "epc:import.supportedFormats",
                    "Supported formats: CSV, XLSX",
                  )}
                </p>
              </div>
            )}

            {/* Processing Indicator */}
            {isProcessing && !importResult && (
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {importProgress > 0
                    ? t("epc:import.importing", "Importing EPCs...")
                    : t("epc:import.processing", "Processing file...")}
                </p>
                <Progress value={importProgress} />
              </div>
            )}

            {/* File Info and Preview */}
            {file && parsedData.length > 0 && !importResult && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileUp className="h-4 w-4" />
                    <span className="font-medium text-sm">{file.name}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setFile(null);
                      setParsedData([]);
                    }}
                  >
                    {t("common:remove", "Remove")}
                  </Button>
                </div>

                {/* Validation Summary */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium">
                        {t("epc:import.validRows", "Valid")}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                      {validRows.length}
                    </p>
                  </div>

                  {errorRows.length > 0 && (
                    <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <span className="text-sm font-medium">
                          {t("epc:import.errors", "Errors")}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                        {errorRows.length}
                      </p>
                    </div>
                  )}
                </div>

                {/* Preview Table */}
                <div className="border rounded-lg">
                  <div className="p-3 bg-muted border-b">
                    <p className="text-sm font-medium">
                      {t("epc:import.preview", "Preview (first 10 rows)")}
                    </p>
                  </div>
                  <ScrollArea className="h-[300px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">Row</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>EPC Code</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Validation</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parsedData.slice(0, 10).map((row) => (
                          <TableRow key={row.rowNumber}>
                            <TableCell className="font-medium">
                              {row.rowNumber}
                            </TableCell>
                            <TableCell>{row.data["Name"] || "-"}</TableCell>
                            <TableCell className="font-mono text-xs">
                              {row.data["EPC Code"] || "-"}
                            </TableCell>
                            <TableCell>{row.data["Type"] || "-"}</TableCell>
                            <TableCell>{row.data["Category"] || "-"}</TableCell>
                            <TableCell>{row.data["Status"] || "-"}</TableCell>
                            <TableCell>
                              {row.errors.length > 0 ? (
                                <div className="flex items-start gap-2 text-red-600 dark:text-red-400">
                                  <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                  <div className="text-xs space-y-1">
                                    {row.errors.map((err, i) => (
                                      <p key={i}>{err}</p>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                  <CheckCircle2 className="h-4 w-4" />
                                  <span className="text-xs">Valid</span>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              </div>
            )}

            {/* Import Results */}
            {importResult && (
              <div className="space-y-4">
                <Alert
                  variant={
                    importResult.failed === 0 ? "default" : "destructive"
                  }
                >
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-semibold mb-2">
                      {t("epc:import.complete", "Import Complete")}
                    </p>
                    <p>
                      {t("epc:import.successCount", {
                        count: importResult.success,
                        defaultValue: `Successfully imported: ${importResult.success}`,
                      })}
                    </p>
                    {importResult.failed > 0 && (
                      <p className="text-red-600 dark:text-red-400">
                        {t("epc:import.failedCount", {
                          count: importResult.failed,
                          defaultValue: `Failed: ${importResult.failed}`,
                        })}
                      </p>
                    )}
                  </AlertDescription>
                </Alert>

                {importResult.errors.length > 0 && (
                  <div className="border rounded-lg">
                    <div className="p-3 bg-muted border-b">
                      <p className="text-sm font-medium text-red-600 dark:text-red-400">
                        {t("epc:import.errorDetails", "Error Details")}
                      </p>
                    </div>
                    <ScrollArea className="h-[200px] p-4">
                      <div className="space-y-2">
                        {importResult.errors.map((err, index) => (
                          <div key={index} className="text-sm">
                            <span className="font-medium">Row {err.row}:</span>{" "}
                            <span className="text-red-600 dark:text-red-400">
                              {err.error}
                            </span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {importResult
              ? t("common:close", "Close")
              : t("common:cancel", "Cancel")}
          </Button>
          {!importResult && parsedData.length > 0 && (
            <Button
              disabled={
                isProcessing || errorRows.length > 0 || validRows.length === 0
              }
              onClick={handleImport}
            >
              {isProcessing
                ? t("epc:import.importing", "Importing...")
                : t("epc:import.importButton", {
                    count: validRows.length,
                    defaultValue: `Import ${validRows.length} EPC(s)`,
                  })}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
