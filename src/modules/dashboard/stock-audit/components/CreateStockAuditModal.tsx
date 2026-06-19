import { useTranslation } from "next-i18next";
import React, { useEffect, useRef, useState } from "react";
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
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multiSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/user-context";
import { useGetSkuDataQuery } from "@/hooks/api/sku/useGetSKUDataQuery";
import useGetStockMovementTypesQuery from "@/hooks/api/stockMovement/useGetStockMovementTypesQuery";
import useGetStoreAreaDataQuery from "@/hooks/api/store/useGetStoreAreaDataQuery";
import useGetStoreDataQuery from "@/hooks/api/store/useGetStoreDataQuery";

const SEARCH_DEBOUNCE_MS = 400;
const useDebouncedValue = <T,>(value: T, delay: number): T => {
  const [debounced, setDebounced] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    timerRef.current = setTimeout(() => setDebounced(value), delay);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [value, delay]);
  return debounced;
};
import { useStockAudit } from "@/modules/dashboard/stock-audit/context/StockAuditContext";
import { StockMovementTypeDirectionEnum } from "@/services/stockMovement/getStockMovementDataService";
import { AuditType, StockAuditCreatePayload } from "@/types/stock-audit";

interface CreateStockAuditModalProps {
  isOpen: boolean;
  requireStockMovementType?: boolean;
  onClose: () => void;
}

const CreateStockAuditModal: React.FC<CreateStockAuditModalProps> = ({
  isOpen,
  requireStockMovementType,
  onClose,
}) => {
  const { t } = useTranslation("stock-audit");
  const [auditType, setAuditType] = useState<AuditType>("ALL");
  const { tokenPayload, selectedTeam } = useUser();
  const [selectedStoreId, setSelectedStoreId] = useState<string | undefined>(
    undefined,
  );
  const [selectedSectionId, setSelectedSectionId] = useState<
    string | undefined
  >(undefined);
  const [selectedSkuId, setSelectedSkuId] = useState<string | undefined>(
    undefined,
  );
  const [selectedMovementTypeNames, setSelectedMovementTypeNames] = useState<
    string[]
  >([]);
  const [skuSearch, setSkuSearch] = useState("");
  const [sectionSearch, setSectionSearch] = useState("");
  const debouncedSkuSearch = useDebouncedValue(skuSearch, SEARCH_DEBOUNCE_MS);
  const debouncedSectionSearch = useDebouncedValue(sectionSearch, SEARCH_DEBOUNCE_MS);

  const { createStockAudit, createLoading } = useStockAudit();

  const { data: storeData } = useGetStoreDataQuery({
    filters: { limit: 10000 },
    organizationId: tokenPayload?.organization_id ?? "",
  });

  const { data: storeAreaData } = useGetStoreAreaDataQuery({
    limit: 10,
    name: debouncedSectionSearch || undefined,
    organizationId: tokenPayload?.organization_id ?? "",
    storeId: selectedStoreId || "",
  });

  const { data: skuData } = useGetSkuDataQuery({
    filters: {
      assigned_store_id: selectedTeam !== "0" ? selectedTeam : undefined,
      limit: 10,
      query: debouncedSkuSearch || undefined,
    },
    organizationId: tokenPayload?.organization_id ?? "",
  });

  const { data: stockMovementTypesData } = useGetStockMovementTypesQuery({
    organizationId: tokenPayload?.organization_id ?? "",
  });

  const auditTypeOptions = [
    { label: t("modal.create.types.all"), value: "ALL" },
    { label: t("modal.create.types.bySection"), value: "BY_SECTION" },
    { label: t("modal.create.types.bySku"), value: "BY_SKU" },
  ];

  const storeOptions =
    storeData?.data?.stores?.map((store) => ({
      label: store.name,
      value: store.id,
    })) || [];

  const sectionOptions =
    storeAreaData?.data?.sections?.map((section) => ({
      label: section.name,
      value: section.id,
    })) || [];

  const skuOptions =
    skuData?.data?.skus?.map((sku) => ({
      label: sku.name,
      value: sku.id,
    })) || [];

  const movementTypeOptions =
    stockMovementTypesData
      ?.filter((item) => item.direction === StockMovementTypeDirectionEnum.INBOUND)
      .map((item) => ({
        label: item.name
          .toLowerCase()
          .split("_")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" "),
        value: item.name,
      })) || [];

  const handleAuditTypeChange = (value: string) => {
    setAuditType(value as AuditType);
    setSelectedSectionId(undefined);
    setSelectedSkuId(undefined);
  };

  const handleCreateAudit = async () => {
    if (!selectedStoreId) return;

    try {
      const payload: StockAuditCreatePayload = {
        section_id: auditType === "BY_SECTION" ? selectedSectionId : undefined,
        sku_id: auditType === "BY_SKU" ? selectedSkuId : undefined,
        stock_movement_type_names:
          selectedMovementTypeNames.length > 0
            ? selectedMovementTypeNames
            : undefined,
        store_id: selectedStoreId,
        type: auditType,
      };

      createStockAudit(payload);

      toast.success("Stock audit created successfully");
      onClose();

      setAuditType("ALL");
      setSelectedStoreId(undefined);
      setSelectedSectionId(undefined);
      setSelectedSkuId(undefined);
      setSelectedMovementTypeNames([]);
    } catch (error) {
      toast.error("Failed to create stock audit");
      console.error("Error creating stock audit:", error);
    }
  };

  const isCreateDisabled =
    !selectedStoreId ||
    createLoading ||
    (auditType === "BY_SECTION" && !selectedSectionId) ||
    (auditType === "BY_SKU" && !selectedSkuId) ||
    (requireStockMovementType === true && selectedMovementTypeNames.length === 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("modal.create.title")}</DialogTitle>
          <DialogDescription>{t("modal.create.description")}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="auditType">{t("modal.create.auditType")}</Label>
            <Select value={auditType} onValueChange={handleAuditTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder={t("modal.create.selectType")} />
              </SelectTrigger>
              <SelectContent>
                {auditTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="store">{t("modal.create.store")}</Label>
            <Select
              value={selectedStoreId || ""}
              onValueChange={setSelectedStoreId}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("modal.create.selectStore")} />
              </SelectTrigger>
              <SelectContent>
                {storeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              Pastikan store yang dipilih sudah benar sebelum menyimpan
            </p>
          </div>

          {auditType === "BY_SECTION" && (
            <div className="grid gap-2">
              <Label>{t("modal.create.storeSection")}</Label>
              <Combobox
                disabled={!selectedStoreId}
                options={sectionOptions}
                placeholder={!selectedStoreId ? t("modal.create.selectStore") : t("modal.create.selectSection")}
                value={selectedSectionId || ""}
                onSearchChange={setSectionSearch}
                onSelect={(v) => setSelectedSectionId(v || undefined)}
              />
            </div>
          )}

          {auditType === "BY_SKU" && (
            <div className="grid gap-2">
              <Label>SKU</Label>
              <Combobox
                options={skuOptions}
                placeholder={t("modal.create.selectSku")}
                value={selectedSkuId || ""}
                onSearchChange={setSkuSearch}
                onSelect={(v) => setSelectedSkuId(v || undefined)}
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="movementTypes">
              {t("modal.create.movementTypes")}
              {requireStockMovementType ? (
                <span className="ml-1 text-destructive">*</span>
              ) : (
                <span className="ml-1 text-xs text-muted-foreground">
                  ({t("modal.create.optional")})
                </span>
              )}
            </Label>
            <MultiSelect
              modalPopover
              defaultValue={selectedMovementTypeNames}
              options={movementTypeOptions}
              placeholder={t("modal.create.selectMovementTypes")}
              onValueChange={setSelectedMovementTypeNames}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("buttons.cancel")}
          </Button>
          <Button disabled={isCreateDisabled} onClick={handleCreateAudit}>
            {createLoading
              ? t("modal.create.creating")
              : t("modal.create.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateStockAuditModal;
