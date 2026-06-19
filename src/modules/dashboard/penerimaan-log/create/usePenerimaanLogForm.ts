import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useUser } from "@/context/user-context";
import useGetCategoryDataQuery from "@/hooks/api/category/useGetCategoryDataQuery";
import useGetOrganizationSettingsQuery from "@/hooks/api/organization/useGetOrganizationSettingsQuery";
import useGetRfidDataQuery from "@/hooks/api/rfid/useGetRfidDataQuery";
import useCreateStockMovementWithItemsMutation from "@/hooks/api/stockMovement/useCreateStockMovementWithItemsMutation";
import useGetNextReferenceNumberQuery from "@/hooks/api/stockMovement/useGetNextReferenceNumberQuery";
import useGetStockMovementTypesQuery from "@/hooks/api/stockMovement/useGetStockMovementTypesQuery";
import useGetStoreDataQuery from "@/hooks/api/store/useGetStoreDataQuery";
import {
  StockMovementType,
  StockMovementTypeNameEnum,
} from "@/services/stockMovement/getStockMovementDataService";
import { CategoryItemType } from "@/types/category";

export interface ItemRow {
  attributeValues: Record<string, string | number | string[]>;
  epc: string;
  epcName: string;
  id: string;
  internalCode: string;
  metadata: {
    actual_length?: number;
    diameter_end?: number;
    diameter_start?: number;
    trim_type?: string;
    volume?: number;
  };
  parentCategoryId: string;
  subcategoryId: string;
}

export function usePenerimaanLogForm() {
  const { tokenPayload } = useUser();
  const queryClient = useQueryClient();
  const organizationId = tokenPayload?.organization_id ?? "";

  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [note, setNote] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [itemRows, setItemRows] = useState<ItemRow[]>([]);

  const { data: storeData, isLoading: isLoadingStores } = useGetStoreDataQuery(
    { filters: { limit: 1000 }, organizationId },
  );

  const { data: stockMovementTypes } = useGetStockMovementTypesQuery({ organizationId });

  const { data: orgSettings } = useGetOrganizationSettingsQuery({ organizationId });
  const ritEnabled = orgSettings?.rit_number_enabled ?? false;

  const { data: nextRefData } = useGetNextReferenceNumberQuery({
    enabled: Boolean(selectedStoreId) && ritEnabled,
    organizationId,
    storeId: selectedStoreId,
  });

  useEffect(() => {
    if (nextRefData?.reference_number) {
      setReferenceNumber(nextRefData.reference_number);
    }
  }, [nextRefData]);

  const { data: rfidData } = useGetRfidDataQuery({
    enabled: Boolean(selectedStoreId),
    filters: {
      assigned_store_id: selectedStoreId,
      is_used: false,
      limit: 1000,
    },
    organizationId,
  });

  const epcOptions = useMemo(() => {
    const rfids = rfidData?.data?.rfids ?? [];
    return rfids.map((r) => ({
      label: r.name ? `${r.name} (${r.epc})` : r.epc,
      value: r.epc,
    }));
  }, [rfidData]);

  const epcNameMap = useMemo(() => {
    const rfids = rfidData?.data?.rfids ?? [];
    const map = new Map<string, string>();
    rfids.forEach((r) => {
      if (r.name) map.set(r.epc, r.name);
    });
    return map;
  }, [rfidData]);

  const { data: categoryData } = useGetCategoryDataQuery({ organizationId });

  const parentCategories = useMemo(
    () =>
      (categoryData?.data?.categories ?? []).filter(
        (c: CategoryItemType) =>
          c.has_subcategories && c.name.toUpperCase().startsWith("KAYU BULAT"),
      ),
    [categoryData],
  );

  const penerimaanLogTypeId = useMemo(() => {
    const found = (stockMovementTypes ?? []).find(
      (t: StockMovementType) =>
        t.name === StockMovementTypeNameEnum.PENERIMAAN_LOG_INBOUND,
    );
    return found?.id ?? "";
  }, [stockMovementTypes]);

  useEffect(() => {
    setReferenceNumber("");
  }, [selectedStoreId]);

  const storeOptions = useMemo(
    () =>
      (storeData?.data?.stores ?? []).map((s) => ({
        label: s.name,
        value: s.id,
      })),
    [storeData],
  );

  const parentCategoryOptions = useMemo(
    () =>
      parentCategories.map((c: CategoryItemType) => ({
        label: c.name,
        value: c.id,
      })),
    [parentCategories],
  );

  const handleAddRow = useCallback(() => {
    const newRow: ItemRow = {
      attributeValues: {},
      epc: "",
      epcName: "",
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      internalCode: "",
      metadata: {},
      parentCategoryId: "",
      subcategoryId: "",
    };
    setItemRows((prev) => [...prev, newRow]);
  }, []);

  const handleRemoveRow = useCallback((id: string) => {
    setItemRows((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const handleUpdateRow = useCallback(
    (id: string, field: keyof ItemRow, value: string) => {
      setItemRows((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          const updated = { ...r, [field]: value };
          if (field === "epc") {
            updated.epcName = epcNameMap.get(value) ?? "";
          }
          if (field === "parentCategoryId") {
            updated.subcategoryId = "";
            updated.attributeValues = {};
          }
          if (field === "subcategoryId") {
            updated.attributeValues = {};
          }
          return updated;
        }),
      );
    },
    [epcNameMap],
  );

  const handleUpdateAttributeValue = useCallback(
    (id: string, attributeId: string, value: string | number | string[]) => {
      setItemRows((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, attributeValues: { ...r.attributeValues, [attributeId]: value } }
            : r,
        ),
      );
    },
    [],
  );

  const handleUpdateMetadata = useCallback(
    (id: string, key: keyof ItemRow["metadata"], value: number | string | undefined) => {
      setItemRows((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, metadata: { ...r.metadata, [key]: value } }
            : r,
        ),
      );
    },
    [],
  );

  const { mutateAsync: createStockMovementWithItems, isPending: isCreating } =
    useCreateStockMovementWithItemsMutation();

  const isSubmitting = isCreating;

  const isFormValid = useMemo(
    () =>
      Boolean(selectedStoreId) &&
      Boolean(penerimaanLogTypeId) &&
      itemRows.length > 0 &&
      itemRows.every(
        (r) => Boolean(r.epc) && Boolean(r.subcategoryId),
      ),
    [selectedStoreId, penerimaanLogTypeId, itemRows],
  );

  const hasDuplicateEpcs = useMemo(() => {
    const epcs = itemRows.map((r) => r.epc).filter(Boolean);
    return epcs.length !== new Set(epcs).size;
  }, [itemRows]);

  const handleSubmit = async () => {
    if (!isFormValid) {
      toast.error("Lengkapi semua field yang wajib diisi");
      return false;
    }

    if (hasDuplicateEpcs) {
      toast.error("Terdapat EPC yang duplikat");
      return false;
    }

    try {
      const items = itemRows.map((r) => ({
        attribute_items:
          Object.keys(r.attributeValues).length > 0
            ? Object.entries(r.attributeValues).map(([attributeId, value]) => ({
                attribute_id: attributeId,
                values: Array.isArray(value) ? value.map(String) : value,
              }))
            : undefined,
        category_ids: r.subcategoryId ? [r.subcategoryId] : undefined,
        epc: r.epc,
        internal_code: r.internalCode || undefined,
        metadata: Object.keys(r.metadata).length > 0 ? r.metadata : undefined,
        name: r.epcName || undefined,
      }));

      await createStockMovementWithItems({
        data: {
          image_urls: imageUrls,
          items,
          note: note || undefined,
          reference_number: referenceNumber || undefined,
          stock_movement_type_id: penerimaanLogTypeId,
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
    epcOptions,
    handleAddRow,
    handleAttributeValueUpdate: handleUpdateAttributeValue,
    handleMetadataUpdate: handleUpdateMetadata,
    handleRemoveRow,
    handleSubmit,
    handleUpdateRow,
    imageUrls,
    isFormValid,
    isLoadingStores,
    isSubmitting,
    itemRows,
    note,
    organizationId,
    parentCategoryOptions,
    referenceNumber,
    ritEnabled,
    selectedStoreId,
    setImageUrls,
    setNote,
    setReferenceNumber,
    setSelectedStoreId,
    storeOptions,
  };
}
