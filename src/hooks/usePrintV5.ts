/* eslint-disable max-lines */
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { useUser } from "@/context/user-context";
import { EnumLedgerStatus, LedgerItemType } from "@/types/ledger";
import { RfidCategory, RfidStatus, RfidType } from "@/types/rfid";

// Extended LedgerItemType with packing collection metadata
interface LedgerItemWithPackingInfo extends LedgerItemType {
  _isPackingType?: boolean;
  _ledgerId?: string;
  _packingItems?: LedgerItemType[];
  _stockMovementType?: {
    name: string;
  };
}

import useAssignRfidItemMutation from "./api/ledger/useAssignRfidItemMutation";
import useUpdateLedgerItemMutation from "./api/ledger/useUpdateLedgerItemMutation";
import useCreateRfidDataMutation from "./api/rfid/useCreateRfidDataMutation";
import useGetStatusLedgerDataQuery from "./api/status/useGetLedgerStatusDataQuery";
import useGenerateEPC from "./useGenerateEpc";
import { useMixpanel } from "./useMixpanel";

// QZ Tray type definitions
/* eslint-disable @typescript-eslint/no-explicit-any */
interface QZTrayInterface {
  websocket: {
    connect: (options?: { retries?: number; delay?: number }) => Promise<void>;
    disconnect: () => Promise<void>;
    isActive: () => boolean;
  };
  printers: {
    find: (query?: string) => Promise<string[]>;
  };
  configs: {
    create: (printer: string) => QZConfig;
  };
  print: (config: QZConfig, data: string[]) => Promise<void>;
  security: {
    setCertificatePromise: (
      promise: (
        resolve: (cert: string) => void,
        reject: (error: any) => void
      ) => void
    ) => void;
    setSignatureAlgorithm: (algorithm: string) => void;
    setSignaturePromise: (
      promise: (
        toSign: string
      ) => (
        resolve: (signature: string) => void,
        reject: (error: any) => void
      ) => void
    ) => void;
  };
  version: () => Promise<string>;
}

interface QZConfig {
  printer: string;
}

declare global {
  interface Window {
    qz: QZTrayInterface;
  }
}

interface PrinterSettings {
  availablePrinters: string[];
  printCount: number;
  qzStatus: "disconnected" | "connecting" | "connected" | "error";
  rawZplCode: string;
  selectedPrinter: string;
  template: File | null;
  templateFields: TemplateField[];
  templateFieldsIds: string[];
  templatePreview: string;
  tlj: TLJTemplate | null;
  // Raw ZPL field mapping
  rawZplFields: TemplateField[];
  // Per-SKU field mappings
  skuTemplateFields: Record<string, TemplateField[]>;
  skuRawZplFields: Record<string, TemplateField[]>;
  // Preview settings
  previewSettings: {
    dpmm: string;
    width: string;
    height: string;
    index: string;
    unit: "mm" | "inch";
  };
  previewImage: string | null;
  isLoadingPreview: boolean;
}

interface TemplateField {
  id: string;
  name: string;
  mapping: keyof LedgerItemType | "";
}

interface PrintResult {
  success: boolean;
  epcs: string[];
  printedItemIds: string[];
}

interface RawZplPrintOptions {
  nameMap?: Record<string, string>;
  skipPrinting?: boolean; // Skip QZ Tray printing but still call APIs
}

interface TLJTemplate {
  width: number;
  height: number;
  unitType: string;
  items: TLJItem[];
  gapLength: number;
  markLength: number;
  offsetLength: number;
  labelsPerRow: number;
  labelsHorizontalGapLength: number;
  isContinuous: boolean;
  printSpeed: string;
  printMirror: boolean;
  cutAfterPrinting: boolean;
  batchCut: number;
  darkness: number;
  expressions: unknown[];
  sheetLabelsWidth: number;
  sheetLabelsHeight: number;
  sheetLabelsCount: number;
  sheetLabelsMargin: Margin;
  margin: Margin;
  useDefaultMediaType: boolean;
  designBackgroundImage: string;
  pages: unknown[];
  fonts: unknown[];
}

interface TLJItem {
  typeName: string;
  text?: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  dataField: string;
  visible: boolean;
  // Add other properties as needed
  [key: string]: unknown;
}

interface Margin {
  left: number;
  top: number;
  bottom: number;
  right: number;
}

const usePrintV5 = () => {
  const mixpanel = useMixpanel();
  const generateEPC = useGenerateEPC();
  const [settings, setSettings] = useState<PrinterSettings>({
    availablePrinters: [],
    isLoadingPreview: false,
    previewImage: null,
    previewSettings: {
      dpmm: "8dpmm",
      height: "6",
      index: "0",
      unit: "mm",
      width: "4",
    },
    printCount: 1,
    qzStatus: "disconnected",
    rawZplCode: "",
    rawZplFields: [],
    selectedPrinter: "",
    skuRawZplFields: {},
    skuTemplateFields: {},
    template: null,
    templateFields: [],
    templateFieldsIds: [],
    templatePreview: "",
    tlj: null,
  });
  const { tokenPayload, selectedTeam } = useUser();
  const [logs, setLogs] = useState<string[]>([]);
  const [isPrinting, setPrinting] = useState(false);
  const { mutateAsync: updateLedgerItemAsync } = useUpdateLedgerItemMutation();
  const { mutateAsync: assignRfidItemAsync } = useAssignRfidItemMutation();
  const { mutateAsync: createRfidDataAsync } = useCreateRfidDataMutation({
    organizationId: tokenPayload?.organization_id ?? "",
  });
  const { data: statuses } = useGetStatusLedgerDataQuery({
    organizationId: tokenPayload?.organization_id ?? "",
  });

  const addLog = useCallback(
    (text: string, item?: LedgerItemType) => {
      const timestamp = new Date().toISOString();
      setLogs((prev) => [...prev, `${timestamp}: ${text}`]);
      mixpanel.trackEvent("print_log", {
        account_id: tokenPayload?.account_id,
        item,
        text,
      });
    },
    [mixpanel, tokenPayload?.account_id]
  );

  const clearLogs = useCallback(() => setLogs([]), []);

  // Helper function to detect packing collection items and get appropriate RfidCategory
  const getRfidCategory = useCallback((item: LedgerItemType): RfidCategory => {
    // Check if item has packing type metadata from LedgerV2 selection
    const isPackingType =
      (item as LedgerItemWithPackingInfo)._isPackingType === true;
    return isPackingType ? RfidCategory.PACKAGE : RfidCategory.SINGLE;
  }, []);

  // Unit conversion helpers
  const mmToInches = useCallback((mm: number): number => mm / 25.4, []);
  const inchesToMm = useCallback((inches: number): number => inches * 25.4, []);

  // QZ Tray functions
  const loadPrinters = useCallback(async () => {
    if (window.qz && window.qz.websocket.isActive()) {
      try {
        const printers = await window.qz.printers.find();
        setSettings((prev) => ({
          ...prev,
          availablePrinters: printers,
          selectedPrinter: printers.length > 0 ? printers[0] : "",
        }));
        addLog(`Found ${printers.length} printers`);
      } catch (error) {
        addLog(`Failed to load printers: ${error}`);
        toast.error("Failed to load printers");
      }
    }
  }, [addLog]);

  const initializeQZ = useCallback(async () => {
    if (typeof window !== "undefined" && window.qz) {
      try {
        setSettings((prev) => ({ ...prev, qzStatus: "connecting" }));
        addLog("Connecting to QZ Tray...");

        await window.qz.websocket.connect();

        setSettings((prev) => ({ ...prev, qzStatus: "connected" }));
        addLog("Successfully connected to QZ Tray");

        // Load available printers
        await loadPrinters();

        return true;
      } catch (error) {
        setSettings((prev) => ({ ...prev, qzStatus: "error" }));
        addLog(`Failed to connect to QZ Tray: ${error}`);
        toast.error(
          "Failed to connect to QZ Tray. Make sure QZ Tray is running."
        );
        return false;
      }
    } else {
      addLog("QZ Tray library not found");
      toast.error("QZ Tray library not found");
      return false;
    }
  }, [addLog, loadPrinters]);

  const disconnectQZ = useCallback(async () => {
    if (window.qz && window.qz.websocket.isActive()) {
      try {
        await window.qz.websocket.disconnect();
        setSettings((prev) => ({
          ...prev,
          availablePrinters: [],
          qzStatus: "disconnected",
          selectedPrinter: "",
        }));
        addLog("Disconnected from QZ Tray");
      } catch (error) {
        addLog(`Error disconnecting from QZ Tray: ${error}`);
      }
    }
  }, [addLog]);

  const checkQZStatus = useCallback((): boolean => {
    if (window.qz && window.qz.websocket.isActive()) {
      return true;
    }
    toast.error("QZ Tray is not connected. Please connect first.");
    return false;
  }, []);

  const printWithQZ = useCallback(
    async (zplCommands: string): Promise<boolean> => {
      if (!checkQZStatus() || !settings.selectedPrinter) {
        return false;
      }

      try {
        const config = window.qz.configs.create(settings.selectedPrinter);
        const data = [zplCommands];

        await window.qz.print(config, data);
        addLog("ZPL commands sent to printer successfully");
        return true;
      } catch (error) {
        addLog(`QZ Tray print error: ${error}`);
        toast.error(`Print error: ${error}`);
        return false;
      }
    },
    [addLog, checkQZStatus, settings.selectedPrinter]
  );

  // Extract field placeholders from ZPL code
  const extractZplFields = useCallback((zplCode: string): string[] => {
    const fieldRegex = /\[([^\]]+)\]/g;
    const fields: string[] = [];
    let match;

    while ((match = fieldRegex.exec(zplCode)) !== null) {
      const fieldName = match[1];
      if (!fields.includes(fieldName)) {
        fields.push(fieldName);
      }
    }

    return fields;
  }, []);

  // Update raw ZPL fields when ZPL code changes
  const updateRawZplFields = useCallback(
    (zplCode: string) => {
      const extractedFields = extractZplFields(zplCode);
      const newFields: TemplateField[] = extractedFields.map((fieldName) => {
        // Try to find existing mapping for this field
        const existingField = settings.rawZplFields.find(
          (f) => f.id === fieldName
        );
        return {
          id: fieldName,
          mapping: existingField?.mapping || "",
          name: fieldName,
        };
      });

      setSettings((prev) => ({
        ...prev,
        rawZplFields: newFields,
      }));
    },
    [settings.rawZplFields, extractZplFields]
  );

  // Handle ZPL file upload - properly placed after dependencies
  const handleZplFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        try {
          // Read file content
          const text = await file.text();

          // Update ZPL code and extract fields
          setSettings((prev) => ({
            ...prev,
            rawZplCode: text,
          }));

          // Extract and update fields from the uploaded ZPL
          updateRawZplFields(text);

          addLog(`ZPL file uploaded: ${file.name}`);
          addLog(`ZPL code loaded from file`);
        } catch (error) {
          toast.error("Failed to read ZPL file");
          addLog(`ZPL file read error: ${error}`);
        }
      }
    },
    [addLog, updateRawZplFields]
  );

  // Helper to format date from ISO string to DD/MM/YYYY
  const formatDateTime = useCallback((dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Return original if not a valid date
      }

      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    } catch {
      return dateString; // Return original if formatting fails
    }
  }, []);

  // Helper to get nested property values from object
  const getNestedProperty = useCallback(
    (obj: LedgerItemType, path: string): string => {
      // Handle special case for current date
      if (path === "current_date") {
        const now = new Date();
        const day = now.getDate().toString().padStart(2, "0");
        const month = (now.getMonth() + 1).toString().padStart(2, "0");
        const year = now.getFullYear();
        return `${day}/${month}/${year}`;
      }

      // Handle attribute field paths (e.g., "sku.attributes.attr-id")
      if (path.startsWith("sku.attributes.")) {
        const attributeId = path.split(".")[2];
        if (obj.sku && obj.sku.attributes) {
          const attribute = obj.sku.attributes.find(
            (attr) =>
              (attr as { attribute_id: string }).attribute_id === attributeId
          );
          if (attribute && (attribute as { Values: string[] }).Values) {
            // Join multiple values with comma and space
            return (attribute as { Values: string[] }).Values.join(", ");
          }
        }
        return "";
      }

      // Handle packing_collection path safely
      if (path === "packing_collection.name") {
        const packingCollection = (obj as any).packing_collection;
        return packingCollection ? packingCollection.name : "";
      }

      // Support bracket notation for arrays (e.g., categories[0].name)
      const normalizedPath = path.replace(/\[(\w+)\]/g, ".$1");
      const keys = normalizedPath.split(".").filter(Boolean);
      let value: unknown = obj;

      for (const key of keys) {
        if (value === null || value === undefined) return "";

        if (Array.isArray(value)) {
          const index = Number(key);
          value = Number.isNaN(index)
            ? (value as unknown as Record<string, unknown>)[key]
            : (value as unknown[])[index];
        } else {
          value = (value as Record<string, unknown>)[key];
        }
      }

      const stringValue = String(value || "");

      // Check if this is a date field that needs formatting
      if ((path === "updated_at" || path === "created_at") && stringValue) {
        return formatDateTime(stringValue);
      }

      return stringValue;
    },
    [formatDateTime]
  );

  // Replace ZPL placeholders with real values using SKU-specific mappings
  const replaceZplPlaceholders = useCallback(
    (
      zplCode: string,
      item: LedgerItemType,
      epc: string,
      name?: string
    ): string => {
      let processedZpl = zplCode;
      const resolvedName = name ?? "";

      // Handle {epc} placeholder - replace with provided EPC
      if (processedZpl.includes("{epc}")) {
        processedZpl = processedZpl.replace(/{epc}/g, epc);
        addLog(`Replaced {epc} with EPC: ${epc}`, item);
      }

      if (processedZpl.includes("[epc]")) {
        processedZpl = processedZpl.replace(/\[epc\]/g, epc);
      }

      if (processedZpl.includes("{name}")) {
        processedZpl = processedZpl.replace(/{name}/g, resolvedName);
        addLog(`Replaced {name} with value: ${resolvedName}`, item);
      }

      if (processedZpl.includes("[name]")) {
        processedZpl = processedZpl.replace(/\[name\]/g, resolvedName);
      }

      // Use SKU-specific field mappings
      const skuFields = settings.skuRawZplFields[item.sku.id] || [];
      for (const field of skuFields) {
        if (field.mapping && field.id) {
          const placeholder = `[${field.id}]`;
          const value = getNestedProperty(item, field.mapping);

          processedZpl = processedZpl.replace(
            new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
            value
          );
        }
      }

      return processedZpl;
    },
    [settings.skuRawZplFields, getNestedProperty, addLog]
  );

  const handleRawZplPrint = useCallback(
    async (
      items: LedgerItemWithPackingInfo[],
      options: RawZplPrintOptions = {}
    ): Promise<PrintResult> => {
      const { nameMap, skipPrinting } = options;

      // Only validate printer if not skipping printing
      if (!skipPrinting) {
        if (!settings.selectedPrinter) {
          toast.error("Please select a printer");
          addLog("No printer selected");
          return { epcs: [], printedItemIds: [], success: false };
        }

        if (!settings.rawZplCode.trim()) {
          toast.error("Please enter ZPL code");
          addLog("No ZPL code provided");
          return { epcs: [], printedItemIds: [], success: false };
        }

        if (!checkQZStatus()) {
          addLog("QZ Tray is not ready");
          return { epcs: [], printedItemIds: [], success: false };
        }
      } else {
        addLog("Bypass mode: Skipping printer validation");
      }

      setPrinting(true);
      addLog("Starting raw ZPL print process...");

      try {
        const epcResults: string[] = [];
        const printedItemIds: string[] = [];
        const remainingItems = [...items];

        // Print multiple copies
        for (let copy = 1; copy <= settings.printCount; copy++) {
          addLog(`Processing copy ${copy}/${settings.printCount}`);

          let i = 0;
          while (i < remainingItems.length) {
            const item = remainingItems[i];

            try {
              // Generate EPC for this item
              const epc = await generateEPC(item);
              const resolvedName = nameMap?.[item.id] ?? epc;
              epcResults.push(epc);

              addLog(
                `Processing item: ${item.sku.name} (${item.id.substring(0, 8)}...)`,
                item
              );

              // Replace placeholders in ZPL code with actual item values (still needed for name generation)
              const processedZpl = skipPrinting ? "" : replaceZplPlaceholders(
                settings.rawZplCode,
                item,
                epc,
                resolvedName
              );
              
              if (!skipPrinting) {
                // ZPL ready for printing
              }
              
              // Print the processed ZPL code (skip if bypass mode)
              const printSuccess = skipPrinting ? true : await printWithQZ(processedZpl);

              if (printSuccess) {
                if (item._isPackingType === false) {
                  // Create RFID first
                  try {
                    await createRfidDataAsync({
                      rfids: [
                        {
                          category: getRfidCategory(item),
                          epc: epc,
                          name: resolvedName,
                          status: RfidStatus.ACTIVE,
                          type: RfidType.DISPOSABLE,
                        },
                      ],
                    });
                    addLog(`Successfully created RFID for EPC: ${epc}`, item);
                  } catch (rfidError) {
                    addLog(
                      `RFID creation failed for EPC: ${epc} - ${rfidError}`,
                      item
                    );
                    // Continue with ledger update even if RFID creation fails
                  }

                  // Update ledger item with EPC
                  await updateLedgerItemAsync({
                    itemId: item.id,
                    organizationId: tokenPayload?.organization_id ?? "",
                    params: {
                      epc: epc,
                      sku_id: item.sku.id,
                      status_id:
                        ((statuses?.data?.statuses || []).find(
                          (status) =>
                            status.name === EnumLedgerStatus.WAITING_INBOUND
                        )?.id as EnumLedgerStatus) ??
                        EnumLedgerStatus.WAITING_INBOUND,
                    },
                    storeId: selectedTeam,
                  });

                  // Assign RFID to the item
                  try {
                    await assignRfidItemAsync({
                      itemId: item.id,
                      organizationId: tokenPayload?.organization_id ?? "",
                      params: {
                        action: "ADD",
                        epc: epc,
                      },
                      storeId: selectedTeam,
                    });
                    addLog(
                      `Successfully assigned RFID to item: ${item.id} with EPC: ${epc}`,
                      item
                    );
                  } catch (rfidAssignError) {
                    addLog(
                      `RFID assignment failed for item: ${item.id} - ${rfidAssignError}`,
                      item
                    );
                    // Continue even if RFID assignment fails
                  }

                  addLog(`Successfully printed and updated item: ${item.id}`);
                  printedItemIds.push(item.id);
                  remainingItems.splice(i, 1);
                  // Don't increment i since we removed an item
                } else {
                  // Create RFID first
                  try {
                    await createRfidDataAsync({
                      rfids: [
                        {
                          category: RfidCategory.PACKAGE,
                          epc: epc,
                          name: resolvedName,
                          status: RfidStatus.ACTIVE,
                          type: RfidType.DISPOSABLE,
                        },
                      ],
                    });
                    addLog(`Successfully created RFID for EPC: ${epc}`, item);
                  } catch (rfidError) {
                    addLog(
                      `RFID creation failed for EPC: ${epc} - ${rfidError}`,
                      item
                    );
                    // Continue with ledger update even if RFID creation fails
                  }
                  item._packingItems?.map(async (packingItem) => {
                    // Update ledger item with EPC
                  await updateLedgerItemAsync({
                    itemId: packingItem.id,
                    organizationId: tokenPayload?.organization_id ?? "",
                    params: {
                      epc: epc,
                      sku_id: packingItem.sku.id,
                      status_id:
                        ((statuses?.data?.statuses || []).find(
                          (status) =>
                            status.name === EnumLedgerStatus.WAITING_INBOUND
                        )?.id as EnumLedgerStatus) ??
                        EnumLedgerStatus.WAITING_INBOUND,
                    },
                      storeId: selectedTeam,
                    });

                    // Assign RFID to the item
                    try {
                      await assignRfidItemAsync({
                        itemId: packingItem.id,
                        organizationId: tokenPayload?.organization_id ?? "",
                        params: {
                          action: "ADD",
                          epc: epc,
                        },
                        storeId: selectedTeam,
                      });
                      addLog(
                        `Successfully assigned RFID to item: ${packingItem.id} with EPC: ${epc}`,
                        packingItem
                      );
                    } catch (rfidAssignError) {
                      addLog(
                        `RFID assignment failed for item: ${packingItem.id} - ${rfidAssignError}`,
                        packingItem
                      );
                      // Continue even if RFID assignment fails
                    }

                    addLog(
                      `Successfully printed and updated item: ${packingItem.id}`
                    );
                  });
                  printedItemIds.push(item.id);
                  remainingItems.splice(i, 1);
                }
              } else {
                throw new Error("QZ Tray failed to print");
              }
            } catch (error: unknown) {
              const errorMessage =
                error instanceof Error
                  ? error.message
                  : typeof error === "object" && error && "response" in error
                    ? // @ts-expect-error - Handle API error response
                      error.response?.data?.metadata?.message
                    : "Unknown error";

              addLog(`Print error for item ${item.id}: ${errorMessage}`);
              toast.error(`Print error: ${errorMessage}`);

              // Move to the next item
              i++;
            }
          }
        }

        if (printedItemIds.length > 0) {
          toast.success(`Successfully printed ${printedItemIds.length} items`);
        }

        addLog(
          `Raw ZPL print process completed. Items printed: ${printedItemIds.length}`
        );
        return { epcs: epcResults, printedItemIds, success: true };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        addLog(`Raw ZPL print process error: ${errorMessage}`);
        toast.error(`Print process error: ${errorMessage}`);
        return { epcs: [], printedItemIds: [], success: false };
      } finally {
        setPrinting(false);
      }
    },
    [
      settings.selectedPrinter,
      settings.rawZplCode,
      settings.printCount,
      checkQZStatus,
      printWithQZ,
      addLog,
      generateEPC,
      createRfidDataAsync,
      updateLedgerItemAsync,
      tokenPayload?.organization_id,
      statuses?.data.statuses,
      selectedTeam,
      assignRfidItemAsync,
      getRfidCategory,
      replaceZplPlaceholders,
    ]
  );

  const handleRawZplPreview = useCallback(async (): Promise<boolean> => {
    if (!settings.rawZplCode.trim()) {
      toast.error("Please enter ZPL code to preview");
      addLog("No ZPL code provided for preview");
      return false;
    }

    const { dpmm, width, height, index, unit } = settings.previewSettings;

    if (!dpmm || !width || !height) {
      toast.error("Please fill in all preview settings");
      addLog("Preview settings incomplete");
      return false;
    }

    setSettings((prev) => ({
      ...prev,
      isLoadingPreview: true,
      previewImage: null,
    }));
    addLog("Generating ZPL preview...");

    try {
      // Prepare ZPL code for preview
      let previewZplCode = settings.rawZplCode;

      // Replace {epc} placeholders with sample EPC for preview
      if (previewZplCode.includes("{epc}")) {
        // Create a mock item for EPC generation
        const mockItem: LedgerItemType = {
          id: "sample-item-123456789",
          sku: {
            id: "sample-sku-123",
          },
        } as LedgerItemType;

        const sampleEpc = await generateEPC(mockItem);
        previewZplCode = previewZplCode.replace(/{epc}/g, sampleEpc);
        addLog(`Preview: Replaced {epc} with sample EPC: ${sampleEpc}`);
      }

      // Convert to inches if necessary (Labelary API expects inches)
      const widthInInches =
        unit === "mm" ? mmToInches(parseFloat(width)) : parseFloat(width);
      const heightInInches =
        unit === "mm" ? mmToInches(parseFloat(height)) : parseFloat(height);

      const apiUrl = `https://api.labelary.com/v1/printers/${dpmm}/labels/${widthInInches}x${heightInInches}/${index}/`;

      const response = await fetch(apiUrl, {
        body: previewZplCode,
        headers: {
          Accept: "image/png",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(
          `Labelary API error: ${response.status} ${response.statusText}`
        );
      }

      // Convert response to blob and create object URL
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);

      setSettings((prev) => ({
        ...prev,
        isLoadingPreview: false,
        previewImage: imageUrl,
      }));

      addLog("ZPL preview generated successfully");
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      addLog(`Preview generation failed: ${errorMessage}`);
      toast.error(`Preview error: ${errorMessage}`);

      setSettings((prev) => ({
        ...prev,
        isLoadingPreview: false,
        previewImage: null,
      }));
      return false;
    }
  }, [
    settings.rawZplCode,
    settings.previewSettings,
    addLog,
    mmToInches,
    generateEPC,
  ]);

  const handleFieldMapping = useCallback(
    (fieldId: string, value: string, isId = false) => {
      setSettings((prev) => ({
        ...prev,
        templateFields: prev.templateFields.map((field, index) => {
          if (index.toString() === fieldId) {
            return isId
              ? { ...field, id: value }
              : { ...field, mapping: value as keyof LedgerItemType | "" };
          }
          return field;
        }),
      }));
    },
    []
  );

  const addTemplateField = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      templateFields: [
        ...prev.templateFields,
        { id: "", mapping: "", name: `field${prev.templateFields.length + 1}` },
      ],
    }));
  }, []);

  const removeTemplateField = useCallback((index: number) => {
    setSettings((prev) => {
      // Don't remove if it's the last field
      if (prev.templateFields.length <= 1) {
        return prev;
      }

      const newFields = [...prev.templateFields];
      newFields.splice(index, 1);
      return {
        ...prev,
        templateFields: newFields,
      };
    });
  }, []);

  const setPrinterSelection = useCallback(
    (printer: string) => {
      setSettings((prev) => ({ ...prev, selectedPrinter: printer }));
      addLog(`Selected printer: ${printer}`);
    },
    [addLog]
  );

  const setPrintCount = useCallback((count: number) => {
    setSettings((prev) => ({ ...prev, printCount: count }));
  }, []);

  const setRawZplCode = useCallback((code: string) => {
    setSettings((prev) => ({ ...prev, rawZplCode: code }));
  }, []);

  const handleRawZplFieldMapping = useCallback(
    (fieldId: string, value: string) => {
      setSettings((prev) => ({
        ...prev,
        rawZplFields: prev.rawZplFields.map((field) => {
          if (field.id === fieldId) {
            return { ...field, mapping: value as keyof LedgerItemType | "" };
          }
          return field;
        }),
      }));
    },
    []
  );

  const setPreviewSettings = useCallback(
    (updates: Partial<PrinterSettings["previewSettings"]>) => {
      setSettings((prev) => ({
        ...prev,
        previewSettings: { ...prev.previewSettings, ...updates },
      }));
    },
    []
  );

  const handleUnitChange = useCallback(
    (newUnit: "mm" | "inch") => {
      setSettings((prev) => {
        const currentUnit = prev.previewSettings.unit;
        let newWidth = prev.previewSettings.width;
        let newHeight = prev.previewSettings.height;

        // Convert values if unit is changing
        if (currentUnit !== newUnit) {
          const widthNum = parseFloat(prev.previewSettings.width) || 0;
          const heightNum = parseFloat(prev.previewSettings.height) || 0;

          if (currentUnit === "inch" && newUnit === "mm") {
            // Convert from inches to mm
            newWidth = inchesToMm(widthNum).toFixed(1);
            newHeight = inchesToMm(heightNum).toFixed(1);
          } else if (currentUnit === "mm" && newUnit === "inch") {
            // Convert from mm to inches
            newWidth = mmToInches(widthNum).toFixed(1);
            newHeight = mmToInches(heightNum).toFixed(1);
          }
        }

        return {
          ...prev,
          previewSettings: {
            ...prev.previewSettings,
            height: newHeight,
            unit: newUnit,
            width: newWidth,
          },
        };
      });
    },
    [inchesToMm, mmToInches]
  );

  const clearPreviewImage = useCallback(() => {
    setSettings((prev) => {
      // Clean up the object URL if it exists
      if (prev.previewImage) {
        URL.revokeObjectURL(prev.previewImage);
      }
      return {
        ...prev,
        previewImage: null,
      };
    });
  }, []);

  // Initialize SKU field mappings when template changes
  const initializeSkuFieldMappings = useCallback((skuIds: string[]) => {
    setSettings((prev) => {
      const newSkuTemplateFields = { ...prev.skuTemplateFields };
      const newSkuRawZplFields = { ...prev.skuRawZplFields };

      skuIds.forEach((skuId) => {
        if (!newSkuTemplateFields[skuId]) {
          newSkuTemplateFields[skuId] = [...prev.templateFields];
        }
        if (!newSkuRawZplFields[skuId]) {
          newSkuRawZplFields[skuId] = [...prev.rawZplFields];
        }
      });

      return {
        ...prev,
        skuRawZplFields: newSkuRawZplFields,
        skuTemplateFields: newSkuTemplateFields,
      };
    });
  }, []);

  // Update SKU field mappings when rawZplFields change
  const updateSkuRawZplFields = useCallback((skuIds: string[]) => {
    setSettings((prev) => {
      const newSkuRawZplFields = { ...prev.skuRawZplFields };

      skuIds.forEach((skuId) => {
        // Always update with current rawZplFields
        newSkuRawZplFields[skuId] = [...prev.rawZplFields];
      });

      return {
        ...prev,
        skuRawZplFields: newSkuRawZplFields,
      };
    });
  }, []);

  // Handle SKU-specific raw ZPL field mapping
  const handleSkuRawZplFieldMapping = useCallback(
    (skuId: string, fieldId: string, value: string) => {
      setSettings((prev) => ({
        ...prev,
        skuRawZplFields: {
          ...prev.skuRawZplFields,
          [skuId]:
            prev.skuRawZplFields[skuId]?.map((field) => {
              if (field.id === fieldId) {
                return {
                  ...field,
                  mapping: value as keyof LedgerItemType | "",
                };
              }
              return field;
            }) || [],
        },
      }));
    },
    []
  );

  return {
    addLog,

    addTemplateField,
    clearLogs,
    clearPreviewImage,
    disconnectQZ,
    extractZplFields,
    handleFieldMapping,

    handleRawZplFieldMapping,
    handleRawZplPreview,
    handleRawZplPrint,
    handleSkuRawZplFieldMapping,

    handleUnitChange,
    handleZplFileUpload,
    initializeQZ,
    initializeSkuFieldMappings,
    isPrinting,
    loadPrinters,
    logs,

    removeTemplateField,
    setPreviewSettings,
    setPrintCount,
    setPrinterSelection,
    setRawZplCode,
    setSettings,
    settings,
    updateRawZplFields,
    updateSkuRawZplFields,
  };
};

export default usePrintV5;
