/* eslint-disable max-lines */
"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Ban, Layers, Loader2, Plus, Trash2, X } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

import { InputWithLabel } from "@/components/shared/InputWithLabel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multiSelect";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { PackingCollectionItemType } from "@/types/packing-collection";
import { RfidCategory, RfidStatus, RfidType } from "@/types/rfid";
import { SkuType } from "@/types/sku";

import { formatSkuOptionLabel } from "../ledger/utils/formatSkuOptionLabel";

interface LedgerItem {
  sku_id: string;
  quantity: number;
}

interface MultiLedger {
  id: string;
  rfidType: RfidType;
  rfidCategory: RfidCategory;
  selectedRfidIds: string[]; // Array to support multiple RFIDs for SKU type
  selectedEpcs: string[]; // Array to support multiple EPCs for SKU type
  itemType: ItemType;
  itemSelectionType: "sku" | "product"; // SKU: many RFIDs can use same SKU, Product: one RFID per product only
  items: LedgerItem[];
  packingCollectionDescription: string;
  packingCollectionName: string;
  saveAsPackingCollection: boolean;
  selectedPackingCollection: PackingCollectionItemType | null;
  selectionMode: "manual" | "packing";
  unit: number;
}

const AssignRfid = () => {
  const { t } = useTranslation(["assign-rfid", "ledger"]);
  const { tokenPayload, selectedTeam } = useUser();
  const queryClient = useQueryClient();

  // SKU Data Query
  const { data: skuData, isLoading: isLoadingSku } = useGetSkuDataQuery({
    filters: {
      limit: 10000,
      type: SkuType.COMMON,
    },
    organizationId: tokenPayload?.organization_id ?? "",
  });

  // Product Data Query (for products with assign_status=UNASSIGNED)
  const { data: productData, isLoading: isLoadingProduct } =
    useGetProductDataQuery({
      filters: {
        assign_status: "UNASSIGNED" as AssignStatus,
        limit: 10000,
      },
      organizationId: tokenPayload?.organization_id ?? "",
    });

  // Packing Collections Query
  const {
    data: packingCollectionsData,
    isLoading: isLoadingPackingCollections,
  } = useGetPackingCollectionDataQuery({
    organizationId: tokenPayload?.organization_id ?? "",
  });

  // Status Query
  const { data: statuses } = useGetStatusLedgerDataQuery({
    organizationId: tokenPayload?.organization_id ?? "",
  });

  // RFID Data Queries - fetch RFIDs for each type/category combination
  // This is more efficient than fetching all and filtering client-side
  const { data: rfidReusableSingle, isLoading: isLoadingRfidReusableSingle } =
    useGetRfidDataQuery({
      filters: {
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

  // State
  const [ledgers, setLedgers] = useState<MultiLedger[]>([
    {
      id: uuidv4(),
      itemSelectionType: "sku",
      itemType: ItemType.SINGLE,
      items: [{ quantity: 1, sku_id: "" }],
      packingCollectionDescription: "",
      packingCollectionName: "",
      rfidCategory: RfidCategory.SINGLE,
      rfidType: RfidType.DISPOSABLE,
      saveAsPackingCollection: false,
      selectedEpcs: [],
      selectedPackingCollection: null,
      selectedRfidIds: [],
      selectionMode: "manual",
      unit: 1,
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Memoized data
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

  // Get RFID options based on type and category from the appropriate query
  const getOptionsRfid = useCallback(
    (rfidType: RfidType, rfidCategory: RfidCategory) => {
      let rfidData;

      // Select the appropriate RFID data based on type and category
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
        label: `${rfid.epc} (${rfid.name || t("notAvailable", { ns: "ledger" })})`,
        value: rfid.id,
      }));
    },
    [
      rfidReusableSingle,
      rfidReusablePackage,
      rfidDisposableSingle,
      rfidDisposablePackage,
      t,
    ],
  );

  // Get loading state for RFID options based on type and category
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

  // Get available SKU/Product options for a specific ledger
  // For products: filter out already selected products from other items in the same ledger
  const getAvailableItemOptions = useCallback(
    (ledgerIndex: number, currentItemIndex: number) => {
      const ledger = ledgers[ledgerIndex];

      if (ledger.itemSelectionType === "sku") {
        return optionsSku;
      } else {
        // For products: filter out already selected products in this ledger
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

  // Update ledger
  const updateLedger = useCallback(
    (index: number, updates: Partial<MultiLedger>) => {
      setLedgers((prev) =>
        prev.map((ledger, i) =>
          i === index ? { ...ledger, ...updates } : ledger,
        ),
      );
    },
    [],
  );

  // Add new ledger
  const handleAddNewLedger = () => {
    const newLedger: MultiLedger = {
      id: uuidv4(),
      itemSelectionType: "sku",
      itemType: ItemType.SINGLE,
      items: [{ quantity: 1, sku_id: "" }],
      packingCollectionDescription: "",
      packingCollectionName: "",
      rfidCategory: RfidCategory.SINGLE,
      rfidType: RfidType.DISPOSABLE,
      saveAsPackingCollection: false,
      selectedEpcs: [],
      selectedPackingCollection: null,
      selectedRfidIds: [],
      selectionMode: "manual",
      unit: 1,
    };
    setLedgers((prev) => [...prev, newLedger]);
  };

  // Remove ledger
  const handleRemoveLedger = (index: number) => {
    if (ledgers.length > 1) {
      setLedgers((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Add item
  const handleAddItem = (ledgerIndex: number) => {
    const updatedItems = [
      ...ledgers[ledgerIndex].items,
      { quantity: 1, sku_id: "" },
    ];
    updateLedger(ledgerIndex, { items: updatedItems });
  };

  // Remove item
  const handleRemoveItem = (ledgerIndex: number, itemIndex: number) => {
    if (ledgers[ledgerIndex].items.length > 1) {
      const updatedItems = ledgers[ledgerIndex].items.filter(
        (_, i) => i !== itemIndex,
      );
      updateLedger(ledgerIndex, { items: updatedItems });
    }
  };

  // Change item field
  const handleItemChange = (
    ledgerIndex: number,
    itemIndex: number,
    field: keyof LedgerItem,
    value: string | number,
  ) => {
    const updatedItems = ledgers[ledgerIndex].items.map((item, i) =>
      i === itemIndex ? { ...item, [field]: value } : item,
    );
    updateLedger(ledgerIndex, { items: updatedItems });
  };

  // Handle RFID selection for single select (Product type)
  const handleRfidSelectSingle = useCallback(
    (ledgerIndex: number, value: string) => {
      const ledger = ledgers[ledgerIndex];
      const optionsRfid = getOptionsRfid(ledger.rfidType, ledger.rfidCategory);
      const selectedRfid = optionsRfid.find((option) => option.value === value);
      updateLedger(ledgerIndex, {
        selectedEpcs: selectedRfid ? [selectedRfid.epc] : [],
        selectedRfidIds: value ? [value] : [],
      });
    },
    [ledgers, getOptionsRfid, updateLedger],
  );

  // Handle RFID selection for multi select (SKU type)
  const handleRfidSelectMultiple = useCallback(
    (ledgerIndex: number, values: string[]) => {
      const ledger = ledgers[ledgerIndex];
      const optionsRfid = getOptionsRfid(ledger.rfidType, ledger.rfidCategory);
      const selectedEpcs = values
        .map((value) => {
          const rfid = optionsRfid.find((option) => option.value === value);
          return rfid?.epc || "";
        })
        .filter(Boolean);

      updateLedger(ledgerIndex, {
        selectedEpcs,
        selectedRfidIds: values,
      });
    },
    [ledgers, getOptionsRfid, updateLedger],
  );

  // Handle packing collection select
  const handlePackingCollectionSelect = (
    ledgerIndex: number,
    collectionId: string,
  ) => {
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
  };

  // Validation
  const isLedgerValid = (ledger: MultiLedger) => {
    const baseValidation =
      ledger.rfidType !== null &&
      ledger.rfidCategory !== null &&
      ledger.selectedRfidIds.length > 0 &&
      ledger.itemType !== null;

    // For DISPOSABLE + SINGLE: must have exactly 1 item with qty 1
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

    // For other combinations
    if (ledger.selectionMode === "manual") {
      const itemsValid = ledger.items.every(
        (item) => item.sku_id && item.quantity > 0,
      );

      // For products: check no duplicate product IDs
      if (ledger.itemSelectionType === "product") {
        const productIds = ledger.items.map((item) => item.sku_id);
        const uniqueProductIds = new Set(productIds);
        if (productIds.length !== uniqueProductIds.size) {
          return false; // Duplicate products found
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
  };

  const areAllLedgersValid = useMemo(() => {
    return ledgers.every((ledger) => isLedgerValid(ledger));
  }, [ledgers]);

  // Save workflow
  const handleSave = async () => {
    setIsProcessing(true);

    try {
      const ledgerPromises: Promise<void>[] = [];

      for (let i = 0; i < ledgers.length; i++) {
        const ledger = ledgers[i];

        // Create packing collection once if needed (before processing RFIDs)
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

          toast.success(
            t("packingCollectionCreatedSuccessfully", { ns: "ledger" }),
          );
        }

        // Process each selected RFID
        for (const rfidIndex of ledger.selectedRfidIds.keys()) {
          const selectedRfidId = ledger.selectedRfidIds[rfidIndex];
          const selectedEpc = ledger.selectedEpcs[rfidIndex];

          // Determine how many times to create this ledger
          const iterations =
            ledger.rfidType === RfidType.REUSABLE &&
            ledger.itemType === ItemType.PACKING
              ? ledger.unit
              : 1;

          for (let j = 0; j < iterations; j++) {
            const ledgerPromise = (async () => {
              // Create a modified ledger object with single RFID for processing
              const ledgerWithSingleRfid = {
                ...ledger,
                selectedEpcs: [selectedEpc],
                selectedRfidIds: [selectedRfidId],
              };

              // Process based on RFID type
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
                : t("unknownError")
            }`,
          );
        }
      });

      if (successCount === ledgerPromises.length) {
        toast.success(t("allLedgersCreated", { count: successCount }));
      } else if (successCount > 0) {
        toast.success(
          t("partialSuccess", {
            success: successCount,
            total: ledgerPromises.length,
          }),
        );
        if (failureCount > 0) {
          toast.error(t("someFailed", { count: failureCount }));
        }
      } else {
        toast.error(t("allFailed"));
      }

      // Invalidate all GET queries if at least one ledger succeeded
      if (successCount > 0) {
        // Invalidate all GET queries to refresh data after successful submission
        await Promise.all([
          // Stock Movement Data - ledger items were created
          queryClient.invalidateQueries({
            queryKey: [
              "stockMovementData",
              tokenPayload?.organization_id,
              selectedTeam,
            ],
          }),
          // SKU Data - SKUs were assigned to RFIDs
          queryClient.invalidateQueries({
            queryKey: ["skus", tokenPayload?.organization_id],
          }),
          // Product Data - products assign_status changed from UNASSIGNED
          queryClient.invalidateQueries({
            queryKey: ["products", tokenPayload?.organization_id],
          }),
          // RFID Data - RFIDs were used (is_used changed from false to true)
          queryClient.invalidateQueries({
            queryKey: ["rfidData", tokenPayload?.organization_id],
          }),
          // Packing Collection Data - may have created new packing collections
          queryClient.invalidateQueries({
            queryKey: ["packingCollectionData", tokenPayload?.organization_id],
          }),
          // Status Ledger Data - for completeness
          queryClient.invalidateQueries({
            queryKey: ["statusLedgerData", tokenPayload?.organization_id],
          }),
        ]);
      }

      // Only reset form if all ledgers succeeded
      if (successCount === ledgerPromises.length) {
        resetForm();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Process REUSABLE ledger
  const processReusableLedger = async (ledger: MultiLedger) => {
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
  };

  // Process DISPOSABLE ledger
  const processDisposableLedger = async (ledger: MultiLedger) => {
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
  };

  // Reset form
  const resetForm = () => {
    setLedgers([
      {
        id: uuidv4(),
        itemSelectionType: "sku",
        itemType: ItemType.SINGLE,
        items: [{ quantity: 1, sku_id: "" }],
        packingCollectionDescription: "",
        packingCollectionName: "",
        rfidCategory: RfidCategory.SINGLE,
        rfidType: RfidType.DISPOSABLE,
        saveAsPackingCollection: false,
        selectedEpcs: [],
        selectedPackingCollection: null,
        selectedRfidIds: [],
        selectionMode: "manual",
        unit: 1,
      },
    ]);
  };

  // Get validation icon
  const getLedgerValidationIcon = (ledger: MultiLedger) => {
    return isLedgerValid(ledger) ? "✓" : "!";
  };

  // Render ledger card
  const renderLedgerCard = (ledger: MultiLedger, ledgerIndex: number) => (
    <Card key={ledger.id}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>
              {t("ledger")} {ledgerIndex + 1}
            </CardTitle>
            <Badge variant={isLedgerValid(ledger) ? "default" : "destructive"}>
              {getLedgerValidationIcon(ledger)}
            </Badge>
          </div>
          {ledgers.length > 1 && (
            <Button
              className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
              size="sm"
              variant="ghost"
              onClick={() => handleRemoveLedger(ledgerIndex)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* RFID Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label isRequired>{t("rfidType")}</Label>
            <Select
              value={ledger.rfidType}
              onValueChange={(value: RfidType) => {
                updateLedger(ledgerIndex, {
                  rfidType: value,
                  selectedEpcs: [],
                  selectedRfidIds: [],
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={RfidType.REUSABLE}>
                  {t("reusable")}
                </SelectItem>
                <SelectItem value={RfidType.DISPOSABLE}>
                  {t("disposable")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* RFID Category Selection */}
          <div className="space-y-2">
            <Label isRequired>{t("rfidCategory")}</Label>
            <Select
              value={ledger.rfidCategory}
              onValueChange={(value: RfidCategory) => {
                updateLedger(ledgerIndex, {
                  itemType:
                    value === RfidCategory.SINGLE
                      ? ItemType.SINGLE
                      : ItemType.PACKING,
                  rfidCategory: value,
                  selectedEpcs: [],
                  selectedRfidIds: [],
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={RfidCategory.SINGLE}>
                  {t("single")}
                </SelectItem>
                <SelectItem value={RfidCategory.PACKAGE}>
                  {t("package")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* SKU/Product Selection Type Toggle */}
        <div className="space-y-2">
          <Label isRequired>{t("itemSelectionType")}</Label>
          <Select
            value={ledger.itemSelectionType}
            onValueChange={(value: "sku" | "product") => {
              updateLedger(ledgerIndex, {
                itemSelectionType: value,
                items: [{ quantity: 1, sku_id: "" }], // Reset items when changing type
              });
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sku">{t("skuType")}</SelectItem>
              <SelectItem value="product">{t("productType")}</SelectItem>
            </SelectContent>
          </Select>
          {ledger.itemSelectionType === "product" && (
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md text-sm text-blue-800 dark:text-blue-200">
              ℹ️ {t("productTypeInfo")}
            </div>
          )}
        </div>

        {/* RFID Selection - Multi-select for SKU, Single-select for Product */}
        <div className="space-y-2">
          <Label isRequired>{t("selectRfid")}</Label>
          {ledger.itemSelectionType === "sku" ? (
            <MultiSelect
              defaultValue={ledger.selectedRfidIds}
              options={getOptionsRfid(ledger.rfidType, ledger.rfidCategory)}
              placeholder={
                getIsLoadingRfid(ledger.rfidType, ledger.rfidCategory)
                  ? t("loading")
                  : t("selectRfidsPlaceholder")
              }
              onValueChange={(values) =>
                handleRfidSelectMultiple(ledgerIndex, values)
              }
            />
          ) : (
            <Combobox
              isRequired
              options={getOptionsRfid(ledger.rfidType, ledger.rfidCategory)}
              placeholder={
                getIsLoadingRfid(ledger.rfidType, ledger.rfidCategory)
                  ? t("loading")
                  : t("selectRfidPlaceholder")
              }
              value={ledger.selectedRfidIds[0] || ""}
              onSelect={(value) =>
                handleRfidSelectSingle(ledgerIndex, value || "")
              }
            />
          )}
        </div>

        {/* Item Type - only for PACKAGE category */}
        {ledger.rfidCategory === RfidCategory.PACKAGE && (
          <div className="space-y-2">
            <Label isRequired>{t("itemType", { ns: "ledger" })}</Label>
            <Select
              value={ledger.itemType}
              onValueChange={(value: ItemType) =>
                updateLedger(ledgerIndex, { itemType: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ItemType.SINGLE}>
                  {t("modal.create.itemTypes.single", { ns: "ledger" })}
                </SelectItem>
                <SelectItem value={ItemType.PACKING}>
                  {t("modal.create.itemTypes.packing", { ns: "ledger" })}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Unit Input - only for REUSABLE + PACKING */}
        {ledger.rfidType === RfidType.REUSABLE &&
          ledger.itemType === ItemType.PACKING && (
            <div className="space-y-2">
              <InputWithLabel
                isRequired
                label={t("modal.create.unit", { ns: "ledger" })}
                type="number"
                value={ledger.unit || ""}
                onChange={(e) =>
                  updateLedger(ledgerIndex, {
                    unit: Number(e.target.value),
                  })
                }
              />
            </div>
          )}

        {/* Selection Mode Tabs */}
        <div className="space-y-2">
          <Label>{t("modal.create.selectionMode", { ns: "ledger" })}</Label>
          <Tabs
            value={ledger.selectionMode}
            onValueChange={(value) =>
              updateLedger(ledgerIndex, {
                selectionMode: value as "manual" | "packing",
              })
            }
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">
                {t("modal.create.manualSelection", { ns: "ledger" })}
              </TabsTrigger>
              <TabsTrigger
                disabled={ledger.itemType === ItemType.SINGLE}
                value="packing"
              >
                <span className="flex items-center gap-2">
                  {t("modal.create.packingCollection", { ns: "ledger" })}
                  {ledger.itemType === ItemType.SINGLE && (
                    <Ban className="h-4 w-4 opacity-50" />
                  )}
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual">
              <div className="space-y-3">
                {/* SKU/Product Items List */}
                {ledger.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="flex items-end gap-2 p-3 border border-gray-200 rounded-md bg-gray-50"
                  >
                    <div className="flex-1">
                      <Combobox
                        isRequired
                        label={
                          ledger.itemSelectionType === "sku"
                            ? t("modal.create.sku", { ns: "ledger" })
                            : t("product", { ns: "assign-rfid" })
                        }
                        options={getAvailableItemOptions(
                          ledgerIndex,
                          itemIndex,
                        )}
                        placeholder={
                          isLoadingSku || isLoadingProduct
                            ? t("loading")
                            : ledger.itemSelectionType === "sku"
                              ? t("modal.create.selectSku", { ns: "ledger" })
                              : t("selectProduct")
                        }
                        value={item.sku_id}
                        onSelect={(value) =>
                          handleItemChange(
                            ledgerIndex,
                            itemIndex,
                            "sku_id",
                            value || "",
                          )
                        }
                      />
                    </div>
                    <div className="w-24">
                      <InputWithLabel
                        isRequired
                        disabled={
                          ledger.rfidType === RfidType.DISPOSABLE &&
                          ledger.rfidCategory === RfidCategory.SINGLE
                        }
                        label={t("modal.create.quantity", { ns: "ledger" })}
                        max={
                          ledger.rfidType === RfidType.DISPOSABLE &&
                          ledger.rfidCategory === RfidCategory.SINGLE
                            ? 1
                            : undefined
                        }
                        min="1"
                        type="number"
                        value={item.quantity || ""}
                        onChange={(e) =>
                          handleItemChange(
                            ledgerIndex,
                            itemIndex,
                            "quantity",
                            Number(e.target.value),
                          )
                        }
                      />
                    </div>
                    {ledger.items.length > 1 && (
                      <Button
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveItem(ledgerIndex, itemIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                {/* Add Item Button - disabled for DISPOSABLE + SINGLE */}
                {!(
                  ledger.rfidType === RfidType.DISPOSABLE &&
                  ledger.rfidCategory === RfidCategory.SINGLE
                ) && (
                  <div className="flex justify-end pt-2">
                    <Button
                      className="ml-auto w-fit"
                      size="sm"
                      type="button"
                      onClick={() => handleAddItem(ledgerIndex)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {t("modal.create.addItem", { ns: "ledger" })}
                    </Button>
                  </div>
                )}

                {/* Info for DISPOSABLE + SINGLE */}
                {ledger.rfidType === RfidType.DISPOSABLE &&
                  ledger.rfidCategory === RfidCategory.SINGLE && (
                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md text-sm text-blue-800 dark:text-blue-200">
                      ℹ️ {t("disposableSingleInfo")}
                    </div>
                  )}
              </div>

              {/* Save as packing collection */}
              {ledger.itemType === ItemType.PACKING && (
                <div className="mt-4 p-3 border rounded-md bg-gray-50 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={ledger.saveAsPackingCollection}
                      id={`save-as-packing-collection-${ledgerIndex}`}
                      onCheckedChange={(checked) =>
                        updateLedger(ledgerIndex, {
                          saveAsPackingCollection: checked as boolean,
                        })
                      }
                    />
                    <label
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      htmlFor={`save-as-packing-collection-${ledgerIndex}`}
                    >
                      {t("modal.create.saveAsPackingCollection", {
                        ns: "ledger",
                      })}
                    </label>
                  </div>

                  {ledger.saveAsPackingCollection && (
                    <div className="space-y-3 pl-6 border-l-2 border-blue-200">
                      <div className="text-sm font-medium text-gray-700">
                        {t("modal.create.packingCollectionDetails", {
                          ns: "ledger",
                        })}
                      </div>
                      <div className="space-y-2">
                        <InputWithLabel
                          isRequired
                          label={t("modal.create.packingCollectionName", {
                            ns: "ledger",
                          })}
                          placeholder={t(
                            "modal.create.packingCollectionNamePlaceholder",
                            { ns: "ledger" },
                          )}
                          value={ledger.packingCollectionName}
                          onChange={(e) =>
                            updateLedger(ledgerIndex, {
                              packingCollectionName: e.target.value,
                            })
                          }
                        />
                        <InputWithLabel
                          label={t(
                            "modal.create.packingCollectionDescription",
                            {
                              ns: "ledger",
                            },
                          )}
                          placeholder={t(
                            "modal.create.packingCollectionDescriptionPlaceholder",
                            { ns: "ledger" },
                          )}
                          value={ledger.packingCollectionDescription}
                          onChange={(e) =>
                            updateLedger(ledgerIndex, {
                              packingCollectionDescription: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="packing">
              <div className="space-y-4">
                <Combobox
                  label={t("modal.create.selectPackingCollection", {
                    ns: "ledger",
                  })}
                  options={packingCollectionOptions}
                  placeholder={
                    isLoadingPackingCollections
                      ? t("loading")
                      : packingCollections.length === 0
                        ? t("modal.create.noPackingCollections", {
                            ns: "ledger",
                          })
                        : t("modal.create.selectPackingCollection", {
                            ns: "ledger",
                          })
                  }
                  value={ledger.selectedPackingCollection?.id || ""}
                  onSelect={(value) =>
                    handlePackingCollectionSelect(ledgerIndex, value || "")
                  }
                />

                {ledger.selectedPackingCollection && (
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-gray-700">
                      {t("modal.create.packingItems", { ns: "ledger" })}:
                    </div>
                    <div className="space-y-3 max-h-[200px] overflow-y-auto">
                      {ledger.items.map((item, itemIndex) => {
                        const selectedSku = optionsSku.find(
                          (sku) => sku.value === item.sku_id,
                        );
                        return (
                          <div
                            key={itemIndex}
                            className="flex items-center gap-2 p-3 border border-gray-200 rounded-md bg-gray-100"
                          >
                            <div className="flex-1">
                              <label className="text-xs font-medium text-gray-600">
                                SKU
                              </label>
                              <div className="text-sm">
                                {selectedSku?.label ||
                                  t(
                                    "modal.create.autoFilledFromPackingCollection",
                                    {
                                      ns: "ledger",
                                    },
                                  )}
                              </div>
                            </div>
                            <div className="w-20 text-center">
                              <label className="text-xs font-medium text-gray-600">
                                Qty
                              </label>
                              <div className="text-sm font-medium">
                                {item.quantity}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-2">{t("description")}</p>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-250px)]">
        <div className="space-y-4 pr-4">
          {ledgers.map((ledger, index) => renderLedgerCard(ledger, index))}

          {/* Add New Ledger Button */}
          <div className="flex justify-end pt-2">
            <Button size="sm" onClick={handleAddNewLedger}>
              <Plus className="mr-2 h-5 w-5" />
              {t("addNewLedger")}
            </Button>
          </div>
        </div>
      </ScrollArea>

      {/* Action Buttons */}
      <div className="flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {ledgers.filter((l) => isLedgerValid(l)).length}/{ledgers.length}{" "}
            {t("ledgersValid")}
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetForm}>
            {t("reset")}
          </Button>
          <Button
            disabled={!areAllLedgersValid || isProcessing}
            onClick={handleSave}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("processing")}
              </>
            ) : (
              t("assignRfids", { count: ledgers.length })
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssignRfid;
