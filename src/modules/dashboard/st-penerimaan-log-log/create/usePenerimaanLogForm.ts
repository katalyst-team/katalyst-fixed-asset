import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useUser } from "@/context/user-context";
import useGetCategoryDataQuery from "@/hooks/api/category/useGetCategoryDataQuery";
import useGetSubcategoriesQuery from "@/hooks/api/category/useGetSubcategoriesQuery";
import { useGetProductDataQuery } from "@/hooks/api/product/useGetProductDataQuery";
import useCreateStockMovementWithItemsMutation from "@/hooks/api/stockMovement/useCreateStockMovementWithItemsMutation";
import useGetNextReferenceNumberQuery from "@/hooks/api/stockMovement/useGetNextReferenceNumberQuery";
import useGetStockMovementTypesQuery from "@/hooks/api/stockMovement/useGetStockMovementTypesQuery";
import useGetStoreDataQuery from "@/hooks/api/store/useGetStoreDataQuery";
import {
  StockMovementType,
  StockMovementTypeNameEnum,
} from "@/services/stockMovement/getStockMovementDataService";
import { CategoryItemType } from "@/types/category";
import { SkuItemType } from "@/types/sku";
import { convertToTitleCase } from "@/utils/text";

export interface ItemRow {
  epc: string;
  id: string;
  quantity: number;
  skuId: string;
  skuName: string;
}

export function usePenerimaanLogForm() {
  const { tokenPayload } = useUser();
  const queryClient = useQueryClient();
  const organizationId = tokenPayload?.organization_id ?? "";

  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [selectedStockMovementTypeId, setSelectedStockMovementTypeId] =
    useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [note, setNote] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const [selectedParentCategoryId, setSelectedParentCategoryId] = useState("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");
  const [selectedSkuId, setSelectedSkuId] = useState("");
  const [itemRows, setItemRows] = useState<ItemRow[]>([]);
  const [epcInput, setEpcInput] = useState("");

  const { data: storeData, isLoading: isLoadingStores } = useGetStoreDataQuery(
    { filters: { limit: 1000 }, organizationId },
  );

  const { data: stockMovementTypes, isLoading: isLoadingStockMovementTypes } =
    useGetStockMovementTypesQuery({ organizationId });

  const { data: nextRefData } = useGetNextReferenceNumberQuery({
    enabled: Boolean(selectedStoreId),
    organizationId,
    storeId: selectedStoreId,
  });

  useEffect(() => {
    if (nextRefData?.reference_number && !referenceNumber) {
      setReferenceNumber(nextRefData.reference_number);
    }
  }, [nextRefData, referenceNumber]);

  const { data: categoryData } = useGetCategoryDataQuery({ organizationId });

  const parentCategories = useMemo(
    () =>
      (categoryData?.data?.categories ?? []).filter(
        (c: CategoryItemType) =>
          c.has_subcategories &&
          c.name.toUpperCase().startsWith("KAYU BULAT"),
      ),
    [categoryData],
  );

  const { data: subcategoryData } = useGetSubcategoriesQuery({
    categoryId: selectedParentCategoryId,
    organizationId,
  });

  const subcategories = useMemo(
    () => subcategoryData?.data?.subcategories ?? [],
    [subcategoryData],
  );

  const { data: skuData } = useGetProductDataQuery({
    enabled: Boolean(selectedSubcategoryId),
    filters: { category_ids: [selectedSubcategoryId] },
    organizationId,
  });

  const skus = useMemo(() => skuData?.data?.skus ?? [], [skuData]);

  const penerimaanLogTypeId = useMemo(() => {
    const found = (stockMovementTypes ?? []).find(
      (t: StockMovementType) =>
        t.name === StockMovementTypeNameEnum.PENERIMAAN_LOG_INBOUND,
    );
    return found?.id ?? "";
  }, [stockMovementTypes]);

  useEffect(() => {
    if (penerimaanLogTypeId && !selectedStockMovementTypeId) {
      setSelectedStockMovementTypeId(penerimaanLogTypeId);
    }
  }, [penerimaanLogTypeId, selectedStockMovementTypeId]);

  useEffect(() => {
    setSelectedSubcategoryId("");
    setSelectedSkuId("");
  }, [selectedParentCategoryId]);

  useEffect(() => {
    setSelectedSkuId("");
  }, [selectedSubcategoryId]);

  const storeOptions = useMemo(
    () =>
      (storeData?.data?.stores ?? []).map((s) => ({
        label: s.name,
        value: s.id,
      })),
    [storeData],
  );

  const stockMovementTypeOptions = useMemo(() => {
    if (!stockMovementTypes) return [];
    return stockMovementTypes
      .filter((t: StockMovementType) => t.direction === "INBOUND")
      .map((t: StockMovementType) => ({
        label: convertToTitleCase(t.name),
        value: t.id,
      }));
  }, [stockMovementTypes]);

  const parentCategoryOptions = useMemo(
    () =>
      parentCategories.map((c: CategoryItemType) => ({
        label: c.name,
        value: c.id,
      })),
    [parentCategories],
  );

  const subcategoryOptions = useMemo(
    () =>
      subcategories.map((c: CategoryItemType) => ({
        label: c.name,
        value: c.id,
      })),
    [subcategories],
  );

  const skuOptions = useMemo(
    () =>
      skus.map((s: SkuItemType) => ({
        label: `${s.name} (${s.internal_code || s.sku})`,
        value: s.id,
      })),
    [skus],
  );

  const { mutateAsync: createStockMovementWithItems, isPending: isCreating } =
    useCreateStockMovementWithItemsMutation();

  const isSubmitting = isCreating;

  const isFormValid = useMemo(
    () =>
      Boolean(selectedStoreId) &&
      Boolean(selectedStockMovementTypeId) &&
      itemRows.length > 0 &&
      itemRows.every((r) => Boolean(r.skuId) && r.quantity > 0),
    [selectedStoreId, selectedStockMovementTypeId, itemRows],
  );

  const handleAddItem = useCallback(() => {
    const sku = skus.find((s: SkuItemType) => s.id === selectedSkuId);
    if (!sku) return;
    const newRow: ItemRow = {
      epc: epcInput.trim(),
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      quantity: 1,
      skuId: sku.id,
      skuName: sku.name,
    };
    setItemRows((prev) => [...prev, newRow]);
    setEpcInput("");
  }, [selectedSkuId, skus, epcInput]);

  const handleRemoveItem = useCallback((id: string) => {
    setItemRows((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const handleItemEpcChange = useCallback((id: string, epc: string) => {
    setItemRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, epc } : r)),
    );
  }, []);

  const handleSubmit = async () => {
    if (!isFormValid) {
      toast.error("Lengkapi semua field yang wajib diisi");
      return false;
    }

    try {
      const items = itemRows.flatMap((row) => {
        const entries = [];
        for (let i = 0; i < row.quantity; i++) {
          entries.push({
            category_ids: selectedSubcategoryId ? [selectedSubcategoryId] : undefined,
            epc: i === 0 && row.epc ? row.epc : "",
            name: row.skuName || undefined,
          });
        }
        return entries;
      });

      await createStockMovementWithItems({
        data: {
          image_urls: imageUrls,
          items,
          note: note || undefined,
          reference_number: referenceNumber || undefined,
          stock_movement_type_id: selectedStockMovementTypeId,
        },
        organizationId,
        storeId: selectedStoreId,
      });

      queryClient.invalidateQueries({ queryKey: ["stockMovementData"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });

      toast.success("Penerimaan log berhasil dibuat");
      return true;
    } catch (error) {
      console.error("Create penerimaan log error:", error);
      return false;
    }
  };

  return {
    epcInput,
    handleAddItem,
    handleItemEpcChange,
    handleRemoveItem,
    handleSubmit,
    imageUrls,
    isFormValid,
    isLoadingStockMovementTypes,
    isLoadingStores,
    isSubmitting,
    itemRows,
    note,
    parentCategoryOptions,
    referenceNumber,
    selectedParentCategoryId,
    selectedSkuId,
    selectedStockMovementTypeId,
    selectedStoreId,
    selectedSubcategoryId,
    setEpcInput,
    setImageUrls,
    setNote,
    setReferenceNumber,
    setSelectedParentCategoryId,
    setSelectedSkuId,
    setSelectedStockMovementTypeId,
    setSelectedStoreId,
    setSelectedSubcategoryId,
    skuOptions,
    stockMovementTypeOptions,
    storeOptions,
    subcategoryOptions,
  };
}
