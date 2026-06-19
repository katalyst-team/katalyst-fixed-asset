/* eslint-disable max-lines */
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";

import { useUser } from "@/context/user-context";
import useCreateLedgerItemMutation from "@/hooks/api/ledger/useCreateLedgerItemMutation";
import useCreatePackingCollectionDataMutation from "@/hooks/api/packing-collection/useCreatePackingCollectionDataMutation";
import useGetPackingCollectionDataQuery, {
  KEY_USE_GET_PACKING_COLLECTION_DATA,
} from "@/hooks/api/packing-collection/useGetPackingCollectionDataQuery";
import {
  AssignStatus,
  useGetProductDataQuery,
} from "@/hooks/api/product/useGetProductDataQuery";
import useGetRfidDataQuery from "@/hooks/api/rfid/useGetRfidDataQuery";
import { useGetSkuDataQuery } from "@/hooks/api/sku/useGetSKUDataQuery";
import useGetStatusLedgerDataQuery from "@/hooks/api/status/useGetLedgerStatusDataQuery";
import { assignRfidItemService } from "@/services/ledger/assignRfidItemService";
import { updateLedgerItemService } from "@/services/ledger/updateLedgerItemService";
import {
  CreateLedgerItemParams,
  EnumLedgerStatus,
  ItemType,
} from "@/types/ledger";
import { RfidCategory, RfidStatus, RfidType } from "@/types/rfid";
import { SkuType } from "@/types/sku";

import { formatSkuOptionLabel } from "../ledger/utils/formatSkuOptionLabel";
import { LedgerItem, MultiLedger, useAssignRfidStore } from "./store";

export const useAssignRfid = () => {
  const { tokenPayload, selectedTeam } = useUser();
  const queryClient = useQueryClient();

  // Access Zustand store
  const {
    ledgers,
    isProcessing,
    updateLedger,
    addLedger,
    removeLedger,
    resetLedgers,
    setIsProcessing,
  } = useAssignRfidStore(
    useShallow((state) => ({
      addLedger: state.addLedger,
      isProcessing: state.isProcessing,
      ledgers: state.ledgers,
      removeLedger: state.removeLedger,
      resetLedgers: state.resetLedgers,
      setIsProcessing: state.setIsProcessing,
      updateLedger: state.updateLedger,
    })),
  );

  // API Queries
  const { data: skuData, isLoading: isLoadingSku } = useGetSkuDataQuery({
    filters: {
      assigned_store_id: selectedTeam !== "0" ? selectedTeam : undefined,
      limit: 100000,
      type: SkuType.COMMON,
    },
    organizationId: tokenPayload?.organization_id ?? "",
  });

  const { data: productData, isLoading: isLoadingProduct } =
    useGetProductDataQuery({
      filters: {
        assign_status: "UNASSIGNED" as AssignStatus,
        limit: 10000,
      },
      organizationId: tokenPayload?.organization_id ?? "",
    });

  const {
    data: packingCollectionsData,
    isLoading: isLoadingPackingCollections,
  } = useGetPackingCollectionDataQuery({
    organizationId: tokenPayload?.organization_id ?? "",
  });

  const { data: statuses } = useGetStatusLedgerDataQuery({
    organizationId: tokenPayload?.organization_id ?? "",
  });

  // RFID Data Queries
  const { data: rfidReusableSingle, isLoading: isLoadingRfidReusableSingle } =
    useGetRfidDataQuery({
      filters: {
        assigned_store_id: selectedTeam !== "0" ? selectedTeam : undefined,
        category: RfidCategory.SINGLE,
        is_used: false,
        limit: 10000,
        status: RfidStatus.ACTIVE,
        type: RfidType.REUSABLE,
      },
      organizationId: tokenPayload?.organization_id ?? "",
    });

  const { data: rfidReusablePackage, isLoading: isLoadingRfidReusablePackage } =
    useGetRfidDataQuery({
      filters: {
        assigned_store_id: selectedTeam !== "0" ? selectedTeam : undefined,
        category: RfidCategory.PACKAGE,
        is_used: false,
        limit: 10000,
        status: RfidStatus.ACTIVE,
        type: RfidType.REUSABLE,
      },
      organizationId: tokenPayload?.organization_id ?? "",
    });

  const {
    data: rfidDisposableSingle,
    isLoading: isLoadingRfidDisposableSingle,
  } = useGetRfidDataQuery({
    filters: {
      assigned_store_id: selectedTeam !== "0" ? selectedTeam : undefined,
      category: RfidCategory.SINGLE,
      is_used: false,
      limit: 10000,
      status: RfidStatus.ACTIVE,
      type: RfidType.DISPOSABLE,
    },
    organizationId: tokenPayload?.organization_id ?? "",
  });

  const {
    data: rfidDisposablePackage,
    isLoading: isLoadingRfidDisposablePackage,
  } = useGetRfidDataQuery({
    filters: {
      assigned_store_id: selectedTeam !== "0" ? selectedTeam : undefined,
      category: RfidCategory.PACKAGE,
      is_used: false,
      limit: 10000,
      status: RfidStatus.ACTIVE,
      type: RfidType.DISPOSABLE,
    },
    organizationId: tokenPayload?.organization_id ?? "",
  });

  // Mutations
  const { mutateAsync: createLedgerMutation } = useCreateLedgerItemMutation();
  const { mutateAsync: createPackingCollectionMutation } =
    useCreatePackingCollectionDataMutation({
      organizationId: tokenPayload?.organization_id || "",
    });

  // Memoized options
  const optionsSku = useMemo(() => {
    if (!skuData) return [];
    const skus = skuData.data.skus || [];
    return skus.map((sku) => ({
      label: formatSkuOptionLabel(sku.id, sku.name),
      value: sku.id,
    }));
  }, [skuData]);

  const optionsProduct = useMemo(() => {
    if (!productData) return [];
    const skus = productData.data.skus || [];
    return skus.map((product) => ({
      label: formatSkuOptionLabel(product.id, product.name),
      value: product.id,
    }));
  }, [productData]);

  const packingCollections = useMemo(() => {
    return packingCollectionsData?.data?.packing_collections || [];
  }, [packingCollectionsData?.data?.packing_collections]);

  const packingCollectionOptions = useMemo(() => {
    return packingCollections.map((collection) => ({
      label: collection.name,
      value: collection.id,
    }));
  }, [packingCollections]);

  const statusIdWaitingPrint = useMemo(() => {
    const statusList = statuses?.data?.statuses || [];
    return statusList.find(
      (status) => status.name === EnumLedgerStatus.WAITING_PRINT,
    )?.id;
  }, [statuses]);

  const statusIdWaitingInbound = useMemo(() => {
    const statusList = statuses?.data?.statuses || [];
    return statusList.find(
      (status) => status.name === EnumLedgerStatus.WAITING_INBOUND,
    )?.id;
  }, [statuses]);

  // Get RFID options
  const getOptionsRfid = useCallback(
    (rfidType: RfidType, rfidCategory: RfidCategory) => {
      let rfidData;

      if (
        rfidType === RfidType.REUSABLE &&
        rfidCategory === RfidCategory.SINGLE
      ) {
        rfidData = rfidReusableSingle;
      } else if (
        rfidType === RfidType.REUSABLE &&
        rfidCategory === RfidCategory.PACKAGE
      ) {
        rfidData = rfidReusablePackage;
      } else if (
        rfidType === RfidType.DISPOSABLE &&
        rfidCategory === RfidCategory.SINGLE
      ) {
        rfidData = rfidDisposableSingle;
      } else if (
        rfidType === RfidType.DISPOSABLE &&
        rfidCategory === RfidCategory.PACKAGE
      ) {
        rfidData = rfidDisposablePackage;
      }

      if (!rfidData) return [];

      const rfids = rfidData.data.rfids || [];
      return rfids.map((rfid) => ({
        epc: rfid.epc,
        label: `${rfid.name || "N/A"} (${rfid.epc})`,
        value: rfid.id,
      }));
    },
    [
      rfidReusableSingle,
      rfidReusablePackage,
      rfidDisposableSingle,
      rfidDisposablePackage,
    ],
  );

  // Get loading state for RFID
  const getIsLoadingRfid = useCallback(
    (rfidType: RfidType, rfidCategory: RfidCategory) => {
      if (
        rfidType === RfidType.REUSABLE &&
        rfidCategory === RfidCategory.SINGLE
      ) {
        return isLoadingRfidReusableSingle;
      } else if (
        rfidType === RfidType.REUSABLE &&
        rfidCategory === RfidCategory.PACKAGE
      ) {
        return isLoadingRfidReusablePackage;
      } else if (
        rfidType === RfidType.DISPOSABLE &&
        rfidCategory === RfidCategory.SINGLE
      ) {
        return isLoadingRfidDisposableSingle;
      } else if (
        rfidType === RfidType.DISPOSABLE &&
        rfidCategory === RfidCategory.PACKAGE
      ) {
        return isLoadingRfidDisposablePackage;
      }
      return false;
    },
    [
      isLoadingRfidReusableSingle,
      isLoadingRfidReusablePackage,
      isLoadingRfidDisposableSingle,
      isLoadingRfidDisposablePackage,
    ],
  );

  // Get available item options
  const getAvailableItemOptions = useCallback(
    (ledgerIndex: number, currentItemIndex: number) => {
      const ledger = ledgers[ledgerIndex];

      if (ledger.itemSelectionType === "sku") {
        return optionsSku;
      } else {
        const selectedProductIds = ledger.items
          .map((item, idx) => (idx !== currentItemIndex ? item.sku_id : null))
          .filter(Boolean);

        return optionsProduct.filter(
          (option) => !selectedProductIds.includes(option.value),
        );
      }
    },
    [ledgers, optionsSku, optionsProduct],
  );

  // Auto-switch to manual selection when item type is SINGLE
  useEffect(() => {
    ledgers.forEach((ledger, index) => {
      if (
        ledger.itemType === ItemType.SINGLE &&
        ledger.selectionMode === "packing"
      ) {
        updateLedger(index, { selectionMode: "manual" });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ledgers]);

  // Handle packing collection select
  const handlePackingCollectionSelect = useCallback(
    (ledgerIndex: number, collectionId: string) => {
      const collection = packingCollections.find((c) => c.id === collectionId);
      const selectedPackingCollection = collection || null;

      let updatedItems: LedgerItem[];
      if (collection) {
        const autoFilledItems =
          collection.packing_items?.map((packingItem) => ({
            quantity: packingItem.quantity,
            sku_id: packingItem.sku_id.id,
          })) || [];

        updatedItems =
          autoFilledItems.length > 0
            ? autoFilledItems
            : [{ quantity: 1, sku_id: "" }];
      } else {
        updatedItems = [{ quantity: 1, sku_id: "" }];
      }

      updateLedger(ledgerIndex, {
        items: updatedItems,
        selectedPackingCollection,
      });
    },
    [packingCollections, updateLedger],
  );

  // Validation
  const isLedgerValid = useCallback((ledger: MultiLedger) => {
    const baseValidation =
      ledger.rfidType !== null &&
      ledger.rfidCategory !== null &&
      ledger.selectedRfidIds.length > 0 &&
      ledger.itemType !== null;

    if (
      ledger.rfidType === RfidType.DISPOSABLE &&
      ledger.rfidCategory === RfidCategory.SINGLE
    ) {
      if (ledger.selectionMode === "manual") {
        return (
          baseValidation &&
          ledger.items.length === 1 &&
          ledger.items[0].quantity === 1 &&
          ledger.items[0].sku_id !== ""
        );
      } else {
        return baseValidation && ledger.selectedPackingCollection !== null;
      }
    }

    if (ledger.selectionMode === "manual") {
      const itemsValid = ledger.items.every(
        (item) => item.sku_id && item.quantity > 0,
      );

      if (ledger.itemSelectionType === "product") {
        const productIds = ledger.items.map((item) => item.sku_id);
        const uniqueProductIds = new Set(productIds);
        if (productIds.length !== uniqueProductIds.size) {
          return false;
        }
      }

      const packingCollectionValid =
        !ledger.saveAsPackingCollection ||
        (ledger.saveAsPackingCollection &&
          ledger.packingCollectionName.trim() !== "");
      return baseValidation && itemsValid && packingCollectionValid;
    } else {
      return baseValidation && ledger.selectedPackingCollection !== null;
    }
  }, []);

  const areAllLedgersValid = useMemo(() => {
    return ledgers.every((ledger) => isLedgerValid(ledger));
  }, [ledgers, isLedgerValid]);

  // Process REUSABLE ledger
  const processReusableLedger = useCallback(
    async (ledger: MultiLedger) => {
      const params: CreateLedgerItemParams = {
        items: ledger.items.map((item) => ({
          ...item,
          status_id: statusIdWaitingPrint as EnumLedgerStatus,
        })),
        type: ledger.itemType,
      };

      if (
        ledger.selectionMode === "packing" &&
        ledger.selectedPackingCollection?.id
      ) {
        params.packing_collection_id = ledger.selectedPackingCollection.id;
      }

      const createResult = await createLedgerMutation({
        organizationId: tokenPayload?.organization_id ?? "",
        params,
        storeId: selectedTeam ?? "",
      });

      const createdItemIds = createResult.data.ids || [];
      const expandedItems: Array<{ sku_id: string }> = [];
      ledger.items.forEach((item) => {
        for (let i = 0; i < item.quantity; i++) {
          expandedItems.push({ sku_id: item.sku_id });
        }
      });

      for (const [index, itemId] of createdItemIds.entries()) {
        await updateLedgerItemService({
          itemId,
          organizationId: tokenPayload?.organization_id ?? "",
          params: {
            epc: ledger.selectedEpcs[0],
            sku_id: expandedItems[index]?.sku_id || "",
            status_id: statusIdWaitingInbound as EnumLedgerStatus,
          },
          storeId: selectedTeam ?? "",
        });

        await assignRfidItemService({
          itemId,
          organizationId: tokenPayload?.organization_id ?? "",
          params: {
            action: "ADD",
            epc: ledger.selectedEpcs[0],
          },
          storeId: selectedTeam ?? "",
        });
      }
    },
    [
      statusIdWaitingPrint,
      statusIdWaitingInbound,
      createLedgerMutation,
      tokenPayload,
      selectedTeam,
    ],
  );

  // Process DISPOSABLE ledger
  const processDisposableLedger = useCallback(
    async (ledger: MultiLedger) => {
      const params: CreateLedgerItemParams = {
        items: ledger.items.map((item) => ({
          ...item,
          status_id: statusIdWaitingPrint as EnumLedgerStatus,
        })),
        type: ledger.itemType,
      };

      if (
        ledger.selectionMode === "packing" &&
        ledger.selectedPackingCollection?.id
      ) {
        params.packing_collection_id = ledger.selectedPackingCollection.id;
      }

      const createResult = await createLedgerMutation({
        organizationId: tokenPayload?.organization_id ?? "",
        params,
        storeId: selectedTeam ?? "",
      });

      const createdItemIds = createResult.data.ids || [];
      const expandedItems: Array<{ sku_id: string }> = [];
      ledger.items.forEach((item) => {
        for (let i = 0; i < item.quantity; i++) {
          expandedItems.push({ sku_id: item.sku_id });
        }
      });

      for (const [index, itemId] of createdItemIds.entries()) {
        await updateLedgerItemService({
          itemId,
          organizationId: tokenPayload?.organization_id ?? "",
          params: {
            epc: ledger.selectedEpcs[0],
            sku_id: expandedItems[index]?.sku_id || "",
            status_id: statusIdWaitingInbound as EnumLedgerStatus,
          },
          storeId: selectedTeam ?? "",
        });

        await assignRfidItemService({
          itemId,
          organizationId: tokenPayload?.organization_id ?? "",
          params: {
            action: "ADD",
            epc: ledger.selectedEpcs[0],
          },
          storeId: selectedTeam ?? "",
        });
      }
    },
    [
      statusIdWaitingPrint,
      statusIdWaitingInbound,
      createLedgerMutation,
      tokenPayload,
      selectedTeam,
    ],
  );

  // Save workflow
  const handleSave = useCallback(async () => {
    setIsProcessing(true);

    try {
      const ledgerPromises: Promise<void>[] = [];

      for (let i = 0; i < ledgers.length; i++) {
        const ledger = ledgers[i];

        // Create packing collection once if needed
        if (
          ledger.saveAsPackingCollection &&
          ledger.itemType === ItemType.PACKING &&
          ledger.selectionMode === "manual"
        ) {
          const packingCollectionPayload = {
            description: ledger.packingCollectionDescription || "",
            name: ledger.packingCollectionName,
            packing_items: ledger.items.map((item) => ({
              quantity: item.quantity,
              sku_id: item.sku_id,
            })),
          };

          await createPackingCollectionMutation(packingCollectionPayload);

          await queryClient.invalidateQueries({
            queryKey: KEY_USE_GET_PACKING_COLLECTION_DATA(
              tokenPayload?.organization_id || "",
            ),
          });

          toast.success("Packing collection created successfully!");
        }

        // Process each selected RFID
        for (const rfidIndex of ledger.selectedRfidIds.keys()) {
          const selectedRfidId = ledger.selectedRfidIds[rfidIndex];
          const selectedEpc = ledger.selectedEpcs[rfidIndex];

          const iterations =
            ledger.rfidType === RfidType.REUSABLE &&
            ledger.itemType === ItemType.PACKING
              ? ledger.unit
              : 1;

          for (let j = 0; j < iterations; j++) {
            const ledgerPromise = (async () => {
              const ledgerWithSingleRfid = {
                ...ledger,
                selectedEpcs: [selectedEpc],
                selectedRfidIds: [selectedRfidId],
              };

              if (ledger.rfidType === RfidType.REUSABLE) {
                await processReusableLedger(ledgerWithSingleRfid);
              } else {
                await processDisposableLedger(ledgerWithSingleRfid);
              }
            })();

            ledgerPromises.push(ledgerPromise);
          }
        }
      }

      const results = await Promise.allSettled(ledgerPromises);

      const successCount = results.filter(
        (result) => result.status === "fulfilled",
      ).length;
      const failureCount = results.filter(
        (result) => result.status === "rejected",
      ).length;

      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(`Error processing ledger ${index + 1}:`, result.reason);
          toast.error(
            `Ledger ${index + 1} failed: ${
              result.reason instanceof Error
                ? result.reason.message
                : "Unknown error"
            }`,
          );
        }
      });

      if (successCount === ledgerPromises.length) {
        toast.success(
          `Successfully assigned ${successCount} RFID(s) to ledger items!`,
        );
      } else if (successCount > 0) {
        toast.success(
          `${successCount}/${ledgerPromises.length} RFID(s) assigned successfully`,
        );
        if (failureCount > 0) {
          toast.error(`${failureCount} RFID assignment(s) failed`);
        }
      } else {
        toast.error("All RFID assignments failed");
      }

      // Invalidate all GET queries if at least one ledger succeeded
      if (successCount > 0) {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: [
              "stockMovementData",
              tokenPayload?.organization_id,
              selectedTeam,
            ],
          }),
          queryClient.invalidateQueries({
            queryKey: ["skus", tokenPayload?.organization_id],
          }),
          queryClient.invalidateQueries({
            queryKey: ["products", tokenPayload?.organization_id],
          }),
          queryClient.invalidateQueries({
            queryKey: ["rfidData", tokenPayload?.organization_id],
          }),
          queryClient.invalidateQueries({
            queryKey: ["packingCollectionData", tokenPayload?.organization_id],
          }),
          queryClient.invalidateQueries({
            queryKey: ["statusLedgerData", tokenPayload?.organization_id],
          }),
        ]);
      }

      // Only reset form if all ledgers succeeded
      if (successCount === ledgerPromises.length) {
        resetLedgers();
      }
    } finally {
      setIsProcessing(false);
    }
  }, [
    ledgers,
    setIsProcessing,
    createPackingCollectionMutation,
    queryClient,
    tokenPayload,
    selectedTeam,
    processReusableLedger,
    processDisposableLedger,
    resetLedgers,
  ]);

  return {
    addLedger,

    areAllLedgersValid,

    getAvailableItemOptions,

    getIsLoadingRfid,

    // Business logic
    getOptionsRfid,

    handlePackingCollectionSelect,

    handleSave,

    isLedgerValid,

    isLoadingPackingCollections,

    isLoadingProduct,

    // Loading states
    isLoadingSku,

    isProcessing,

    // State
    ledgers,

    optionsProduct,

    // Options
    optionsSku,

    packingCollectionOptions,

    removeLedger,

    resetLedgers,
    // Store actions
    updateLedger,
  };
};
