/* eslint-disable max-lines */
import Image from "next/image";
import { useTranslation } from "next-i18next";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBypassHardware } from "@/hooks/useBypassHardware";
import usePrintV5 from "@/hooks/usePrintV5";
import { useQZSigning } from "@/hooks/useQZSigning";
import { LedgerItemType } from "@/types/ledger";
import {
  generateRfidNames,
  getPatternPreview,
  validatePatternCapacity,
} from "@/utils/rfidNameGenerator";
import { convertToTitleCase } from "@/utils/text";

// Extended LedgerItemType with packing collection metadata
interface LedgerItemWithPackingInfo extends LedgerItemType {
  _isPackingType?: boolean;
  _ledgerId?: string;
  _packingItems?: LedgerItemType[];
  _stockMovementType?: {
    name: string;
  };
}

interface PrintModalV5Props {
  items: LedgerItemType[];
  onClose: () => void;
}

type NamingMode = "system" | "custom";

const PrintModalV5 = ({ items, onClose }: PrintModalV5Props) => {
  const { t } = useTranslation("ledger");
  const [open, setOpen] = useState(true);

  const zplFileInputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const [selectedItems, setSelectedItems] = useState<LedgerItemType[]>(items);
  const [namingMode, setNamingMode] = useState<NamingMode>("system");
  const [customPattern, setCustomPattern] = useState("");

  // Bypass hardware mode
  const { isBypassEnabled } = useBypassHardware();

  // Helper function to detect packing collection items
  const isPackingItem = useCallback((item: LedgerItemType) => {
    return (item as LedgerItemWithPackingInfo)._isPackingType === true;
  }, []);

  // Calculate display counts for packing collections (show 1 instead of actual count)
  const getDisplayCount = useCallback(
    (items: LedgerItemType[]) => {
      const packingCollections = new Set<string>();
      let singleItemCount = 0;

      items.forEach((item) => {
        if (isPackingItem(item)) {
          // For packing items, group by stock movement type or some unique identifier
          // Use created_at as a way to group items from the same packing collection
          const packingGroupId = item.created_at || item.id;
          packingCollections.add(packingGroupId);
        } else {
          singleItemCount++;
        }
      });

      return singleItemCount + packingCollections.size;
    },
    [isPackingItem],
  );

  // Calculate display count for specific SKU
  const getSkuDisplayCount = useCallback(
    (items: LedgerItemType[], skuId: string) => {
      const skuItems = items.filter((item) => item.sku.id === skuId);
      const packingCollections = new Set<string>();
      let singleItemCount = 0;

      skuItems.forEach((item) => {
        if (isPackingItem(item)) {
          // Group packing items by created_at or some unique identifier
          const packingGroupId = item.created_at || item.id;
          packingCollections.add(packingGroupId);
        } else {
          singleItemCount++;
        }
      });

      return singleItemCount + packingCollections.size;
    },
    [isPackingItem],
  );

  // Initialize QZ Signing hook
  const signing = useQZSigning();
  const { initializeSigning } = signing;

  // Memoize items to prevent unnecessary re-renders
  const memoizedItems = useMemo(() => items, [items]);

  const {
    settings,
    logs,
    isPrinting,
    clearLogs,

    handleRawZplPrint,
    handleRawZplPreview,
    initializeQZ,
    disconnectQZ,
    loadPrinters,
    setPrinterSelection,
    setPrintCount,
    setRawZplCode,
    setPreviewSettings,
    clearPreviewImage,
    handleUnitChange,
    updateRawZplFields,
    handleZplFileUpload,
    // Per-SKU field mapping functions
    initializeSkuFieldMappings,

    handleSkuRawZplFieldMapping,

    updateSkuRawZplFields,
  } = usePrintV5();
  useEffect(() => {
    if (open) {
      setSelectedItems(memoizedItems);
      // Initialize signing when modal opens
      initializeSigning();
    }
  }, [open, memoizedItems, initializeSigning]);

  // Cleanup preview image on unmount or close
  useEffect(() => {
    return () => {
      clearPreviewImage();
    };
  }, [clearPreviewImage]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      clearPreviewImage();
      onClose();
    }
  };

  // Handle raw ZPL print
  const handleRawZplPrintAction = async () => {
    let nameMap: Record<string, string> | undefined;

    if (namingMode === "custom") {
      if (!patternValidation.isValid) {
        toast.error(patternValidation.message);
        return;
      }

      const generatedNames = generateRfidNames(
        customPattern,
        itemsToPrintCount,
      );

      if (!generatedNames || generatedNames.length !== itemsToPrintCount) {
        toast.error(t("modal.print.customPattern.generationFailed"));
        return;
      }

      nameMap = selectedItems.reduce<Record<string, string>>(
        (acc, item, index) => {
          acc[item.id] = generatedNames[index];
          return acc;
        },
        {},
      );
    }

    const result = await handleRawZplPrint(selectedItems, {
      nameMap: nameMap ? nameMap : undefined,
      skipPrinting: isBypassEnabled, // Skip QZ printing but still call APIs
    });

    if (isBypassEnabled && result.success) {
      toast.success(
        t(
          "modal.print.bypassSuccess",
          "Bypass mode: Print skipped, items processed via API",
        ),
      );
    }

    if (result.success && result.printedItemIds.length > 0) {
      // Remove successfully printed items from the list
      setSelectedItems((prevItems) =>
        prevItems.filter((item) => !result.printedItemIds.includes(item.id)),
      );
    }
  };

  // Get unique SKUs from selected items
  const uniqueSkus = useMemo(() => {
    const skuMap = new Map<
      string,
      { attributes: unknown[]; id: string; name: string }
    >();

    selectedItems.forEach((item) => {
      if (item.sku && !skuMap.has(item.sku.id)) {
        skuMap.set(item.sku.id, {
          attributes: item.sku.attributes || [],
          id: item.sku.id,
          name: item.sku.name,
        });
      }
    });

    return Array.from(skuMap.values());
  }, [selectedItems]);

  // Initialize SKU field mappings when SKUs change
  useEffect(() => {
    if (uniqueSkus.length > 0) {
      initializeSkuFieldMappings(uniqueSkus.map((sku) => sku.id));
    }
  }, [uniqueSkus, initializeSkuFieldMappings]);

  // Update SKU field mappings when rawZplFields change
  useEffect(() => {
    if (uniqueSkus.length > 0 && settings.rawZplFields.length > 0) {
      updateSkuRawZplFields(uniqueSkus.map((sku) => sku.id));
    }
  }, [uniqueSkus, settings.rawZplFields, updateSkuRawZplFields]);

  // Generate property options for a specific SKU
  const getPropertyOptionsForSku = useCallback(
    (skuId: string) => {
      // Base property options
      const baseOptions = [
        { label: t("modal.print.fields.id"), value: "id" },
        { label: t("modal.print.fields.epc"), value: "epc" },
        { label: t("modal.print.fields.statusName"), value: "status.name" },
        { label: t("modal.print.fields.skuId"), value: "sku.id" },
        { label: t("modal.print.fields.skuName"), value: "sku.name" },
        {
          label: t("modal.print.fields.internalCode"),
          value: "sku.sku",
        },
        {
          label: t("modal.print.fields.category"),
          value: "sku.categories[0].name",
        },
        {
          label: t("modal.print.fields.packing_name"),
          value: "packing_collection.name",
        },
        { label: t("modal.print.fields.updatedAt"), value: "updated_at" },
        { label: t("modal.print.fields.createdAt"), value: "created_at" },
        { label: t("modal.print.fields.currentDate"), value: "current_date" },
      ];

      // Find SKU and add its attributes
      const sku = uniqueSkus.find((s) => s.id === skuId);
      if (sku && sku.attributes) {
        const attributeOptions = sku.attributes.map((attribute) => {
          const attr = attribute as {
            Name: string;
            attribute_id: string;
          };
          return {
            label: `Attribute: ${attr.Name}`,
            value: `sku.attributes.${attr.attribute_id}`,
          };
        });
        return [...baseOptions, ...attributeOptions];
      }

      return baseOptions;
    },
    [uniqueSkus, t],
  );

  // Get connection status color and text
  const getConnectionStatus = () => {
    // Check for signing errors first
    if (signing.signingError) {
      return {
        color: "text-red-600",
        text: `Signing Error: ${signing.signingError}`,
      };
    }

    switch (settings.qzStatus) {
      case "connected":
        const signingStatus = signing.isSigningInitialized
          ? signing.certificateLoaded
            ? " (Silent Print Ready)"
            : " (Signing Active)"
          : "";
        return { color: "text-green-600", text: `Connected${signingStatus}` };
      case "connecting":
        return { color: "text-yellow-600", text: "Connecting..." };
      case "error":
        return { color: "text-red-600", text: "Connection Error" };
      default:
        const initStatus = signing.isSigningInitialized
          ? " (Signing Ready)"
          : "";
        return { color: "text-muted-foreground", text: `Disconnected${initStatus}` };
    }
  };

  const connectionStatus = getConnectionStatus();
  const itemsToPrintCount = selectedItems.length;

  const patternValidation = useMemo(() => {
    if (namingMode !== "custom" || !customPattern || itemsToPrintCount === 0) {
      return { isValid: true, message: "" };
    }

    const isValidPattern = /^[A-Za-z]*\d+[A-Za-z]*$/.test(customPattern);

    if (!isValidPattern) {
      return {
        isValid: false,
        message: t("modal.print.customPattern.invalidFormat"),
      };
    }

    const hasCapacity = validatePatternCapacity(
      customPattern,
      itemsToPrintCount,
    );

    if (!hasCapacity) {
      return {
        isValid: false,
        message: t("modal.print.customPattern.insufficientCapacity"),
      };
    }

    return { isValid: true, message: "" };
  }, [customPattern, itemsToPrintCount, namingMode, t]);

  const patternPreview = useMemo(() => {
    if (
      namingMode !== "custom" ||
      !customPattern ||
      !patternValidation.isValid ||
      itemsToPrintCount === 0
    ) {
      return null;
    }

    return getPatternPreview(customPattern, itemsToPrintCount);
  }, [customPattern, itemsToPrintCount, namingMode, patternValidation.isValid]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[900px] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>{t("modal.print.title")}</DialogTitle>
          <DialogDescription>{t("modal.print.description")}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto pr-1">
          <div className="space-y-4">
            {/* Bypass Mode Indicator */}
            {isBypassEnabled && (
              <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-600 dark:text-yellow-400">
                    ⚠️
                  </span>
                  <div>
                    <p className="font-medium text-sm text-yellow-800 dark:text-yellow-200">
                      {t(
                        "modal.print.bypassMode.title",
                        "Bypass Hardware Mode Enabled",
                      )}
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      {t(
                        "modal.print.bypassMode.description",
                        "Printing will be skipped. Items will be processed without printing.",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* QZ Tray Connection Section */}
            <div className="border rounded-md p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">QZ Tray Connection</h3>
                  <span className={`text-sm ${connectionStatus.color}`}>
                    {connectionStatus.text}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    disabled={
                      settings.qzStatus === "connecting" ||
                      settings.qzStatus === "connected"
                    }
                    size="sm"
                    variant="outline"
                    onClick={initializeQZ}
                  >
                    Connect
                  </Button>
                  <Button
                    disabled={
                      settings.qzStatus === "disconnected" ||
                      settings.qzStatus === "connecting"
                    }
                    size="sm"
                    variant="outline"
                    onClick={disconnectQZ}
                  >
                    Disconnect
                  </Button>
                  <Button
                    disabled={settings.qzStatus !== "connected"}
                    size="sm"
                    variant="outline"
                    onClick={loadPrinters}
                  >
                    Refresh Printers
                  </Button>
                  <Button
                    disabled={signing.isSigningInitialized}
                    size="sm"
                    variant="outline"
                    onClick={() => signing.initializeSigning()}
                  >
                    Init Signing
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => signing.testConnection()}
                  >
                    Test
                  </Button>
                </div>
              </div>

              {/* Signing Status */}
              {(signing.isSigningInitialized || signing.signingError) && (
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Message Signing:</span>
                    <span
                      className={
                        signing.isSigningInitialized
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {signing.isSigningInitialized ? "Active" : "Failed"}
                    </span>
                  </div>
                  {signing.certificateLoaded && (
                    <div className="text-green-600 text-xs">
                      ✓ Certificate loaded - Silent printing enabled
                    </div>
                  )}
                  {signing.signingError && (
                    <div className="text-red-600 text-xs bg-red-50 p-2 rounded">
                      {signing.signingError}
                    </div>
                  )}
                </div>
              )}

              {/* Printer Selection */}
              {settings.qzStatus === "connected" && (
                <div className="space-y-2">
                  <Label isRequired>Select Printer</Label>
                  <Select
                    value={settings.selectedPrinter}
                    onValueChange={setPrinterSelection}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a printer" />
                    </SelectTrigger>
                    <SelectContent>
                      {settings.availablePrinters.map((printer) => (
                        <SelectItem key={printer} value={printer}>
                          {printer}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Print Count */}
              {settings.selectedPrinter && (
                <div className="space-y-2">
                  <Label>Print Copies</Label>
                  <Input
                    className="w-24"
                    max="10"
                    min="1"
                    type="number"
                    value={settings.printCount}
                    onChange={(e) =>
                      setPrintCount(parseInt(e.target.value) || 1)
                    }
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label isRequired>{t("modal.print.namingMode.label")}</Label>
                <Select
                  value={namingMode}
                  onValueChange={(value: NamingMode) => setNamingMode(value)}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("modal.print.namingMode.label")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">
                      {t("modal.print.namingMode.system")}
                    </SelectItem>
                    <SelectItem value="custom">
                      {t("modal.print.namingMode.custom")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {t("modal.print.namingMode.description")}
                </p>
              </div>

              {namingMode === "custom" && (
                <div className="space-y-2">
                  <Label isRequired>
                    {t("modal.print.customPattern.label")}
                  </Label>
                  <Input
                    placeholder={t("modal.print.customPattern.placeholder")}
                    value={customPattern}
                    onChange={(e) => setCustomPattern(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    {t("modal.print.customPattern.hint")}
                  </p>

                  {customPattern && !patternValidation.isValid && (
                    <p className="text-sm text-red-600">
                      {patternValidation.message}
                    </p>
                  )}

                  {patternPreview && (
                    <div className="bg-muted p-3 rounded-md text-sm">
                      <p className="font-medium mb-1">
                        {t("modal.print.customPattern.preview")}:
                      </p>
                      <p>
                        {patternPreview.first} → {patternPreview.last}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {namingMode === "system" && (
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md text-sm text-blue-800 dark:text-blue-200">
                  ℹ️ {t("modal.print.namingMode.systemHint")}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="border rounded-md p-4">
              {/* Raw ZPL Tab Content */}

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="space-y-4 w-1/2">
                    {/* Preview Settings */}
                    <div className="border rounded-md p-4 space-y-4">
                      <h4 className="font-medium">Preview Settings</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Print Density</Label>
                          <Select
                            value={settings.previewSettings.dpmm}
                            onValueChange={(value) =>
                              setPreviewSettings({ dpmm: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="6dpmm">6 dpmm</SelectItem>
                              <SelectItem value="8dpmm">8 dpmm</SelectItem>
                              <SelectItem value="12dpmm">12 dpmm</SelectItem>
                              <SelectItem value="24dpmm">24 dpmm</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Unit</Label>
                          <Select
                            value={settings.previewSettings.unit}
                            onValueChange={(value: "mm" | "inch") =>
                              handleUnitChange(value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mm">mm</SelectItem>
                              <SelectItem value="inch">inch</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Width ({settings.previewSettings.unit})</Label>
                          <Input
                            min="0.1"
                            step="0.1"
                            type="number"
                            value={settings.previewSettings.width}
                            onChange={(e) =>
                              setPreviewSettings({ width: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>
                            Height ({settings.previewSettings.unit})
                          </Label>
                          <Input
                            min="0.1"
                            step="0.1"
                            type="number"
                            value={settings.previewSettings.height}
                            onChange={(e) =>
                              setPreviewSettings({ height: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Index</Label>
                          <Input
                            min="0"
                            type="number"
                            value={settings.previewSettings.index}
                            onChange={(e) =>
                              setPreviewSettings({ index: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          disabled={
                            settings.isLoadingPreview ||
                            !settings.rawZplCode.trim()
                          }
                          variant="outline"
                          onClick={handleRawZplPreview}
                        >
                          {settings.isLoadingPreview
                            ? "Generating..."
                            : "Generate Preview"}
                        </Button>
                        {settings.previewImage && (
                          <Button variant="outline" onClick={clearPreviewImage}>
                            Clear Preview
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 w-1/2">
                    <Label>
                      {t("modal.print.itemsToPrint")} (
                      {getDisplayCount(selectedItems)})
                    </Label>
                    <div className="border border-gray-200 rounded-md p-3 max-h-[300px] overflow-y-auto">
                      {selectedItems.map((item, itemIndex) => {
                        const isPacking = isPackingItem(item);
                        const packingItemWithInfo =
                          item as LedgerItemWithPackingInfo;
                        const itemNumber = itemIndex + 1;

                        if (isPacking && packingItemWithInfo._packingItems) {
                          // Display packing collection as a box
                          const packingId =
                            packingItemWithInfo._ledgerId?.substring(0, 4) ||
                            "Pack";
                          return (
                            <Accordion
                              key={item.id}
                              collapsible
                              className="mb-3"
                              type="single"
                            >
                              <AccordionItem
                                className="border border-purple-200 rounded-md bg-purple-50"
                                value={`packing-${item.id}`}
                              >
                                <AccordionTrigger className="px-3 py-2 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                                  <div className="flex items-center justify-between w-full pr-2">
                                    <div className="flex items-center gap-2">
                                      <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-600 text-white text-xs font-bold rounded-full">
                                        {itemNumber}
                                      </span>
                                      <span className="font-semibold text-sm text-purple-800">
                                        📦 Packing Collection: {packingId}
                                      </span>
                                    </div>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                      {packingItemWithInfo._packingItems.length}{" "}
                                      items
                                    </span>
                                  </div>
                                </AccordionTrigger>

                                <AccordionContent className="px-3 pb-3">
                                  {/* Items inside the packing collection */}
                                  <div className="space-y-2 pt-2 border-t border-purple-200">
                                    {packingItemWithInfo._packingItems.map(
                                      (packingItem, subIndex) => (
                                        <div
                                          key={`${item.id}-${subIndex}`}
                                          className="bg-card border border-purple-100 rounded p-2 text-sm"
                                        >
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium">
                                              {packingItem.sku?.name}
                                            </span>
                                          </div>
                                          <div className="text-muted-foreground text-xs flex justify-between">
                                            <span>
                                              {t("modal.print.fields.id")}:{" "}
                                              {packingItem.id.substring(0, 8)}
                                              ...
                                            </span>
                                            <span>
                                              {convertToTitleCase(
                                                packingItem.status?.name,
                                              )}
                                            </span>
                                          </div>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          );
                        } else {
                          // Display single item as before
                          return (
                            <div
                              key={item.id}
                              className="mb-2 p-2 border-b text-sm"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="inline-flex items-center justify-center w-6 h-6 ml-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                                  {itemNumber}
                                </span>
                                <span className="font-semibold">
                                  {item.sku?.name}
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  📄 Single
                                </span>
                              </div>
                              <div className="text-muted-foreground text-xs flex justify-between ml-9">
                                <span>
                                  {t("modal.print.fields.id")}:{" "}
                                  {item.id.substring(0, 8)}...
                                </span>
                                <span>
                                  {convertToTitleCase(item.status?.name)}
                                </span>
                              </div>
                            </div>
                          );
                        }
                      })}
                      {selectedItems.length === 0 && (
                        <div className="text-muted-foreground text-center py-4">
                          {t("modal.print.allPrinted")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Preview Image */}
                {(settings.previewImage || settings.isLoadingPreview) && (
                  <div className="border rounded-md p-4">
                    <h4 className="font-medium mb-2">Label Preview</h4>
                    <div className="border rounded-md p-4 bg-muted flex justify-center items-center min-h-[200px]">
                      {settings.isLoadingPreview ? (
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                          <p className="text-sm text-muted-foreground">
                            Generating preview...
                          </p>
                        </div>
                      ) : settings.previewImage ? (
                        <Image
                          alt="ZPL Label Preview"
                          className="max-h-[400px] w-auto border rounded shadow-sm"
                          height={400}
                          src={settings.previewImage}
                          width={400}
                        />
                      ) : null}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label isRequired>ZPL Code</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      ref={zplFileInputRef}
                      accept=".zpl"
                      className="hidden"
                      type="file"
                      onChange={handleZplFileUpload}
                    />
                    <Button
                      variant="outline"
                      onClick={() => zplFileInputRef.current?.click()}
                    >
                      Upload ZPL File
                    </Button>
                    <span className="text-sm text-muted-foreground self-center">
                      or enter ZPL code manually below
                    </span>
                  </div>
                  <Textarea
                    className="min-h-[300px] font-mono text-sm"
                    placeholder="Enter your ZPL code here...
Example:
^XA
^FO50,50
^ADN,36,20
^FDRAW ZPL EXAMPLE^FS
^XZ"
                    value={settings.rawZplCode}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                      setRawZplCode(e.target.value);
                      updateRawZplFields(e.target.value);
                    }}
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter raw ZPL commands. Use [field_name] for dynamic fields
                    (e.g., [sku_name], [size], [color]).
                  </p>
                </div>

                {/* Field Mapping Section */}
                {uniqueSkus.length > 0 && (
                  <div className="space-y-4">
                    <Label>Field Mapping</Label>
                    {settings.rawZplFields.length === 0 && (
                      <div className="text-sm text-muted-foreground italic">
                        Enter ZPL code with field placeholders [field_name]
                        above to configure field mappings
                      </div>
                    )}
                    {settings.rawZplFields.length > 0 &&
                      uniqueSkus.map((sku) => (
                        <div
                          key={sku.id}
                          className="border rounded-md p-4 space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">
                              Field Mapping for SKU: {sku.name}
                            </h4>
                            <div className="text-xs text-muted-foreground">
                              {getSkuDisplayCount(selectedItems, sku.id)} items
                            </div>
                          </div>

                          <div className="space-y-4">
                            {(settings.skuRawZplFields[sku.id] || []).map(
                              (field) => (
                                <div
                                  key={field.id}
                                  className="grid grid-cols-2 gap-4 items-end"
                                >
                                  <div>
                                    <Label>Field: [{field.id}]</Label>
                                    <Input
                                      readOnly
                                      className="mt-1 bg-muted"
                                      value={field.id}
                                    />
                                  </div>
                                  <div>
                                    <Label>Map to Property</Label>
                                    <Select
                                      value={field.mapping}
                                      onValueChange={(value) =>
                                        handleSkuRawZplFieldMapping(
                                          sku.id,
                                          field.id,
                                          value,
                                        )
                                      }
                                    >
                                      <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select property" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {getPropertyOptionsForSku(sku.id).map(
                                          (option) => (
                                            <SelectItem
                                              key={option.value}
                                              value={option.value}
                                            >
                                              {option.label}
                                            </SelectItem>
                                          ),
                                        )}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">
                {t("modal.print.terminal.title")}
              </h3>
              <Button size="sm" variant="outline" onClick={clearLogs}>
                {t("modal.print.terminal.clear")}
              </Button>
            </div>
            <div
              ref={terminalRef}
              className="h-[150px] overflow-auto p-2 bg-black text-green-400 font-mono text-sm rounded-md"
            >
              {logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4 pt-2 border-t">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            {t("modal.print.cancelButton")}
          </Button>
          <Button
            disabled={
              isPrinting ||
              selectedItems.length === 0 ||
              (namingMode === "custom" && !patternValidation.isValid) ||
              // In bypass mode, no printer checks needed
              (!isBypassEnabled &&
                (settings.qzStatus !== "connected" ||
                  !settings.selectedPrinter ||
                  !settings.rawZplCode.trim() ||
                  (settings.rawZplFields.length > 0 &&
                    uniqueSkus.some((sku) =>
                      (settings.skuRawZplFields[sku.id] || []).some(
                        (field) => !field.mapping,
                      ),
                    ))))
            }
            onClick={handleRawZplPrintAction}
          >
            {isPrinting
              ? t("modal.print.printingStatus")
              : isBypassEnabled
                ? t("modal.print.processItems", "Process Items")
                : t("modal.print.print")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrintModalV5;
