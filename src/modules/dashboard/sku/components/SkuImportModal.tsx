/* eslint-disable max-lines */
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  FileUp,
  Info,
  Upload,
  XCircle,
} from "lucide-react";
import { useTranslation } from "next-i18next";
import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";

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
import useGetCategoryDataQuery from "@/hooks/api/category/useGetCategoryDataQuery";
import {
  KEY_USE_GET_SKU_DATA,
  type UseGetSkuDataQueryParams,
} from "@/hooks/api/sku/useGetSKUDataQuery";
import { toastError } from "@/services";
import { postSkuDataService } from "@/services/sku/postSkuDataService";
import { AttributeTypeEnum } from "@/types/attribute";
import { CreateSkuParams, SkuStatus, SkuType } from "@/types/sku";

import { useSkuStore } from "../store/SkuStore";

type QueryContextOverride = Pick<UseGetSkuDataQueryParams, "filters">;

interface SkuImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  queryContextOverride?: QueryContextOverride;
  autoCloseOnSuccess?: boolean;
  allowedSkuTypes?: SkuType[];
}

interface ParsedRow {
  rowNumber: number;
  data: Record<string, string>;
  errors: string[];
  warnings: string[];
}

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}

export const SkuImportModal: React.FC<SkuImportModalProps> = ({
  isOpen,
  onClose,
  queryContextOverride,
  autoCloseOnSuccess = false,
  allowedSkuTypes,
}) => {
  const { t } = useTranslation(["sku", "common"]);
  const { tokenPayload } = useUser();
  const queryClient = useQueryClient();
  const organizationId = tokenPayload?.organization_id ?? "";

  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const filters = useSkuStore(useShallow((state) => state.filters));
  const effectiveFilters =
    queryContextOverride?.filters ?? filters ?? undefined;

  const { data: categoryData } = useGetCategoryDataQuery({ organizationId });

  const categories = useMemo(
    () => categoryData?.data?.categories || [],
    [categoryData?.data?.categories],
  );

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
            t("sku:import.emptyFile", "Excel file is empty or has no data"),
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
            const warnings: string[] = [];

            // Validate required fields
            if (!rowData["SKU Name"]) {
              errors.push("SKU Name is required");
            }
            if (!rowData["Status"]) {
              errors.push("Status is required");
            } else if (!["ACTIVE", "INACTIVE"].includes(rowData["Status"])) {
              errors.push("Status must be ACTIVE or INACTIVE");
            }
            if (!rowData["Type"]) {
              errors.push("Type is required");
            } else if (!["COMMON", "UNIQUE"].includes(rowData["Type"])) {
              errors.push("Type must be COMMON or UNIQUE");
            } else if (
              allowedSkuTypes &&
              !allowedSkuTypes.includes(rowData["Type"] as SkuType)
            ) {
              const allowedLabel =
                allowedSkuTypes.length === 1
                  ? allowedSkuTypes[0]
                  : allowedSkuTypes.join(", ");
              errors.push(`Type must be ${allowedLabel} for this import`);
            }

            // Validate category exists
            const categoryExists = categories.find(
              (cat) => cat.id === rowData["Category ID"],
            );
            if (rowData["Category ID"] && !categoryExists) {
              errors.push(`Category ID '${rowData["Category ID"]}' not found`);
            }

            // Validate image URLs format
            if (rowData["Image URLs (comma-separated, max 5)"]) {
              const urls = rowData["Image URLs (comma-separated, max 5)"]
                .split(",")
                .map((u) => u.trim())
                .filter((u) => u);
              if (urls.length > 5) {
                warnings.push(
                  `More than 5 image URLs provided (only first 5 will be used)`,
                );
              }
            }

            return {
              data: rowData,
              errors,
              rowNumber: index + 2, // +2 because index starts at 0 and we skip header row
              warnings,
            };
          })
          .filter((row): row is ParsedRow => row !== null);

        setParsedData(parsed);
      } catch (error) {
        console.error("Failed to parse Excel file:", error);
        toast.error(t("sku:import.parseError", "Failed to parse Excel file"));
        setFile(null);
      } finally {
        setIsProcessing(false);
      }
    },
    [allowedSkuTypes, categories, t],
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
          "sku:import.hasErrors",
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

    for (let i = 0; i < parsedData.length; i++) {
      const row = parsedData[i];

      try {
        // Find category to get attribute structure (optional)
        const category = row.data["Category ID"]
          ? categories.find((cat) => cat.id === row.data["Category ID"])
          : undefined;

        // Parse image URLs
        const imageUrls = row.data["Image URLs (comma-separated, max 5)"]
          ? row.data["Image URLs (comma-separated, max 5)"]
              .split(",")
              .map((url) => url.trim())
              .filter((url) => url)
              .slice(0, 5)
          : [];

        // Build attribute items from CSV columns
        const attributeItems: {
          attribute_id: string;
          values: string | number | string[];
        }[] = [];

        category?.attribute_items?.forEach((attrItem) => {
          // Match exact attribute name followed by optional asterisk (*) and/or optional suffix in parentheses
          // e.g., "Berat* (number)" should only match "Berat", not "Berat Asli" or "Berat Atribut"
          const attrNameEscaped = attrItem.attribute.name.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&",
          );
          const columnPattern = new RegExp(
            `^${attrNameEscaped}\\*?( \\(.*\\))?$`,
          );
          const columnName = Object.keys(row.data).find((key) =>
            columnPattern.test(key),
          );

          if (columnName && row.data[columnName]) {
            const rawValue = row.data[columnName];
            let parsedValue: string | number | string[];

            switch (attrItem.attribute.type) {
              case AttributeTypeEnum.NUMBER:
                parsedValue = parseFloat(rawValue) || 0;
                break;
              case AttributeTypeEnum.BOOLEAN:
                parsedValue =
                  rawValue.toLowerCase() === "true" ? "true" : "false";
                break;
              case AttributeTypeEnum.CHECKBOX:
                parsedValue = rawValue
                  .split(",")
                  .map((v) => v.trim())
                  .filter((v) => v);
                break;
              default:
                parsedValue = rawValue;
            }

            attributeItems.push({
              attribute_id: attrItem.attribute.id,
              values: parsedValue,
            });
          } else if (attrItem.is_required) {
            throw new Error(
              `Required attribute '${attrItem.attribute.name}' is missing`,
            );
          }
        });

        // Create SKU params
        const skuParams: CreateSkuParams = {
          attribute_items: attributeItems,
          image_urls: imageUrls,
          name: row.data["SKU Name"],
          organization_id: organizationId,
          sku: row.data["SKU Name"],
          sku_type: row.data["Type"] as SkuType,
          status: row.data["Status"] as SkuStatus,
        };

        // Add internal_code only if provided
        if (row.data["Internal Code (optional)"]) {
          skuParams.internal_code = row.data["Internal Code (optional)"];
        }

        // Add category_ids only if provided
        if (row.data["Category ID"]) {
          skuParams.category_ids = [row.data["Category ID"]];
        }

        // Create SKU
        await postSkuDataService(skuParams);
        results.success++;
      } catch (error) {
        console.error(`Failed to import row ${row.rowNumber}:`, error);
        results.failed++;
        results.errors.push({
          error: error instanceof Error ? error.message : "Unknown error",
          row: row.rowNumber,
        });
      }

      setImportProgress(Math.round(((i + 1) / parsedData.length) * 100));
    }

    setImportResult(results);
    setIsProcessing(false);

    if (results.success > 0) {
      // Invalidate SKU query to refresh the list on success
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_SKU_DATA(organizationId, effectiveFilters),
      });

      toast.success(
        t("sku:import.successMessage", {
          count: results.success,
          defaultValue: `Successfully imported ${results.success} SKU(s)`,
        }),
      );

      if (autoCloseOnSuccess) {
        handleClose();
      }
    }

    if (results.failed > 0) {
      toastError(
        new Error(
          t("sku:import.failedMessage", {
            count: results.failed,
            defaultValue: `Failed to import ${results.failed} SKU(s)`,
          }),
        ),
      );
    }
  };

  const validRows = parsedData.filter((row) => row.errors.length === 0);
  const errorRows = parsedData.filter((row) => row.errors.length > 0);
  const warningRows = parsedData.filter(
    (row) => row.warnings.length > 0 && row.errors.length === 0,
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileUp className="h-5 w-5" />
            {t("sku:import.title", "Import SKUs from Excel")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "sku:import.description",
              "Upload an Excel file to bulk create SKUs. Use the template for correct format.",
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
                  {t("sku:import.instructions", "Instructions:")}
                </p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>
                    {t(
                      "sku:import.step1",
                      "Download the template using 'Export Template' button",
                    )}
                  </li>
                  <li>{t("sku:import.step2", "Fill in your product data")}</li>
                  <li>
                    {t(
                      "sku:import.step3",
                      "Upload the completed Excel file here",
                    )}
                  </li>
                  <li>
                    {t(
                      "sku:import.step4",
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
                    ? t("sku:import.dropHere", "Drop the file here...")
                    : t(
                        "sku:import.dragDrop",
                        "Drag & drop an Excel file here",
                      )}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("sku:import.orClick", "or click to select a file")}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {t(
                    "sku:import.supportedFormats",
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
                    ? t("sku:import.importing", "Importing SKUs...")
                    : t("sku:import.processing", "Processing file...")}
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
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium">
                        {t("sku:import.validRows", "Valid")}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                      {validRows.length}
                    </p>
                  </div>

                  {warningRows.length > 0 && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-sm font-medium">
                          {t("sku:import.warnings", "Warnings")}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                        {warningRows.length}
                      </p>
                    </div>
                  )}

                  {errorRows.length > 0 && (
                    <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <span className="text-sm font-medium">
                          {t("sku:import.errors", "Errors")}
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
                      {t("sku:import.preview", "Preview (first 10 rows)")}
                    </p>
                  </div>
                  <ScrollArea className="h-[300px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">Row</TableHead>
                          <TableHead>SKU Name</TableHead>
                          <TableHead>Internal Code</TableHead>
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
                            <TableCell>{row.data["SKU Name"] || "-"}</TableCell>
                            <TableCell className="font-mono text-xs">
                              {row.data["Internal Code (optional)"] || "-"}
                            </TableCell>
                            <TableCell>
                              {row.data["Category Name"] || "-"}
                            </TableCell>
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
                              ) : row.warnings.length > 0 ? (
                                <div className="flex items-start gap-2 text-yellow-600 dark:text-yellow-400">
                                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                  <div className="text-xs space-y-1">
                                    {row.warnings.map((warn, i) => (
                                      <p key={i}>{warn}</p>
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
                      {t("sku:import.complete", "Import Complete")}
                    </p>
                    <p>
                      {t("sku:import.successCount", {
                        count: importResult.success,
                        defaultValue: `Successfully imported: ${importResult.success}`,
                      })}
                    </p>
                    {importResult.failed > 0 && (
                      <p className="text-red-600 dark:text-red-400">
                        {t("sku:import.failedCount", {
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
                        {t("sku:import.errorDetails", "Error Details")}
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
                ? t("sku:import.importing", "Importing...")
                : t("sku:import.importButton", {
                    count: validRows.length,
                    defaultValue: `Import ${validRows.length} SKU(s)`,
                  })}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
