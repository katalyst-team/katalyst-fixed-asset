/* eslint-disable max-lines */
import { useQueryClient } from "@tanstack/react-query";
import { Ban, Loader2, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { InputWithLabel } from "@/components/shared/InputWithLabel";
import PackingCollectionSaveModal from "@/components/shared/PackingCollectionSaveModal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
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
import useGetRfidDataQuery from "@/hooks/api/rfid/useGetRfidDataQuery";
import { useGetSkuDataQuery } from "@/hooks/api/sku/useGetSKUDataQuery";
import useGetStatusLedgerDataQuery from "@/hooks/api/status/useGetLedgerStatusDataQuery";
import { toastError } from "@/services";
import { assignRfidItemService } from "@/services/ledger/assignRfidItemService";
import { updateLedgerItemService } from "@/services/ledger/updateLedgerItemService";
import { EnumLedgerStatus, ItemType } from "@/types/ledger";
import { PackingCollectionItemType } from "@/types/packing-collection";
import { RfidCategory, RfidStatus, RfidType } from "@/types/rfid";

interface LedgerItem {
  sku_id: string;
  quantity: number;
}

const LedgerModalAddReusableEpc = () => {
  const { t } = useTranslation("ledger");
  const { tokenPayload, selectedTeam } = useUser();
  const queryClient = useQueryClient();

  const { data, isLoading } = useGetSkuDataQuery({
    filters: {
      assigned_store_id: selectedTeam !== "0" ? selectedTeam : undefined,
    },
    organizationId: tokenPayload?.organization_id ?? "",
  });

  const {
    data: packingCollectionsData,
    isLoading: isLoadingPackingCollections,
  } = useGetPackingCollectionDataQuery({
    organizationId: tokenPayload?.organization_id ?? "",
  });

  const { mutateAsync } = useCreateLedgerItemMutation();
  const [open, setOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState<"manual" | "packing">(
    "manual"
  );
  const [items, setItems] = useState<LedgerItem[]>([
    { quantity: 1, sku_id: "" },
  ]);
  const [selectedPackingCollection, setSelectedPackingCollection] =
    useState<PackingCollectionItemType | null>(null);
  const [itemType, setItemType] = useState<ItemType>(ItemType.SINGLE);
  const [selectedRfidId, setSelectedRfidId] = useState<string>("");
  const [selectedEpc, setSelectedEpc] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showPackingCollectionSaveModal, setShowPackingCollectionSaveModal] =
    useState(false);
  const [isSavingToPackingCollection, setIsSavingToPackingCollection] =
    useState(false);
  const [saveAsPackingCollection, setSaveAsPackingCollection] = useState(false);

  const { mutateAsync: createPackingCollectionMutation } =
    useCreatePackingCollectionDataMutation({
      organizationId: tokenPayload?.organization_id || "",
    });

  // Auto-switch to manual selection when item type is SINGLE
  useEffect(() => {
    if (itemType === ItemType.SINGLE && selectionMode === "packing") {
      setSelectionMode("manual");
    }
  }, [itemType, selectionMode]);

  // Map ItemType to RfidCategory
  const getRfidCategory = (itemType: ItemType): RfidCategory => {
    return itemType === ItemType.SINGLE
      ? RfidCategory.SINGLE
      : RfidCategory.PACKAGE;
  };

  const { data: rfidData, isLoading: isLoadingRfid } = useGetRfidDataQuery({
    filters: {
      assigned_store_id: selectedTeam !== "0" ? selectedTeam : undefined,
      category: itemType ? getRfidCategory(itemType) : undefined,
      status: RfidStatus.ACTIVE,
      type: RfidType.REUSABLE,
    },
    organizationId: tokenPayload?.organization_id ?? "",
  });

  const optionsSku = useMemo(() => {
    if (!data) return [];
    const skus = data.data.skus || [];
    return skus.map((sku) => ({
      label: sku.name,
      value: sku.id,
    }));
  }, [data]);

  const packingCollections = useMemo(() => {
    return packingCollectionsData?.data?.packing_collections || [];
  }, [packingCollectionsData?.data?.packing_collections]);

  const packingCollectionOptions = useMemo(() => {
    return packingCollections.map((collection) => ({
      label: collection.name,
      value: collection.id,
    }));
  }, [packingCollections]);

  const optionsRfid = useMemo(() => {
    if (!rfidData) return [];
    const rfids = rfidData.data.rfids || [];
    return rfids.map((rfid) => ({
      epc: rfid.epc,
      label: `${rfid.name || "N/A"} (${rfid.epc})`,
      value: rfid.id,
    }));
  }, [rfidData]);

  const { data: statuses } = useGetStatusLedgerDataQuery({
    organizationId: tokenPayload?.organization_id ?? "",
  });

  const statusIdWaitingPrint = useMemo(() => {
    const availableStatuses = statuses?.data?.statuses || [];
    return availableStatuses.find(
      (status) => status.name === EnumLedgerStatus.WAITING_PRINT
    )?.id;
  }, [statuses]);

  const statusIdWaitingInbound = useMemo(() => {
    const availableStatuses = statuses?.data?.statuses || [];
    return availableStatuses.find(
      (status) => status.name === EnumLedgerStatus.WAITING_INBOUND
    )?.id;
  }, [statuses]);

  const handleAddItem = () => {
    setItems([...items, { quantity: 1, sku_id: "" }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
    }
  };

  const handleItemChange = (
    index: number,
    field: keyof LedgerItem,
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleRfidSelect = (value: string) => {
    setSelectedRfidId(value);
    const selectedRfid = optionsRfid.find((option) => option.value === value);
    if (selectedRfid) {
      setSelectedEpc(selectedRfid.epc);
    }
  };

  const handlePackingCollectionSelect = (collectionId: string) => {
    const collection = packingCollections.find((c) => c.id === collectionId);
    setSelectedPackingCollection(collection || null);

    if (collection) {
      // Auto-fill items from packing collection
      const autoFilledItems =
        collection.packing_items?.map((packingItem) => ({
          quantity: packingItem.quantity,
          sku_id: packingItem.sku_id.id,
        })) || [];

      setItems(
        autoFilledItems.length > 0
          ? autoFilledItems
          : [{ quantity: 1, sku_id: "" }]
      );
    } else {
      // Reset to default empty item
      setItems([{ quantity: 1, sku_id: "" }]);
    }
  };

  const isFormValid = useMemo(() => {
    if (selectionMode === "manual") {
      return (
        items.every((item) => item.sku_id && item.quantity > 0) &&
        itemType !== null &&
        itemType !== undefined &&
        selectedRfidId !== ""
      );
    } else {
      return (
        selectedPackingCollection !== null &&
        itemType !== null &&
        itemType !== undefined &&
        selectedRfidId !== ""
      );
    }
  }, [
    items,
    itemType,
    selectedRfidId,
    selectionMode,
    selectedPackingCollection,
  ]);

  const handleSave = async () => {
    // Check if user wants to save as packing collection first
    if (
      saveAsPackingCollection &&
      itemType === ItemType.PACKING &&
      selectionMode === "manual"
    ) {
      setShowPackingCollectionSaveModal(true);
      return;
    }

    // Regular save flow
    await proceedWithLedgerSave();
  };

  const proceedWithLedgerSave = async () => {
    setIsProcessing(true);
    try {
      // Step 1: Create the ledger items
      const createResult = await mutateAsync({
        organizationId: tokenPayload?.organization_id ?? "",
        params: {
          items: items.map((item) => ({
            ...item,
            status_id: statusIdWaitingPrint as EnumLedgerStatus,
          })),
          type: itemType,
        },
        storeId: selectedTeam ?? "",
      });

      // Step 2: Process each created item using returned IDs
      const errors: string[] = [];
      let successCount = 0;
      const createdItemIds = createResult.data.ids || [];

      // Create expanded items array to properly map IDs to SKU_IDs
      const expandedItems: Array<{ sku_id: string }> = [];
      items.forEach((item) => {
        // Add one entry for each quantity
        for (let i = 0; i < item.quantity; i++) {
          expandedItems.push({ sku_id: item.sku_id });
        }
      });

      for (const [index, itemId] of createdItemIds.entries()) {
        try {
          // Step 2a: Update item status to WAITING_INBOUND
          await updateLedgerItemService({
            itemId,
            organizationId: tokenPayload?.organization_id ?? "",
            params: {
              epc: selectedEpc,
              sku_id: expandedItems[index]?.sku_id || "",
              status_id: statusIdWaitingInbound as EnumLedgerStatus,
            },
            storeId: selectedTeam ?? "",
          });

          // Step 2b: Assign RFID to item
          await assignRfidItemService({
            itemId,
            organizationId: tokenPayload?.organization_id ?? "",
            params: {
              action: "ADD",
              epc: selectedEpc,
            },
            storeId: selectedTeam ?? "",
          });

          successCount++;
        } catch (error: unknown) {
          console.error(`Error processing item ${index + 1}:`, error);
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          errors.push(`Item ${index + 1}: ${errorMessage}`);
        }
      }

      // Show success message with error details if any
      if (successCount > 0) {
        const successMessage =
          t("modal.create.success") +
          ` (${successCount}/${createdItemIds.length} items processed)`;
        if (errors.length > 0) {
          toast.success(successMessage);
          toast.error(`Errors: ${errors.join(", ")}`);
        } else {
          toast.success(successMessage);
        }
      } else if (errors.length > 0) {
        toast.error(`All items failed: ${errors.join(", ")}`);
      }

      // Reset form and close modal
      setOpen(false);
      setItems([{ quantity: 1, sku_id: "" }]);
      setSelectedPackingCollection(null);
      setItemType(ItemType.SINGLE);
      setSelectedRfidId("");
      setSelectedEpc("");
      setSelectionMode("manual");
      setSaveAsPackingCollection(false);

      // Invalidate queries to refresh the ledger list
      queryClient.invalidateQueries({
        queryKey: ["stockMovementData"],
      });
      queryClient.invalidateQueries({
        queryKey: ["ledgerData"],
      });
    } catch (error) {
      console.error("Error creating ledger:", error);
      toastError(error as Error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={"sm"}>{t("buttons.addLedger")}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("modal.create.title")} - Reusable EPC</DialogTitle>
          <DialogDescription>{t("modal.create.description")}</DialogDescription>
          <div className="flex py-4 flex-col w-full gap-4">
            {/* Item Type Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">
                {t("modal.create.itemType")}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <Select
                value={itemType}
                onValueChange={(value) => setItemType(value as ItemType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("modal.create.selectItemType")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ItemType.SINGLE}>
                    {t("modal.create.itemTypes.single")}
                  </SelectItem>
                  <SelectItem value={ItemType.PACKING}>
                    {t("modal.create.itemTypes.packing")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* RFID/EPC Selection */}
            <Combobox
              isRequired
              disabled={!itemType}
              label="RFID/EPC (Reusable)"
              options={optionsRfid}
              placeholder={
                !itemType
                  ? "Select item type first"
                  : isLoadingRfid
                    ? t("loading")
                    : "Select RFID/EPC"
              }
              onSelect={(value) => handleRfidSelect(value || "")}
            />

            {/* Selection Mode Tabs */}
            <div className="grid gap-2">
              <Label>{t("modal.create.selectionMode")}</Label>
              <Tabs
                value={selectionMode}
                onValueChange={(value) =>
                  setSelectionMode(value as "manual" | "packing")
                }
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="manual">
                    {t("modal.create.manualSelection")}
                  </TabsTrigger>
                  <TabsTrigger disabled={itemType === ItemType.SINGLE} value="packing">
                    <span className="flex items-center gap-2">
                      {t("modal.create.packingCollection")}
                      {itemType === ItemType.SINGLE && (
                        <Ban className="h-4 w-4 opacity-50" />
                      )}
                    </span>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="manual">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col gap-2 border p-4 rounded-md"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium">
                          {t("modal.create.item")} {index + 1}
                        </h4>
                        {items.length > 1 && (
                          <Button
                            className="h-8 w-8 p-0"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {/* Desktop: Inline layout, Mobile: Stacked layout */}
                      <div className="flex flex-col md:flex-row md:gap-4 gap-2">
                        <div className="md:w-4/5">
                          <Combobox
                            isRequired
                            label="SKU"
                            options={optionsSku}
                            placeholder={
                              isLoading
                                ? t("loading")
                                : t("modal.create.selectSku")
                            }
                            onSelect={(value) =>
                              handleItemChange(index, "sku_id", value || "")
                            }
                          />
                        </div>
                        <div className="md:w-1/5">
                          <InputWithLabel
                            isRequired
                            label={t("modal.create.quantity")}
                            type="number"
                            value={item.quantity || ""}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "quantity",
                                Number(e.target.value)
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    className="mt-2"
                    type="button"
                    variant="outline"
                    onClick={handleAddItem}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t("modal.create.addItem")}
                  </Button>

                  {/* Checkbox to save as packing collection - only show when itemType is PACKING */}
                  {itemType === ItemType.PACKING && (
                    <div className="flex items-center space-x-2 mt-4 p-3 border rounded-md bg-muted">
                      <Checkbox
                        checked={saveAsPackingCollection}
                        id="save-as-packing-collection-reusable"
                        onCheckedChange={(checked) =>
                          setSaveAsPackingCollection(checked as boolean)
                        }
                      />
                      <label
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        htmlFor="save-as-packing-collection-reusable"
                      >
                        Save as packing collection
                      </label>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="packing">
                  <div className="space-y-4">
                    {/* Packing Collection Selection */}
                    <Combobox
                      label={t("modal.create.selectPackingCollection")}
                      options={packingCollectionOptions}
                      placeholder={
                        isLoadingPackingCollections
                          ? t("loading")
                          : packingCollections.length === 0
                            ? t("modal.create.noPackingCollections")
                            : t("modal.create.selectPackingCollection")
                      }
                      value={selectedPackingCollection?.id || ""}
                      onSelect={(value) =>
                        handlePackingCollectionSelect(value || "")
                      }
                    />

                    {/* Auto-filled Items Display */}
                    {selectedPackingCollection && (
                      <div className="space-y-4">
                        <div className="text-sm font-medium text-muted-foreground">
                          {t("modal.create.packingItems")}:
                        </div>
                        <ScrollArea className="h-[300px] w-full">
                          <div className="space-y-4 pr-4">
                            {items.map((item, index) => {
                              const selectedSku = optionsSku.find(
                                (sku) => sku.value === item.sku_id
                              );
                              return (
                                <div
                                  key={index}
                                  className="flex flex-col gap-2 border p-4 rounded-md bg-muted"
                                >
                                  <div className="flex justify-between items-center">
                                    <h4 className="text-sm font-medium">
                                      {t("modal.create.item")} {index + 1}
                                    </h4>
                                  </div>
                                  {/* Desktop: Inline layout, Mobile: Stacked layout */}
                                  <div className="flex flex-col md:flex-row md:gap-4 gap-2">
                                    <div className="flex flex-col gap-2 md:w-4/5">
                                      <label className="text-sm font-medium">
                                        SKU
                                      </label>
                                      <input
                                        disabled
                                        readOnly
                                        className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={
                                          selectedSku?.label ||
                                          "Auto-filled from packing collection"
                                        }
                                      />
                                    </div>
                                    <div className="flex flex-col gap-2 md:w-1/5">
                                      <label className="text-sm font-medium">
                                        {t("modal.create.quantity")}
                                      </label>
                                      <input
                                        disabled
                                        readOnly
                                        className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        type="number"
                                        value={item.quantity || ""}
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <DialogFooter>
            <Button
              disabled={
                !isFormValid || isProcessing || isSavingToPackingCollection
              }
              type="button"
              onClick={handleSave}
            >
              {isProcessing || isSavingToPackingCollection ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSavingToPackingCollection
                    ? "Creating Collection..."
                    : t("modal.create.saving")}
                </>
              ) : (
                t("modal.create.save")
              )}
            </Button>
          </DialogFooter>
        </DialogHeader>
      </DialogContent>

      {/* Packing Collection Save Modal */}
      <PackingCollectionSaveModal
        open={showPackingCollectionSaveModal}
        onOpenChange={setShowPackingCollectionSaveModal}
        onSave={async (data: { name: string; description?: string }) => {
          try {
            setIsSavingToPackingCollection(true);

            // Create packing collection with selected items
            const packingCollectionPayload = {
              description: data.description || "",
              name: data.name,
              packing_items: items.map((item) => ({
                quantity: item.quantity,
                sku_id: item.sku_id,
              })),
            };

            await createPackingCollectionMutation(packingCollectionPayload);

            // Invalidate and refetch packing collection queries
            await queryClient.invalidateQueries({
              queryKey: KEY_USE_GET_PACKING_COLLECTION_DATA(
                tokenPayload?.organization_id || ""
              ),
            });

            // Wait for the query to refetch and get the updated data
            await queryClient.refetchQueries({
              queryKey: KEY_USE_GET_PACKING_COLLECTION_DATA(
                tokenPayload?.organization_id || ""
              ),
            });

            toast.success("Packing collection created successfully!");
            setShowPackingCollectionSaveModal(false);

            // Now proceed with the ledger save and close the modal
            await proceedWithLedgerSave();
          } catch (error) {
            toastError(error as Error);
          } finally {
            setIsSavingToPackingCollection(false);
          }
        }}
      />
    </Dialog>
  );
};

export default LedgerModalAddReusableEpc;
