/* eslint-disable max-lines */
import { useQueryClient } from "@tanstack/react-query";
import { Ban, Layers, Loader2, Plus, Trash2, X } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

import { InputWithLabel } from "@/components/shared/InputWithLabel";
import { Badge } from "@/components/ui/badge";
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
import {
  AssignStatus,
  useGetProductDataQuery,
} from "@/hooks/api/product/useGetProductDataQuery";
import { useGetSkuDataQuery } from "@/hooks/api/sku/useGetSKUDataQuery";
import useGetStatusLedgerDataQuery from "@/hooks/api/status/useGetLedgerStatusDataQuery";
import {
  CreateLedgerItemParams,
  EnumLedgerStatus,
  ItemType,
} from "@/types/ledger";
import { PackingCollectionItemType } from "@/types/packing-collection";
import { SkuType } from "@/types/sku";

import { formatSkuOptionLabel } from "./utils/formatSkuOptionLabel";

interface LedgerItem {
  sku_id: string;
  quantity: number;
}

interface MultiLedger {
  id: string;
  itemType: ItemType;
  itemSelectionType: "sku" | "product";
  items: LedgerItem[];
  packingCollectionDescription: string;
  packingCollectionName: string;
  saveAsPackingCollection: boolean;
  selectedPackingCollection: PackingCollectionItemType | null;
  selectionMode: "manual" | "packing";
  unit: number;
}

const LedgerModalAddLedgerV2 = () => {
  const { t } = useTranslation("ledger");
  const { tokenPayload, selectedTeam } = useUser();
  const queryClient = useQueryClient();

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

  const { mutateAsync, isPending } = useCreateLedgerItemMutation();
  const [open, setOpen] = useState(false);
  const [ledgers, setLedgers] = useState<MultiLedger[]>([
    {
      id: uuidv4(),
      itemSelectionType: "sku",
      itemType: ItemType.SINGLE,
      items: [{ quantity: 1, sku_id: "" }],
      packingCollectionDescription: "",
      packingCollectionName: "",
      saveAsPackingCollection: false,
      selectedPackingCollection: null,
      selectionMode: "manual",
      unit: 1,
    },
  ]);
  const [isSavingToPackingCollection] = useState(false);
  const [isProcessingLedgers, setIsProcessingLedgers] = useState(false);

  const { mutateAsync: createPackingCollectionMutation } =
    useCreatePackingCollectionDataMutation({
      organizationId: tokenPayload?.organization_id || "",
    });

  // Auto-switch to manual selection when item type is SINGLE for any ledger
  useEffect(() => {
    ledgers.forEach((ledger, index) => {
      if (
        ledger.itemType === ItemType.SINGLE &&
        ledger.selectionMode === "packing"
      ) {
        updateLedger(index, { selectionMode: "manual" });
      }
    });
  }, [ledgers]);

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

  const { data: statuses } = useGetStatusLedgerDataQuery({
    organizationId: tokenPayload?.organization_id ?? "",
  });

  const statusIdWaitingPrint = useMemo(() => {
    const statusList = statuses?.data?.statuses || [];
    return statusList.find(
      (status) => status.name === EnumLedgerStatus.WAITING_PRINT,
    )?.id;
  }, [statuses]);

  const updateLedger = (index: number, updates: Partial<MultiLedger>) => {
    setLedgers((prev) =>
      prev.map((ledger, i) =>
        i === index ? { ...ledger, ...updates } : ledger,
      ),
    );
  };

  const handleAddNewLedger = () => {
    const newLedger: MultiLedger = {
      id: uuidv4(),
      itemSelectionType: "sku",
      itemType: ItemType.SINGLE,
      items: [{ quantity: 1, sku_id: "" }],
      packingCollectionDescription: "",
      packingCollectionName: "",
      saveAsPackingCollection: false,
      selectedPackingCollection: null,
      selectionMode: "manual",
      unit: 1,
    };
    setLedgers((prev) => [...prev, newLedger]);
  };

  const handleRemoveLedger = (index: number) => {
    if (ledgers.length > 1) {
      setLedgers((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleAddItem = (ledgerIndex: number) => {
    const updatedItems = [
      ...ledgers[ledgerIndex].items,
      { quantity: 1, sku_id: "" },
    ];
    updateLedger(ledgerIndex, { items: updatedItems });
  };

  const handleRemoveItem = (ledgerIndex: number, itemIndex: number) => {
    if (ledgers[ledgerIndex].items.length > 1) {
      const updatedItems = ledgers[ledgerIndex].items.filter(
        (_, i) => i !== itemIndex,
      );
      updateLedger(ledgerIndex, { items: updatedItems });
    }
  };

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

  const handlePackingCollectionSelect = (
    ledgerIndex: number,
    collectionId: string,
  ) => {
    const collection = packingCollections.find((c) => c.id === collectionId);
    const selectedPackingCollection = collection || null;

    let updatedItems: LedgerItem[];
    if (collection) {
      // Auto-fill items from packing collection
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
      // Reset to default empty item
      updatedItems = [{ quantity: 1, sku_id: "" }];
    }

    updateLedger(ledgerIndex, {
      items: updatedItems,
      selectedPackingCollection,
    });
  };

  const isLedgerValid = (ledger: MultiLedger) => {
    const baseValidation =
      ledger.itemType !== null &&
      ledger.itemType !== undefined &&
      ledger.unit > 0;

    if (ledger.selectionMode === "manual") {
      const itemsValid = ledger.items.every(
        (item) => item.sku_id && item.quantity > 0,
      );
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

  const handleSave = async () => {
    setIsProcessingLedgers(true);
    const totalLedgersToCreate = ledgers.reduce(
      (acc, ledger) => acc + ledger.unit,
      0,
    );

    try {
      // Create all ledger creation promises
      const ledgerPromises: Promise<void>[] = [];

      for (let i = 0; i < ledgers.length; i++) {
        const ledger = ledgers[i];

        for (let j = 0; j < ledger.unit; j++) {
          const ledgerPromise = (async () => {
            // Check if user wants to save as packing collection first
            if (
              ledger.saveAsPackingCollection &&
              ledger.itemType === ItemType.PACKING &&
              ledger.selectionMode === "manual"
            ) {
              // Create packing collection first, then proceed with ledger save
              const packingCollectionPayload = {
                description: ledger.packingCollectionDescription || "",
                name: ledger.packingCollectionName,
                packing_items: ledger.items.map((item) => ({
                  quantity: item.quantity,
                  sku_id: item.sku_id,
                })),
              };

              await createPackingCollectionMutation(packingCollectionPayload);

              // Invalidate and refetch packing collection queries
              await queryClient.invalidateQueries({
                queryKey: KEY_USE_GET_PACKING_COLLECTION_DATA(
                  tokenPayload?.organization_id || "",
                ),
              });

              toast.success(
                t("modal.create.packingCollectionCreatedSuccessfully"),
              );
            }

            // Regular save flow for this ledger
            await proceedWithLedgerSave(ledger, i + 1);
          })();

          ledgerPromises.push(ledgerPromise);
        }
      }

      // Execute all ledger creations in parallel
      const results = await Promise.allSettled(ledgerPromises);

      // Count successes and failures
      const successCount = results.filter(
        (result) => result.status === "fulfilled",
      ).length;
      const failureCount = results.filter(
        (result) => result.status === "rejected",
      ).length;

      // Handle failed promises and show error messages
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          const ledgerIndex =
            Math.floor(index / Math.max(...ledgers.map((l) => l.unit))) + 1;
          const unitIndex =
            (index % Math.max(...ledgers.map((l) => l.unit))) + 1;
          console.error(
            `Error processing ledger ${ledgerIndex} (unit ${unitIndex}):`,
            result.reason,
          );
          toast.error(
            `Ledger ${ledgerIndex} (unit ${unitIndex}) failed: ${
              result.reason instanceof Error
                ? result.reason.message
                : t("modal.create.unknownError")
            }`,
          );
        }
      });

      // Show final result
      if (successCount === totalLedgersToCreate) {
        toast.success(
          `All ${totalLedgersToCreate} ledgers created successfully!`,
        );
      } else if (successCount > 0) {
        toast.success(
          `${successCount}/${totalLedgersToCreate} ledgers created successfully`,
        );
        if (failureCount > 0) {
          toast.error(`${failureCount} ledgers failed to create`);
        }
      } else {
        toast.error("All ledger creations failed");
      }

      // Reset form if all succeeded
      if (successCount === totalLedgersToCreate) {
        // Invalidate stock movement data queries to refetch the ledger list
        await queryClient.invalidateQueries({
          queryKey: [
            "stockMovementData",
            tokenPayload?.organization_id,
            selectedTeam,
          ],
        });

        setOpen(false);
        resetForm();
      }
    } finally {
      setIsProcessingLedgers(false);
    }
  };

  const proceedWithLedgerSave = async (
    ledger: MultiLedger,
    // eslint-disable-next-line no-unused-vars
    _ledgerNumber: number,
  ) => {
    const itemsToCreate = ledger.items.map((item) => ({
      quantity: item.quantity,
      sku_id: item.sku_id,
      status_id: statusIdWaitingPrint as EnumLedgerStatus,
    }));

    const params: CreateLedgerItemParams = {
      items: itemsToCreate,
      type: ledger.itemType,
    };

    if (
      ledger.selectionMode === "packing" &&
      ledger.selectedPackingCollection?.id
    ) {
      params.packing_collection_id = ledger.selectedPackingCollection.id;
    }

    await mutateAsync({
      organizationId: tokenPayload?.organization_id ?? "",
      params,
      storeId: selectedTeam ?? "",
    });
  };

  const resetForm = () => {
    setLedgers([
      {
        id: uuidv4(),
        itemSelectionType: "sku",
        itemType: ItemType.SINGLE,
        items: [{ quantity: 1, sku_id: "" }],
        packingCollectionDescription: "",
        packingCollectionName: "",
        saveAsPackingCollection: false,
        selectedPackingCollection: null,
        selectionMode: "manual",
        unit: 1,
      },
    ]);
  };

  const getLedgerValidationIcon = (ledger: MultiLedger) => {
    return isLedgerValid(ledger) ? "✓" : "!";
  };

  const renderLedgerCard = (ledger: MultiLedger, ledgerIndex: number) => (
    <div className="border rounded-lg p-4 bg-card shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Ledger {ledgerIndex + 1}</h3>
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

      <div className="space-y-4">
        {/* Item Type Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">
            {t("modal.create.itemType")}
            <span className="text-red-500 ml-1">*</span>
          </label>
          <Select
            value={ledger.itemType}
            onValueChange={(value) =>
              updateLedger(ledgerIndex, { itemType: value as ItemType })
            }
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

        {/* Item Selection Type (SKU/Product) */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">
            {t("modal.create.itemSelectionType", "Item Selection Type")}
            <span className="text-red-500 ml-1">*</span>
          </label>
          <Select
            value={ledger.itemSelectionType}
            onValueChange={(value: "sku" | "product") => {
              updateLedger(ledgerIndex, {
                itemSelectionType: value,
                items: [{ quantity: 1, sku_id: "" }],
              });
            }}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={t(
                  "modal.create.selectItemSelectionType",
                  "Select type",
                )}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sku">
                {t("modal.create.itemSelectionTypes.sku", "SKU (Common)")}
              </SelectItem>
              <SelectItem value="product">
                {t(
                  "modal.create.itemSelectionTypes.product",
                  "Product (Unique)",
                )}
              </SelectItem>
            </SelectContent>
          </Select>
          {ledger.itemSelectionType === "product" && (
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md text-sm text-blue-800 dark:text-blue-200">
              ℹ️{" "}
              {t(
                "modal.create.productTypeInfo",
                "Product type: Each product can only have quantity of 1",
              )}
            </div>
          )}
        </div>

        {/* Unit Input - only show for PACKING items */}
        {ledger.itemType === ItemType.PACKING && (
          <div className="flex flex-col gap-2">
            <InputWithLabel
              isRequired
              label={t("modal.create.unit")}
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
        <div className="grid gap-2">
          <Label>{t("modal.create.selectionMode")}</Label>
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
                {t("modal.create.manualSelection")}
              </TabsTrigger>
              <TabsTrigger
                disabled={ledger.itemType === ItemType.SINGLE}
                value="packing"
              >
                <span className="flex items-center gap-2">
                  {t("modal.create.packingCollection")}
                  {ledger.itemType === ItemType.SINGLE && (
                    <Ban className="h-4 w-4 opacity-50" />
                  )}
                </span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="manual">
              <div className="space-y-3">
                {/* SKU Items List */}
                {ledger.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="flex items-end gap-2 p-3 border rounded-md bg-muted"
                  >
                    <div className="flex-1">
                      <Combobox
                        isRequired
                        label={
                          ledger.itemSelectionType === "sku"
                            ? t("modal.create.sku")
                            : t("modal.create.product", "Product")
                        }
                        options={
                          ledger.itemSelectionType === "sku"
                            ? optionsSku
                            : optionsProduct
                        }
                        placeholder={
                          (
                            ledger.itemSelectionType === "sku"
                              ? isLoadingSku
                              : isLoadingProduct
                          )
                            ? t("loading")
                            : ledger.itemSelectionType === "sku"
                              ? t("modal.create.selectSku")
                              : t(
                                  "modal.create.selectProduct",
                                  "Select product",
                                )
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
                        disabled={ledger.itemSelectionType === "product"}
                        label={t("modal.create.quantity")}
                        max={
                          ledger.itemSelectionType === "product" ? 1 : undefined
                        }
                        min="1"
                        type="number"
                        value={item.quantity || ""}
                        onChange={(e) =>
                          handleItemChange(
                            ledgerIndex,
                            itemIndex,
                            "quantity",
                            ledger.itemSelectionType === "product"
                              ? 1
                              : Number(e.target.value),
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

                {/* Add Item Button */}
                <div className="flex justify-end pt-2">
                  <Button
                    className="ml-auto w-fit"
                    size={"sm"}
                    type="button"
                    onClick={() => handleAddItem(ledgerIndex)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t("modal.create.addItem")}
                  </Button>
                </div>
              </div>

              {/* Checkbox to save as packing collection - only show when itemType is PACKING */}
              {ledger.itemType === ItemType.PACKING && (
                <div className="mt-4 p-3 border rounded-md bg-muted space-y-3">
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
                      {t("modal.create.saveAsPackingCollection")}
                    </label>
                  </div>

                  {/* Inline packing collection inputs */}
                  {ledger.saveAsPackingCollection && (
                    <div className="space-y-3 pl-6 border-l-2 border-blue-200">
                      <div className="text-sm font-medium text-muted-foreground">
                        {t("modal.create.packingCollectionDetails")}
                      </div>
                      <div className="space-y-2">
                        <InputWithLabel
                          isRequired
                          label={t("modal.create.packingCollectionName")}
                          placeholder={t(
                            "modal.create.packingCollectionNamePlaceholder",
                          )}
                          value={ledger.packingCollectionName}
                          onChange={(e) =>
                            updateLedger(ledgerIndex, {
                              packingCollectionName: e.target.value,
                            })
                          }
                        />
                        <InputWithLabel
                          label={t("modal.create.packingCollectionDescription")}
                          placeholder={t(
                            "modal.create.packingCollectionDescriptionPlaceholder",
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
                  value={ledger.selectedPackingCollection?.id || ""}
                  onSelect={(value) =>
                    handlePackingCollectionSelect(ledgerIndex, value || "")
                  }
                />

                {/* Auto-filled Items Display */}
                {ledger.selectedPackingCollection && (
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-muted-foreground">
                      {t("modal.create.packingItems")}:
                    </div>
                    <div className="space-y-3 max-h-[200px] overflow-y-auto">
                      {ledger.items.map((item, itemIndex) => {
                        const selectedSku = optionsSku.find(
                          (sku) => sku.value === item.sku_id,
                        );
                        return (
                          <div
                            key={itemIndex}
                            className="flex items-center gap-2 p-3 border rounded-md bg-muted"
                          >
                            <div className="flex-1">
                              <label className="text-xs font-medium text-muted-foreground">
                                SKU
                              </label>
                              <div className="text-sm">
                                {selectedSku?.label ||
                                  t(
                                    "modal.create.autoFilledFromPackingCollection",
                                  )}
                              </div>
                            </div>
                            <div className="w-20 text-center">
                              <label className="text-xs font-medium text-muted-foreground">
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
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={"sm"}>
          <Layers className="mr-2 h-4 w-4" />
          {t("buttons.addLedger")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{t("modal.create.title")} - Multi-Ledger</DialogTitle>
          <DialogDescription>{t("modal.create.description")}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] w-full pr-4">
          <div className="space-y-4">
            {/* Render all ledgers as cards */}
            {ledgers.map((ledger, index) => (
              <div key={ledger.id}>{renderLedgerCard(ledger, index)}</div>
            ))}

            {/* Add New Ledger Button */}
            <div className="flex justify-end pt-2">
              <Button size={"sm"} onClick={handleAddNewLedger}>
                <Plus className="mr-2 h-5 w-5" />
                {t("modal.create.addNewLedger")}
              </Button>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {ledgers.filter((l) => isLedgerValid(l)).length}/{ledgers.length}{" "}
              {t("modal.create.ledgersValid")}
            </span>
            <Button
              disabled={
                !areAllLedgersValid ||
                isPending ||
                isSavingToPackingCollection ||
                isProcessingLedgers
              }
              type="button"
              onClick={handleSave}
            >
              {isPending ||
              isSavingToPackingCollection ||
              isProcessingLedgers ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSavingToPackingCollection
                    ? t("modal.create.creatingCollection")
                    : isProcessingLedgers
                      ? t("modal.create.processingLedgers")
                      : t("modal.create.saving")}
                </>
              ) : (
                t("modal.create.createLedgers", { count: ledgers.length })
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LedgerModalAddLedgerV2;
