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
import useGetCategoryDataQuery from "@/hooks/api/category/useGetCategoryDataQuery";
import { useCreateSkuDataMutation } from "@/hooks/api/sku/useCreateSkuDataMutation";
import { KEY_USE_GET_SKU_DATA } from "@/hooks/api/sku/useGetSKUDataQuery";
import useGetStoreDataQuery from "@/hooks/api/store/useGetStoreDataQuery";
import { toastError } from "@/services";
import { AttributeTypeEnum } from "@/types/attribute";
import { CreateSkuParams, SkuStatus, SkuType } from "@/types/sku";

import { useKbmGradeConfig } from "../kbm-grade/KbmGradeConfigContext";

interface KbmItemImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoCloseOnSuccess?: boolean;
}

interface ParsedRow {
  rowNumber: number;
  data: Record<string, string>;
  errors: string[];
  warnings: string[];
  filledAttributes: number;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}

const findAttributeColumnName = (
  rowData: Record<string, string>,
  attributeName: string
): string | undefined => {
  const escapedName = attributeName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const columnPattern = new RegExp(`^${escapedName}\\*?( \\(.*\\))?$`);
  return Object.keys(rowData).find((key) => columnPattern.test(key));
};

const parseAttributeValue = (
  attrType: AttributeTypeEnum,
  rawValue: string
): string | number | string[] => {
  switch (attrType) {
    case AttributeTypeEnum.NUMBER:
      return parseFloat(rawValue) || 0;
    case AttributeTypeEnum.BOOLEAN:
      return rawValue.toLowerCase() === "true" ? "true" : "false";
    case AttributeTypeEnum.CHECKBOX:
      return rawValue
        .split(",")
        .map((value) => value.trim())
        .filter((value) => value);
    default:
      return rawValue;
  }
};

const normalizeAttributeType = (type: string): AttributeTypeEnum => {
  if ((Object.values(AttributeTypeEnum) as string[]).includes(type)) {
    return type as AttributeTypeEnum;
  }
  return AttributeTypeEnum.TEXT;
};

export const KbmItemImportModal: React.FC<KbmItemImportModalProps> = ({
  isOpen,
  onClose,
  autoCloseOnSuccess = false,
}) => {
  const { title, translationNamespace } = useKbmGradeConfig();
  const { t } = useTranslation([translationNamespace, "common"]);
  const { tokenPayload, selectedTeam } = useUser();
  const queryClient = useQueryClient();
  const organizationId = tokenPayload?.organization_id ?? "";

  const itemNameColumn = `${title} Name`;

  const defaultStoreId = selectedTeam !== "0" ? selectedTeam : "all";
  const [selectedStoreId, setSelectedStoreId] = useState<string>(defaultStoreId);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const { data: storeData } = useGetStoreDataQuery({ organizationId });
  const stores = storeData?.data?.stores ?? [];

  const { data: categoryData, isLoading: isCategoriesLoading } =
    useGetCategoryDataQuery({ organizationId });
  const { mutateAsync: createSkuData } = useCreateSkuDataMutation();

  // Find category by exact title
  const kbmCategory = useMemo(() => {
    if (!categoryData?.data?.categories) return undefined;
    return categoryData.data.categories.find(
      (category) => category.name === title
    );
  }, [categoryData, title]);

  const exportableAttributes = useMemo(() => {
    if (!kbmCategory?.attribute_items) return [];
    return kbmCategory.attribute_items.filter(
      (item) => item.attribute
    );
  }, [kbmCategory]);

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

      if (!kbmCategory) {
        toast.error(
          t(
            "import.categoryNotFound",
            `${title} category not found. Please create the category first.`
          )
        );
        return;
      }

      setFile(uploadedFile);
      setImportResult(null);

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
            t("import.emptyFile", "Excel file is empty or has no data")
          );
          setFile(null);
          return;
        }

        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1);

        const parsed: ParsedRow[] = rows
          .map((row, index) => {
            const rowData: Record<string, string> = {};
            headers.forEach((header, colIndex) => {
              rowData[header] = String(row[colIndex] || "").trim();
            });

            const hasData = Object.values(rowData).some((value) => value !== "");
            if (!hasData) return null;

            const errors: string[] = [];
            const warnings: string[] = [];
            let filledAttributes = 0;

            if (!rowData[itemNameColumn]) {
              errors.push(
                t("import.itemNameRequired", `${title} Name is required`)
              );
            }

            exportableAttributes.forEach((attrItem) => {
              const columnName = findAttributeColumnName(
                rowData,
                attrItem.attribute.name
              );
              const rawValue = columnName ? rowData[columnName] : "";

              if (rawValue) {
                filledAttributes += 1;
              }

              if (attrItem.is_required && !rawValue) {
                errors.push(
                  t("import.requiredAttributeMissing", {
                    attribute: attrItem.attribute.name,
                    defaultValue: `Required attribute '${attrItem.attribute.name}' is missing`,
                  })
                );
              }
            });

            return {
              data: rowData,
              errors,
              filledAttributes,
              rowNumber: index + 2,
              warnings,
            };
          })
          .filter((row): row is ParsedRow => row !== null);

        setParsedData(parsed);
      } catch (error) {
        console.error("Failed to parse Excel file:", error);
        toast.error(t("import.parseError", "Failed to parse Excel file"));
        setFile(null);
      } finally {
        setIsProcessing(false);
      }
    },
    [exportableAttributes, kbmCategory, itemNameColumn, t, title]
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
    if (!parsedData.length || !kbmCategory) return;

    const rowsWithErrors = parsedData.filter((row) => row.errors.length > 0);
    if (rowsWithErrors.length > 0) {
      toast.error(
        t(
          "import.hasErrors",
          "Cannot import: Some rows have validation errors. Please fix them first."
        )
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
        const rawName = row.data[itemNameColumn] || "";

        const attribute_items: {
          attribute_id: string;
          values: string | number | string[];
        }[] = [];

        exportableAttributes.forEach((attrItem) => {
          const columnName = findAttributeColumnName(
            row.data,
            attrItem.attribute.name
          );
          if (columnName && row.data[columnName]) {
            attribute_items.push({
              attribute_id: attrItem.attribute.id,
              values: parseAttributeValue(
                normalizeAttributeType(attrItem.attribute.type),
                row.data[columnName]
              ),
            });
          } else if (attrItem.is_required) {
            throw new Error(
              `Required attribute '${attrItem.attribute.name}' is missing`
            );
          }
        });

        const skuParams: CreateSkuParams = {
          attribute_items,
          category_ids: [kbmCategory.id],
          image_urls: [],
          name: rawName,
          organization_id: organizationId,
          sku: "",
          sku_type: SkuType.COMMON,
          status: SkuStatus.ACTIVE,
          store_id: selectedStoreId !== "all" ? selectedStoreId : undefined,
        };

        await createSkuData(skuParams);
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
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_SKU_DATA(organizationId),
      });

      toast.success(
        t("import.successMessage", {
          count: results.success,
          defaultValue: `Successfully imported ${results.success} item(s)`,
        })
      );

      if (autoCloseOnSuccess) {
        handleClose();
      }
    }

    if (results.failed > 0) {
      toastError(
        new Error(
          t("import.failedMessage", {
            count: results.failed,
            defaultValue: `Failed to import ${results.failed} item(s)`,
          })
        )
      );
    }
  };

  const validRows = parsedData.filter((row) => row.errors.length === 0);
  const errorRows = parsedData.filter((row) => row.errors.length > 0);
  const warningRows = parsedData.filter(
    (row) => row.warnings.length > 0 && row.errors.length === 0
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileUp className="h-5 w-5" />
            {t("import.title", `Import ${title} from Excel`)}
          </DialogTitle>
          <DialogDescription>
            {t(
              "import.description",
              `Upload an Excel file to bulk create ${title} items. Use the template for correct format.`
            )}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 py-4 pr-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm space-y-2">
                <p className="font-semibold">
                  {t("import.instructions", "Instructions:")}
                </p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>
                    {t(
                      "import.step1",
                      "Download the template using 'Export Template' button"
                    )}
                  </li>
                  <li>
                    {t("import.step2", `Fill in your ${title} data`)}
                  </li>
                  <li>
                    {t("import.step3", "Upload the completed Excel file here")}
                  </li>
                  <li>
                    {t(
                      "import.step4",
                      "Review the preview and click 'Import'"
                    )}
                  </li>
                </ol>
              </AlertDescription>
            </Alert>

            {/* Store selection */}
            <div className="space-y-2">
              <Label htmlFor="import-store">
                {t("import.store", "Store")}
              </Label>
              <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
                <SelectTrigger id="import-store">
                  <SelectValue placeholder={t("import.storeAll", "All Stores")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("import.storeAll", "All Stores")}
                  </SelectItem>
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
              <p className="text-xs text-muted-foreground">
                {t("import.storeHint", "Imported items will be assigned to the selected store")}
              </p>
            </div>

            {!kbmCategory && !isCategoriesLoading && (
              <Alert variant="destructive">
                <AlertDescription>
                  {t(
                    "import.categoryNotFound",
                    `${title} category not found. Please create the category first.`
                  )}
                </AlertDescription>
              </Alert>
            )}

            {!file && kbmCategory && (
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
                    ? t("import.dropHere", "Drop the file here...")
                    : t("import.dragDrop", "Drag & drop an Excel file here")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("import.orClick", "or click to select a file")}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {t(
                    "import.supportedFormats",
                    "Supported formats: CSV, XLSX"
                  )}
                </p>
              </div>
            )}

            {isProcessing && !importResult && (
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {importProgress > 0
                    ? t("import.importing", `Importing ${title} items...`)
                    : t("import.processing", "Processing file...")}
                </p>
                <Progress value={importProgress} />
              </div>
            )}

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

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium">
                        {t("import.validRows", "Valid")}
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
                          {t("import.warnings", "Warnings")}
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
                          {t("import.errors", "Errors")}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                        {errorRows.length}
                      </p>
                    </div>
                  )}
                </div>

                <div className="border rounded-lg">
                  <div className="p-3 bg-muted border-b">
                    <p className="text-sm font-medium">
                      {t("import.preview", "Preview (first 10 rows)")}
                    </p>
                  </div>
                  <ScrollArea className="h-[300px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">Row</TableHead>
                          <TableHead>{itemNameColumn}</TableHead>
                          <TableHead>
                            {t("import.attributesFilled", "Attributes")}
                          </TableHead>
                          <TableHead>Validation</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parsedData.slice(0, 10).map((row) => (
                          <TableRow key={row.rowNumber}>
                            <TableCell className="font-medium">
                              {row.rowNumber}
                            </TableCell>
                            <TableCell>
                              {row.data[itemNameColumn] || "-"}
                            </TableCell>
                            <TableCell>{row.filledAttributes}</TableCell>
                            <TableCell>
                              {row.errors.length > 0 ? (
                                <div className="flex items-start gap-2 text-red-600 dark:text-red-400">
                                  <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                  <div className="text-xs space-y-1">
                                    {row.errors.map((err, index) => (
                                      <p key={index}>{err}</p>
                                    ))}
                                  </div>
                                </div>
                              ) : row.warnings.length > 0 ? (
                                <div className="flex items-start gap-2 text-yellow-600 dark:text-yellow-400">
                                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                  <div className="text-xs space-y-1">
                                    {row.warnings.map((warn, index) => (
                                      <p key={index}>{warn}</p>
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

            {importResult && (
              <div className="space-y-4">
                <Alert
                  variant={importResult.failed === 0 ? "default" : "destructive"}
                >
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-semibold mb-2">
                      {t("import.complete", "Import Complete")}
                    </p>
                    <p>
                      {t("import.successCount", {
                        count: importResult.success,
                        defaultValue: `Successfully imported: ${importResult.success}`,
                      })}
                    </p>
                    {importResult.failed > 0 && (
                      <p className="text-red-600 dark:text-red-400">
                        {t("import.failedCount", {
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
                        {t("import.errorDetails", "Error Details")}
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
                ? t("import.importing", "Importing...")
                : t("import.importButton", {
                    count: validRows.length,
                    defaultValue: `Import ${validRows.length} item(s)`,
                  })}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
