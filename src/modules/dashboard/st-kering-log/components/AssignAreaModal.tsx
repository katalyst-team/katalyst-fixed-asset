"use client";

import { useTranslation } from "next-i18next";
import { useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/user-context";
import useCreateStockMovementMutation from "@/hooks/api/stockMovement/useCreateStockMovementMutation";
import useGetStockMovementTypesQuery from "@/hooks/api/stockMovement/useGetStockMovementTypesQuery";
import useGetStoreAreaDataQuery from "@/hooks/api/store/useGetStoreAreaDataQuery";
import useGetStoreDataQuery from "@/hooks/api/store/useGetStoreDataQuery";
import {
  StockMovementType,
  StockMovementTypeNameEnum,
} from "@/services/stockMovement/getStockMovementDataService";
import { SkuItemType } from "@/types/sku";

interface AssignAreaModalProps {
  item: SkuItemType | null;
  open: boolean;
  onClose: () => void;
}

const AssignAreaModal: React.FC<AssignAreaModalProps> = ({
  item,
  onClose,
  open,
}) => {
  const { t } = useTranslation("st-kering-log");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");
  const [note, setNote] = useState("");

  const { data: storeData } = useGetStoreDataQuery({
    organizationId,
  });

  const { data: storeAreaData } = useGetStoreAreaDataQuery({
    organizationId,
    storeId: selectedStoreId,
  });

  const { data: stockMovementTypesData } = useGetStockMovementTypesQuery({
    organizationId,
  });

  const inboundTypes = useMemo(
    () =>
      (stockMovementTypesData ?? []).filter(
        (type: StockMovementType) => type.direction === "INBOUND",
      ),
    [stockMovementTypesData],
  );

  const defaultTypeId = useMemo(() => {
    const stKeringType = inboundTypes.find(
      (type: StockMovementType) =>
        type.name === StockMovementTypeNameEnum.ST_KERING_STORED,
    );
    return stKeringType?.id ?? "";
  }, [inboundTypes]);

  const storeOptions = useMemo(
    () => storeData?.data?.stores ?? [],
    [storeData],
  );

  const areaOptions = useMemo(
    () => storeAreaData?.data?.sections ?? [],
    [storeAreaData],
  );

  const isFormValid = useMemo(
    () =>
      Boolean(selectedStoreId) &&
      Boolean(selectedAreaId) &&
      Boolean(selectedTypeId || defaultTypeId),
    [selectedStoreId, selectedAreaId, selectedTypeId, defaultTypeId],
  );

  const itemId = item?.item?.id;

  const createMutation = useCreateStockMovementMutation({
    onSuccess: () => {
      toast.success(
        t("assignArea.success", "Area assigned successfully"),
      );
      handleClose();
    },
  });

  const handleClose = () => {
    setSelectedStoreId("");
    setSelectedAreaId("");
    setSelectedTypeId("");
    setNote("");
    onClose();
  };

  const handleSubmit = () => {
    if (!itemId || !isFormValid) {
      toast.error(
        t("assignArea.validationError", "Please fill in all required fields"),
      );
      return;
    }

    createMutation.mutate({
      data: {
        item_ids: [itemId],
        note,
        stock_movement_type_id: selectedTypeId || defaultTypeId,
      },
      organizationId,
      sectionId: selectedAreaId,
      storeId: selectedStoreId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {t("assignArea.title", "Assign Area")}
          </DialogTitle>
          <DialogDescription>
            {item?.internal_code
              ? t("assignArea.description", {
                  code: item.internal_code,
                  defaultValue: `Assign area for palet ${item.internal_code}`,
                })
              : t("assignArea.descriptionGeneric", "Assign warehouse area for this item")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>{t("assignArea.store", "Store")}</Label>
            <Select
              value={selectedStoreId}
              onValueChange={(v) => {
                setSelectedStoreId(v);
                setSelectedAreaId("");
              }}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t(
                    "assignArea.storePlaceholder",
                    "Select store...",
                  )}
                />
              </SelectTrigger>
              <SelectContent>
                {storeOptions.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>{t("assignArea.area", "Store Area")}</Label>
            <Select
              disabled={!selectedStoreId}
              value={selectedAreaId}
              onValueChange={setSelectedAreaId}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t(
                    "assignArea.areaPlaceholder",
                    "Select area...",
                  )}
                />
              </SelectTrigger>
              <SelectContent>
                {areaOptions.map((area) => (
                  <SelectItem key={area.id} value={area.id}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>{t("assignArea.type", "Movement Type")}</Label>
            <Select
              value={selectedTypeId || defaultTypeId}
              onValueChange={setSelectedTypeId}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t(
                    "assignArea.typePlaceholder",
                    "Select type...",
                  )}
                />
              </SelectTrigger>
              <SelectContent>
                {inboundTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>{t("assignArea.note", "Note (optional)")}</Label>
            <Input
              placeholder={t("assignArea.notePlaceholder", "Add note...")}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t("assignArea.cancel", "Cancel")}
          </Button>
          <Button
            disabled={!isFormValid || createMutation.isPending}
            onClick={handleSubmit}
          >
            {createMutation.isPending
              ? t("assignArea.submitting", "Assigning...")
              : t("assignArea.submit", "Assign Area")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignAreaModal;
