/* eslint-disable max-lines */
"use client";

import { useQueryClient } from "@tanstack/react-query";
import { CirclePause, Loader2, Scan } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useUser } from "@/context/user-context";
import useGetDesktopReaderStatusQuery from "@/hooks/api/desktop-reader/useGetDesktopReaderStatusQuery";
import useScanRfidsManual from "@/hooks/api/desktop-reader/useScanRfidsManual";
import useCreateLedgerItemMutation from "@/hooks/api/ledger/useCreateLedgerItemMutation";
import { USE_GET_PRODUCT_DATA_QUERY_KEY } from "@/hooks/api/product/useGetProductDataQuery";
import useGetRfidDataQuery, { KEY_USE_GET_RFID_DATA } from "@/hooks/api/rfid/useGetRfidDataQuery";
import useGetStatusLedgerDataQuery from "@/hooks/api/status/useGetLedgerStatusDataQuery";
import useGetStockMovementTypesQuery from "@/hooks/api/stock-movement-types/useGetStockMovementTypesQuery";
import useCreateStoreAreaDataMutation from "@/hooks/api/store/useCreateStoreAreaDataMutation";
import useGetStoreAreaDataQuery from "@/hooks/api/store/useGetStoreAreaDataQuery";
import useGetStoreDataQuery from "@/hooks/api/store/useGetStoreDataQuery";
import { useBypassHardware } from "@/hooks/useBypassHardware";
import { assignRfidItemService } from "@/services/ledger/assignRfidItemService";
import { updateLedgerItemService } from "@/services/ledger/updateLedgerItemService";
import { createStockMovementService } from "@/services/stockMovement/createStockMovementService";
import { EnumLedgerStatus, ItemType } from "@/types/ledger";
import { RfidCategory, RfidStatus, RfidType } from "@/types/rfid";
import { SkuItemType } from "@/types/sku";
import { isNagatechSyncOrganization } from "@/utils/nagatechSync";

import { useLedgerProductStore } from "./store";

// Attribute name to look for section
const KODE_BAKI_ATTRIBUTE_NAME = "Kode Baki";

interface LedgerProductScanActionProps {
  skuData: SkuItemType;
}

const LedgerProductScanAction: React.FC<LedgerProductScanActionProps> = ({
  skuData,
}) => {
  const skuId = skuData.id;
  const skuName = skuData.name;
  const { t } = useTranslation(["ledger-product"]);
  const queryClient = useQueryClient();
  const { tokenPayload, selectedTeam } = useUser();
  const { isBypassEnabled } = useBypassHardware();
  const organizationId = tokenPayload?.organization_id ?? "";

  // Get current filters and pagination from ledger product store for query invalidation
  const { itemLimit, setFilters } = useLedgerProductStore(
    useShallow((state) => ({
      itemLimit: state.itemLimit,
      setFilters: state.setFilters,
    }))
  );

  // Fetch stores to resolve actual store ID when selectedTeam is "0" (All Stores)
  const { data: storesData } = useGetStoreDataQuery({
    filters: { limit: 10000 },
    organizationId,
  });

  // Resolve the actual store ID - when "0" is selected, find "Kerbau Gold" or use first store
  const resolvedStoreId = useMemo(() => {
    if (selectedTeam && selectedTeam !== "0") {
      return selectedTeam;
    }

    const stores = storesData?.data?.stores ?? [];
    if (stores.length === 0) {
      return "";
    }

    // Try to find "Kerbau Gold" store first
    const kerbauGoldStore = stores.find((store) => store.name === "Kerbau Gold");
    if (kerbauGoldStore) {
      return kerbauGoldStore.id;
    }

    // Fallback to first store
    return stores[0].id;
  }, [selectedTeam, storesData?.data?.stores]);

  const storeId = resolvedStoreId;

  const { scanRfids } = useScanRfidsManual();
  const {
    data: readerStatus,
    isError: isReaderStatusError,
    refetch: refetchReaderStatus,
  } = useGetDesktopReaderStatusQuery();
  const isReaderConnected = readerStatus?.connected === true;

  const rfidFilters = useMemo(
    () => ({
      assigned_store_id: selectedTeam !== "0" ? selectedTeam : undefined,
      category: RfidCategory.SINGLE,
      is_used: false,
      limit: 10000,
      status: RfidStatus.ACTIVE,
      type: RfidType.REUSABLE,
    }),
    [selectedTeam]
  );

  const { data: rfidData, isLoading: isLoadingRfid } = useGetRfidDataQuery({
    filters: rfidFilters,
    organizationId,
  });

  const { mutateAsync: createLedgerItemMutation } = useCreateLedgerItemMutation();

  const { data: statusesData, isLoading: isLoadingStatuses } =
    useGetStatusLedgerDataQuery({
      organizationId,
    });

  // Check if inbound flow is enabled for this organization
  const isInboundEnabled = isNagatechSyncOrganization(organizationId);

  // Get sections for inbound flow
  const { data: sectionsData, refetch: refetchSections } = useGetStoreAreaDataQuery({
    limit: 10000,
    organizationId,
    storeId,
  });

  // Create section mutation for inbound flow
  const { mutateAsync: createSectionMutation } = useCreateStoreAreaDataMutation();

  // Get stock movement types for inbound flow
  const { data: stockMovementTypesData } = useGetStockMovementTypesQuery({
    enabled: isInboundEnabled,
    filters: { direction: "INBOUND", limit: 100 },
    organizationId,
  });

  // Get "Kode Baki" attribute value from SKU
  const kodeBakiValue = useMemo(() => {
    const kodeBakiAttr = skuData.attributes?.find(
      (attr) => (attr.name ?? attr.Name) === KODE_BAKI_ATTRIBUTE_NAME
    );
    const kodeBakiValues = kodeBakiAttr?.values ?? kodeBakiAttr?.Values;
    if (kodeBakiValues && kodeBakiValues.length > 0) {
      return kodeBakiValues[0].trim();
    }
    return null;
  }, [skuData.attributes]);

  // Get stock movement type ID for "TAMBAH_BARANG" with INBOUND direction
  const tambahBarangTypeId = useMemo(() => {
    const types = stockMovementTypesData?.data?.stock_movement_types || [];
    return types.find(
      (type) => type.name === "TAMBAH_BARANG" && type.direction === "INBOUND"
    )?.id;
  }, [stockMovementTypesData?.data?.stock_movement_types]);

  const statusIdWaitingPrint = useMemo(() => {
    const statusList = statusesData?.data?.statuses || [];
    return statusList.find(
      (status) => status.name === EnumLedgerStatus.WAITING_PRINT
    )?.id;
  }, [statusesData?.data?.statuses]);

  const statusIdWaitingInbound = useMemo(() => {
    const statusList = statusesData?.data?.statuses || [];
    return statusList.find(
      (status) => status.name === EnumLedgerStatus.WAITING_INBOUND
    )?.id;
  }, [statusesData?.data?.statuses]);

  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessingLedger, setIsProcessingLedger] = useState(false);
  const [lastScannedEpc, setLastScannedEpc] = useState<string | null>(null);
  
  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingEpc, setPendingEpc] = useState<string | null>(null);
  const [pendingRfidName, setPendingRfidName] = useState<string | null>(null);

  // Manual EPC input dialog state (for bypass mode)
  const [showManualEpcDialog, setShowManualEpcDialog] = useState(false);
  const [selectedBypassEpc, setSelectedBypassEpc] = useState<string | undefined>(undefined);

  // Bypass mode filter state
  const [bypassRfidType, setBypassRfidType] = useState<string>(RfidType.REUSABLE);
  const [bypassRfidCategory, setBypassRfidCategory] = useState<string>(RfidCategory.SINGLE);

  // Bypass mode RFID query with dynamic filters
  const bypassRfidFilters = useMemo(
    () => ({
      assigned_store_id: selectedTeam !== "0" ? selectedTeam : undefined,
      category: bypassRfidCategory as RfidCategory,
      is_used: false,
      limit: 10000,
      status: RfidStatus.ACTIVE,
      type: bypassRfidType as RfidType,
    }),
    [bypassRfidType, bypassRfidCategory, selectedTeam]
  );

  const { data: bypassRfidData, isLoading: isLoadingBypassRfid } = useGetRfidDataQuery({
    filters: bypassRfidFilters,
    organizationId,
  });

  // Filter options for bypass mode
  const rfidTypeOptions = useMemo(() => [
    { label: t("ledger-product:manualEpc.typeReusable", "Reusable"), value: RfidType.REUSABLE },
    { label: t("ledger-product:manualEpc.typeDisposable", "Disposable"), value: RfidType.DISPOSABLE },
  ], [t]);

  const rfidCategoryOptions = useMemo(() => [
    { label: t("ledger-product:manualEpc.categorySingle", "Single"), value: RfidCategory.SINGLE },
    { label: t("ledger-product:manualEpc.categoryPackage", "Package"), value: RfidCategory.PACKAGE },
  ], [t]);

  // RFID options for bypass mode selection
  const bypassRfidOptions = useMemo(() => {
    const rfids = bypassRfidData?.data?.rfids ?? [];
    return rfids.map((rfid) => ({
      label: `${rfid.name} (${rfid.epc})`,
      value: rfid.epc,
    }));
  }, [bypassRfidData?.data?.rfids]);

  const stopScan = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setIsScanning(false);
  }, []);

  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
    };
  }, []);

  const isEpcAvailable = useCallback(
    (epc: string) => {
      const availableRfids = rfidData?.data?.rfids ?? [];
      return availableRfids.some((rfid) => rfid.epc === epc);
    },
    [rfidData?.data?.rfids]
  );

  const getRfidDetailsByEpc = useCallback(
    (epc: string) => {
      const availableRfids = rfidData?.data?.rfids ?? [];
      return availableRfids.find((rfid) => rfid.epc === epc);
    },
    [rfidData?.data?.rfids]
  );

  // Helper function to find or create section by name
  const findOrCreateSection = useCallback(
    async (sectionName: string): Promise<string | null> => {
      // First, check if section already exists
      const existingSections = sectionsData?.data?.sections || [];
      const existingSection = existingSections.find(
        (section) => section.name === sectionName
      );

      if (existingSection) {
        return existingSection.id;
      }

      // Section doesn't exist, create it
      try {
        const createResult = await createSectionMutation({
          areaName: sectionName,
          organizationId,
          storeId,
        });

        // Refetch sections to update cache
        await refetchSections();

        return createResult.data?.id || null;
      } catch (error) {
        console.error("Error creating section:", error);
        return null;
      }
    },
    [sectionsData?.data?.sections, createSectionMutation, storeId, organizationId, refetchSections]
  );

  // Inbound flow: Create stock movement after ledger creation
  const performInboundFlow = useCallback(
    async (itemId: string) => {
      // Skip if inbound is not enabled or no Kode Baki value
      if (!isInboundEnabled || !kodeBakiValue) {
        return;
      }

      // Skip if stock movement type is not available
      if (!tambahBarangTypeId) {
        console.warn("TAMBAH_BARANG stock movement type not found");
        return;
      }

      try {
        // Find or create section based on Kode Baki
        const sectionId = await findOrCreateSection(kodeBakiValue);

        if (!sectionId) {
          console.error("Failed to get or create section for Kode Baki:", kodeBakiValue);
          toast.error(
            t("ledger-product:scan.sectionError", {
              defaultValue: "Failed to create section for {{sectionName}}",
              sectionName: kodeBakiValue,
            })
          );
          return;
        }

        // Create stock movement
        await createStockMovementService({
          data: {
            image_urls: [],
            item_ids: [itemId],
            note: "",
            stock_movement_type_id: tambahBarangTypeId,
          },
          organizationId,
          sectionId,
          storeId,
        });

        toast.success(
          t("ledger-product:scan.inboundSuccess", {
            defaultValue: "Inbound stock movement created for section {{section}}",
            section: kodeBakiValue,
          })
        );
      } catch (error) {
        console.error("Error performing inbound flow:", error);
        toast.error(
          t("ledger-product:scan.inboundError", {
            defaultValue: "Failed to create inbound stock movement",
          })
        );
      }
    },
    [
      isInboundEnabled,
      kodeBakiValue,
      tambahBarangTypeId,
      findOrCreateSection,
      organizationId,
      storeId,
      t,
    ]
  );

  const createLedgerForEpc = useCallback(
    async (epc: string) => {
      if (!organizationId || !storeId) {
        toast.error(
          t(
            "ledger-product:scan.missingContext",
            "Organization or store context is missing"
          )
        );
        return;
      }

      if (!statusIdWaitingPrint || !statusIdWaitingInbound) {
        toast.error(
          t(
            "ledger-product:scan.missingStatus",
            "Required ledger statuses are not available"
          )
        );
        return;
      }

      setIsProcessingLedger(true);
      try {
        let itemId: string;

        // Check if SKU already has an item (item is not null)
        if (skuData.item?.id) {
          // Skip creating new item, use existing item ID
          itemId = skuData.item.id;
        } else {
          // Create new item via POST to /stores/{storeId}/items
          const creationResult = await createLedgerItemMutation({
            organizationId,
            params: {
              items: [
                {
                  quantity: 1,
                  sku_id: skuId,
                  status_id: statusIdWaitingPrint as EnumLedgerStatus,
                },
              ],
              type: ItemType.SINGLE,
            },
            storeId,
          });

          const createdItemId = creationResult.data.ids?.[0];

          if (!createdItemId) {
            throw new Error(
              t(
                "ledger-product:scan.missingItemId",
                "Ledger creation did not return an item ID"
              )
            );
          }

          itemId = createdItemId;
        }

        await updateLedgerItemService({
          itemId,
          organizationId,
          params: {
            epc,
            sku_id: skuId,
            status_id: statusIdWaitingInbound as EnumLedgerStatus,
          },
          storeId,
        });

        await assignRfidItemService({
          itemId,
          organizationId,
          params: {
            action: "ADD",
            epc,
          },
          storeId,
        });

        // Step 4: Perform inbound flow (only for kerbaugold@katalyst.id)
        await performInboundFlow(itemId);

        setLastScannedEpc(epc);

        toast.success(
          t("ledger-product:scan.success", {
            defaultValue: "Ledger created for EPC {{epc}}",
            epc,
            name: skuName,
          })
        );

        // Clear filters and reset pagination after successful scan
        setFilters({});

        // Invalidate queries based on user type
        const invalidationPromises = [
          queryClient.invalidateQueries({
            queryKey: KEY_USE_GET_RFID_DATA(organizationId, {}),
          }),
        ];
        invalidationPromises.push(
          queryClient.invalidateQueries({
            queryKey: USE_GET_PRODUCT_DATA_QUERY_KEY(organizationId, {
              limit: itemLimit,
            }),
          })
        );
        if (isInboundEnabled) {
          // For kerbaugold: invalidate stock movement data
          invalidationPromises.push(
            queryClient.invalidateQueries({
              queryKey: ["stockMovementData", organizationId, storeId],
            })
          );
        }

        await Promise.all(invalidationPromises);
      } catch (error) {
        console.error("Error creating ledger:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : t(
                "ledger-product:scan.error",
                "Failed to create ledger. Please try again."
              )
        );
      } finally {
        setIsProcessingLedger(false);
      }
    },
    [
      createLedgerItemMutation,
      isInboundEnabled,
      itemLimit,
      organizationId,
      performInboundFlow,
      queryClient,
      setFilters,
      skuData.item,
      skuId,
      skuName,
      statusIdWaitingInbound,
      statusIdWaitingPrint,
      storeId,
      t,
    ]
  );

  const handleEpcDetected = useCallback(
    async (epc: string) => {
      if (!isEpcAvailable(epc)) {
        toast.error(
          t("ledger-product:scan.epcUnavailable", {
            defaultValue: "EPC {{epc}} is not available for use",
            epc,
          })
        );
        return;
      }

      // Get RFID details for the confirmation dialog
      const rfidDetails = getRfidDetailsByEpc(epc);
      const rfidName = rfidDetails?.name || t("ledger-product:confirm.unknownRfid", "Unknown RFID");

      // Set pending data and show confirmation dialog
      setPendingEpc(epc);
      setPendingRfidName(rfidName);
      setShowConfirmDialog(true);
    },
    [getRfidDetailsByEpc, isEpcAvailable, t]
  );

  const handleScanButtonClick = useCallback(async () => {
    if (isProcessingLedger) return;

    if (isScanning) {
      stopScan();
      toast.message(
        t("ledger-product:scan.stopped", "Scanning stopped"),
        {
          description: lastScannedEpc
            ? t("ledger-product:scan.lastEpc", {
                defaultValue: "Last EPC: {{epc}}",
                epc: lastScannedEpc,
              })
            : undefined,
        }
      );
      return;
    }

    // Bypass mode: show manual EPC input dialog instead of scanning
    if (isBypassEnabled) {
      if (!statusIdWaitingPrint || !statusIdWaitingInbound) {
        toast.error(
          t(
            "ledger-product:scan.missingStatus",
            "Required ledger statuses are not available"
          )
        );
        return;
      }

      if (!organizationId || !storeId) {
        toast.error(
          t(
            "ledger-product:scan.missingContext",
            "Organization or store context is missing"
          )
        );
        return;
      }

      if (isLoadingRfid) {
        toast.error(
          t("ledger-product:scan.rfidLoading", "RFID data is still loading")
        );
        return;
      }

      setSelectedBypassEpc(undefined);
      setShowManualEpcDialog(true);
      return;
    }

    const latestStatus = await refetchReaderStatus();
    const isConnected = latestStatus.data?.connected === true;

    if (!isConnected || isReaderStatusError) {
      toast.error(
        t(
          "ledger-product:scan.readerDisconnected",
          "Desktop reader not connected"
        )
      );
      return;
    }

    if (!statusIdWaitingPrint || !statusIdWaitingInbound) {
      toast.error(
        t(
          "ledger-product:scan.missingStatus",
          "Required ledger statuses are not available"
        )
      );
      return;
    }

    if (!organizationId || !storeId) {
      toast.error(
        t(
          "ledger-product:scan.missingContext",
          "Organization or store context is missing"
        )
      );
      return;
    }

    if (isLoadingRfid) {
      toast.error(
        t("ledger-product:scan.rfidLoading", "RFID data is still loading")
      );
      return;
    }

    setLastScannedEpc(null);
    setIsScanning(true);

    scanIntervalRef.current = setInterval(async () => {
      try {
        const result = await scanRfids();

        if (result?.success && result.epcs?.length) {
          const [epc] = result.epcs;
          stopScan();
          await handleEpcDetected(epc);
        }
      } catch (error) {
        console.error("Scan error:", error);
        toast.error(
          t(
            "ledger-product:scan.scanError",
            "Failed to scan. Please try again."
          )
        );
        stopScan();
      }
    }, 250);
  }, [
    handleEpcDetected,
    isBypassEnabled,
    isLoadingRfid,
    isProcessingLedger,
    isReaderStatusError,
    isScanning,
    lastScannedEpc,
    organizationId,
    refetchReaderStatus,
    scanRfids,
    statusIdWaitingInbound,
    statusIdWaitingPrint,
    stopScan,
    storeId,
    t,
  ]);

  // Confirmation dialog handlers
  const handleConfirmContinue = useCallback(async () => {
    if (pendingEpc) {
      setShowConfirmDialog(false);
      await createLedgerForEpc(pendingEpc);
      setPendingEpc(null);
      setPendingRfidName(null);
    }
  }, [createLedgerForEpc, pendingEpc]);

  const handleConfirmCancel = useCallback(() => {
    setShowConfirmDialog(false);
    setPendingEpc(null);
    setPendingRfidName(null);
  }, []);

  // Manual EPC input dialog handlers
  const handleManualEpcSubmit = useCallback(async () => {
    if (!selectedBypassEpc) {
      toast.error(
        t("ledger-product:manualEpc.emptyError", "Please select an EPC")
      );
      return;
    }

    setShowManualEpcDialog(false);
    await handleEpcDetected(selectedBypassEpc);
    setSelectedBypassEpc(undefined);
  }, [handleEpcDetected, selectedBypassEpc, t]);

  const handleManualEpcCancel = useCallback(() => {
    setShowManualEpcDialog(false);
    setSelectedBypassEpc(undefined);
  }, []);

  const getScanButtonContent = () => {
    if (isProcessingLedger) {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t("ledger-product:scan.processing", "Processing")}
        </>
      );
    }

    if (isScanning) {
      return (
        <>
          <CirclePause className="mr-2 h-4 w-4" />
          {t("ledger-product:scan.stop", "Stop")}
        </>
      );
    }

    return (
      <>
        <Scan className="mr-2 h-4 w-4" />
        {t("ledger-product:scan.button", "Scan")}
      </>
    );
  };

  const isActionDisabled =
    isProcessingLedger ||
    isLoadingStatuses ||
    !statusIdWaitingPrint ||
    !statusIdWaitingInbound;

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          disabled={isActionDisabled}
          size="sm"
          variant="outline"
          onClick={handleScanButtonClick}
        >
          {getScanButtonContent()}
        </Button>
        <span
          className={
            isReaderConnected && !isReaderStatusError
              ? "text-xs text-emerald-600"
              : "text-xs text-red-500"
          }
        >
          {isReaderConnected && !isReaderStatusError
            ? t("ledger-product:scan.connected", "Connected")
            : t("ledger-product:scan.disconnected", "Disconnected")}
        </span>
        {lastScannedEpc ? (
          <Badge className="font-mono text-xs" variant="secondary">
            {lastScannedEpc}
          </Badge>
        ) : null}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t("ledger-product:confirm.title", "Confirm RFID Assignment")}
            </DialogTitle>
            <DialogDescription>
              {t("ledger-product:confirm.message", "Are you sure you want to assign this RFID to the product?")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid gap-2">
              <h4 className="font-medium">
                {t("ledger-product:confirm.rfidDetails", "RFID Details")}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("ledger-product:confirm.rfidName", "RFID Name")}:
                  </span>
                  <span className="font-medium">{pendingRfidName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("ledger-product:confirm.rfidEpc", "RFID EPC")}:
                  </span>
                  <span className="font-mono font-medium">{pendingEpc}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("ledger-product:confirm.productName", "Product Name")}:
                  </span>
                  <span className="font-medium">{skuName}</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              disabled={isProcessingLedger}
              variant="outline"
              onClick={handleConfirmCancel}
            >
              {t("ledger-product:confirm.cancel", "Cancel")}
            </Button>
            <Button
              disabled={isProcessingLedger}
              onClick={handleConfirmContinue}
            >
              {isProcessingLedger ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("ledger-product:scan.processing", "Processing")}
                </>
              ) : (
                t("ledger-product:confirm.continue", "Continue")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual EPC Input Dialog (Bypass Mode) */}
      <Dialog open={showManualEpcDialog} onOpenChange={setShowManualEpcDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {t("ledger-product:manualEpc.title", "Select EPC")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "ledger-product:manualEpc.description",
                "Bypass mode is enabled. Select an EPC from the list to simulate a scan."
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Filter Section */}
            <div className="grid grid-cols-2 gap-4">
              <Combobox
                label={t("ledger-product:manualEpc.filterType", "RFID Type")}
                options={rfidTypeOptions}
                placeholder={t("ledger-product:manualEpc.filterTypePlaceholder", "Select type...")}
                value={bypassRfidType}
                onSelect={(value) => {
                  setBypassRfidType(value || RfidType.REUSABLE);
                  setSelectedBypassEpc(undefined);
                }}
              />
              <Combobox
                label={t("ledger-product:manualEpc.filterCategory", "RFID Category")}
                options={rfidCategoryOptions}
                placeholder={t("ledger-product:manualEpc.filterCategoryPlaceholder", "Select category...")}
                value={bypassRfidCategory}
                onSelect={(value) => {
                  setBypassRfidCategory(value || RfidCategory.SINGLE);
                  setSelectedBypassEpc(undefined);
                }}
              />
            </div>

            {/* EPC Selection */}
            <div className="space-y-2">
              <Label>
                {t("ledger-product:manualEpc.label", "Select EPC")}
              </Label>
              {isLoadingBypassRfid ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    {t("ledger-product:manualEpc.loading", "Loading RFIDs...")}
                  </span>
                </div>
              ) : bypassRfidOptions.length === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  {t("ledger-product:manualEpc.noRfids", "No available RFIDs found for the selected filters")}
                </div>
              ) : (
                <Combobox
                  options={bypassRfidOptions}
                  placeholder={t("ledger-product:manualEpc.placeholder", "Select an EPC...")}
                  value={selectedBypassEpc}
                  onSelect={(value) => setSelectedBypassEpc(value)}
                />
              )}
              {bypassRfidOptions.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {t("ledger-product:manualEpc.availableCount", "{{count}} available RFIDs", {
                    count: bypassRfidOptions.length,
                  })}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={handleManualEpcCancel}>
              {t("ledger-product:manualEpc.cancel", "Cancel")}
            </Button>
            <Button
              disabled={!selectedBypassEpc}
              onClick={handleManualEpcSubmit}
            >
              {t("ledger-product:manualEpc.submit", "Submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LedgerProductScanAction;
