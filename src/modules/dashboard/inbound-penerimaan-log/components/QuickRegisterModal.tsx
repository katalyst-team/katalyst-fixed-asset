import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "next-i18next";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/context/user-context";
import useGetCategoryDataQuery from "@/hooks/api/category/useGetCategoryDataQuery";
import useGetSubcategoriesQuery from "@/hooks/api/category/useGetSubcategoriesQuery";
import useRegisterItemsMutation from "@/hooks/api/item/useRegisterItemsMutation";
import useGetStockMovementTypesQuery from "@/hooks/api/stockMovement/useGetStockMovementTypesQuery";
import useGetStoreAreaDataQuery from "@/hooks/api/store/useGetStoreAreaDataQuery";
import {
  StockMovementType,
  StockMovementTypeNameEnum,
} from "@/services/stockMovement/getStockMovementDataService";
import { CategoryItemType } from "@/types/category";
import type { RegisterItemsRequest } from "@/types/rstCutting";

interface QuickRegisterModalProps {
  onClose: () => void;
  open: boolean;
  storeId: string;
}

const QuickRegisterModal: React.FC<QuickRegisterModalProps> = ({
  onClose,
  open,
  storeId,
}) => {
  const { t } = useTranslation("inbound");
  const { tokenPayload } = useUser();
  const queryClient = useQueryClient();
  const organizationId = tokenPayload?.organization_id ?? "";

  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [selectedParentCategoryId, setSelectedParentCategoryId] = useState("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");
  const [internalCode, setInternalCode] = useState("");
  const [skuId, setSkuId] = useState("");
  const [epc, setEpc] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!open) {
      setSelectedSectionId("");
      setSelectedParentCategoryId("");
      setSelectedSubcategoryId("");
      setInternalCode("");
      setSkuId("");
      setEpc("");
      setQuantity(1);
    }
  }, [open]);

  const effectiveStoreId = storeId === "0" ? "" : storeId;

  const { data: storeAreaData, isLoading: isLoadingAreas } =
    useGetStoreAreaDataQuery({
      organizationId,
      storeId: effectiveStoreId,
    });

  const { data: categoryData } = useGetCategoryDataQuery({
    organizationId,
  });

  const parentCategories = useMemo(
    () =>
      (categoryData?.data?.categories ?? []).filter(
        (c: CategoryItemType) =>
          c.has_subcategories && c.name.startsWith("KAYU BULAT"),
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

  const { data: stockMovementTypes } = useGetStockMovementTypesQuery({
    organizationId,
  });

  const penerimaanLogTypeId = useMemo(() => {
    const found = (stockMovementTypes ?? []).find(
      (t: StockMovementType) =>
        t.name === StockMovementTypeNameEnum.PENERIMAAN_LOG_INBOUND,
    );
    return found?.id ?? "";
  }, [stockMovementTypes]);

  useEffect(() => {
    setSelectedSubcategoryId("");
  }, [selectedParentCategoryId]);

  const sectionOptions = useMemo(
    () =>
      (storeAreaData?.data?.sections ?? []).map((s) => ({
        label: s.name,
        value: s.id,
      })),
    [storeAreaData],
  );

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

  const registerMutation = useRegisterItemsMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stockMovementData"] });
      toast.success("Item berhasil di-register");
      onClose();
    },
  });

  const isFormValid = useMemo(() => {
    const effectiveStoreId = storeId === "0" ? "" : storeId;
    return (
      Boolean(effectiveStoreId) &&
      internalCode.trim().length > 0 &&
      quantity > 0
    );
  }, [storeId, internalCode, quantity]);

  const handleSubmit = useCallback(() => {
    if (!isFormValid) return;

    const effectiveStoreId = storeId === "0" ? "" : storeId;
    if (!effectiveStoreId) {
      toast.error("Pilih store terlebih dahulu");
      return;
    }

    const payload: RegisterItemsRequest = {
      category_ids: selectedSubcategoryId
        ? [selectedSubcategoryId]
        : selectedParentCategoryId
          ? [selectedParentCategoryId]
          : undefined,
      epcs: epc.trim() ? [epc.trim()] : undefined,
      internal_code: internalCode.trim(),
      items: [{ quantity }],
      section_id: selectedSectionId || undefined,
      sku_id: skuId.trim() || undefined,
      stock_movement_type_id: penerimaanLogTypeId || undefined,
    };

    registerMutation.mutate({
      data: payload,
      organizationId,
      storeId: effectiveStoreId,
    });
  }, [
    isFormValid,
    storeId,
    internalCode,
    quantity,
    selectedSubcategoryId,
    selectedParentCategoryId,
    epc,
    selectedSectionId,
    skuId,
    penerimaanLogTypeId,
    registerMutation,
    organizationId,
  ]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Quick Register Item</DialogTitle>
          <DialogDescription>
            Register item langsung masuk inventory tanpa verification workflow
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Combobox
            disabled={storeId === "0" || isLoadingAreas}
            label="Section / Area"
            options={sectionOptions}
            placeholder={
              storeId === "0"
                ? "Pilih store dulu"
                : isLoadingAreas
                  ? "Loading..."
                  : "Pilih section..."
            }
            value={selectedSectionId}
            onSelect={(value) => setSelectedSectionId(value || "")}
          />

          <div className="grid grid-cols-2 gap-4">
            <Combobox
              label="Jenis Kayu"
              options={parentCategoryOptions}
              placeholder="Pilih jenis kayu..."
              value={selectedParentCategoryId}
              onSelect={(value) => setSelectedParentCategoryId(value || "")}
            />
            <Combobox
              disabled={!selectedParentCategoryId}
              label="Grade"
              options={subcategoryOptions}
              placeholder={
                !selectedParentCategoryId
                  ? "Pilih jenis kayu dulu"
                  : "Pilih grade..."
              }
              value={selectedSubcategoryId}
              onSelect={(value) => setSelectedSubcategoryId(value || "")}
            />
          </div>

          <div className="space-y-2">
            <Label>Internal Code *</Label>
            <Input
              placeholder="Masukkan internal code..."
              value={internalCode}
              onChange={(e) => setInternalCode(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>SKU ID (opsional)</Label>
            <Input
              placeholder="Masukkan SKU ID jika sudah ada..."
              value={skuId}
              onChange={(e) => setSkuId(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>EPC / RFID Tag (opsional)</Label>
            <Input
              placeholder="Scan atau masukkan EPC..."
              value={epc}
              onChange={(e) => setEpc(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input
              min={1}
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value) || 1)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("filter.cancel", "Cancel")}
          </Button>
          <Button
            disabled={!isFormValid || registerMutation.isPending}
            onClick={handleSubmit}
          >
            {registerMutation.isPending ? "Registering..." : "Register"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuickRegisterModal;
