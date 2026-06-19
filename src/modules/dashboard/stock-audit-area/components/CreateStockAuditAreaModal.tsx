import { useTranslation } from "next-i18next";
import React, { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import useGetStockMovementTypesQuery from "@/hooks/api/stockMovement/useGetStockMovementTypesQuery";
import useGetStoreAreaDataQuery from "@/hooks/api/store/useGetStoreAreaDataQuery";
import useGetStoreDataQuery from "@/hooks/api/store/useGetStoreDataQuery";
import { useStockAuditArea } from "@/modules/dashboard/stock-audit-area/context/StockAuditAreaContext";
import { StockAuditAreaCreatePayload } from "@/types/stock-audit-area";

interface CreateStockAuditAreaModalProps {
  isOpen: boolean;
  requireStockMovementType?: boolean;
  onClose: () => void;
}

const CreateStockAuditAreaModal: React.FC<CreateStockAuditAreaModalProps> = ({
  isOpen,
  requireStockMovementType,
  onClose,
}) => {
  const { t } = useTranslation("stock-audit-area");
  const { tokenPayload } = useUser();
  const [selectedStoreId, setSelectedStoreId] = useState<string | undefined>(
    undefined
  );
  const [selectedSectionId, setSelectedSectionId] = useState<
    string | undefined
  >(undefined);
  const [selectedMovementTypeNames, setSelectedMovementTypeNames] = useState<
    string[]
  >([]);

  const { createStockAuditArea, createLoading } = useStockAuditArea();

  const { data: storeData } = useGetStoreDataQuery({
    filters: { limit: 10000 },
    organizationId: tokenPayload?.organization_id ?? "",
  });

  const { data: storeAreaData } = useGetStoreAreaDataQuery({
    limit: 10000,
    organizationId: tokenPayload?.organization_id ?? "",
    storeId: selectedStoreId || "",
  });

  const { data: stockMovementTypesData } = useGetStockMovementTypesQuery({
    organizationId: tokenPayload?.organization_id ?? "",
  });

  const storeOptions =
    storeData?.data?.stores?.map((store) => ({
      label: store.name,
      value: store.id,
    })) || [];

  const sectionOptions =
    storeAreaData?.data?.sections.map((section) => ({
      label: section.name,
      value: section.id,
    })) || [];

  const movementTypeOptions =
    stockMovementTypesData
      ?.filter((item) => item.direction === "INBOUND")
      .map((item) => ({
        label: item.name
          .toLowerCase()
          .split("_")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" "),
        value: item.name,
      })) || [];

  const handleCreateAudit = async () => {
    if (!selectedStoreId || !selectedSectionId) return;

    try {
      const payload: StockAuditAreaCreatePayload = {
        section_id: selectedSectionId,
        stock_movement_type_names:
          selectedMovementTypeNames.length > 0
            ? selectedMovementTypeNames
            : undefined,
        store_id: selectedStoreId,
      };

      createStockAuditArea(payload);

      toast.success("Stock audit area created successfully");
      onClose();

      setSelectedStoreId(undefined);
      setSelectedSectionId(undefined);
      setSelectedMovementTypeNames([]);
    } catch (error) {
      toast.error("Failed to create stock audit area");
      console.error("Error creating stock audit area:", error);
    }
  };

  const isCreateDisabled =
    !selectedStoreId ||
    !selectedSectionId ||
    createLoading ||
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
            <Label htmlFor="store">{t("modal.create.store")}</Label>
            <Select
              value={selectedStoreId || ""}
              onValueChange={(value) => {
                setSelectedStoreId(value);
                setSelectedSectionId(undefined);
              }}
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

          <div className="grid gap-2">
            <Label htmlFor="section">{t("modal.create.storeSection")}</Label>
            <Select
              disabled={!selectedStoreId}
              value={selectedSectionId || ""}
              onValueChange={setSelectedSectionId}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    !selectedStoreId
                      ? t("modal.create.selectStore")
                      : t("modal.create.selectSection")
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {sectionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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

export default CreateStockAuditAreaModal;
