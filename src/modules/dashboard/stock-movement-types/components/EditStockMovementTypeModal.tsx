import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "next-i18next";
import React, { useEffect, useState } from "react";

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
import { useUpdateStockMovementTypeMutation } from "@/hooks/api/stock-movement-types";
import { KEY_USE_GET_STOCK_MOVEMENT_TYPES } from "@/hooks/api/stock-movement-types/useGetStockMovementTypesQuery";
import {
  StockMovementDirection,
  StockMovementType,
} from "@/services/stock-movement-types/getStockMovementTypesService";

import {
  SELECTABLE_STOCK_MOVEMENT_DIRECTIONS,
  SelectableStockMovementDirection,
} from "../constants";
import formatStockMovementTypeName from "../utils/formatStockMovementTypeName";
import humanizeStockMovementTypeName from "../utils/humanizeStockMovementTypeName";

interface EditStockMovementTypeModalProps {
  isOpen: boolean;
  item: StockMovementType;
  onClose: () => void;
}

const getSelectableDirection = (
  direction: StockMovementDirection
): SelectableStockMovementDirection =>
  SELECTABLE_STOCK_MOVEMENT_DIRECTIONS.find(
    (allowedDirection) => allowedDirection === direction
  ) ?? SELECTABLE_STOCK_MOVEMENT_DIRECTIONS[0];

const EditStockMovementTypeModal: React.FC<
  EditStockMovementTypeModalProps
> = ({ isOpen, item, onClose }) => {
  const { t } = useTranslation("stock-movement-types");
  const { tokenPayload } = useUser();
  const queryClient = useQueryClient();

  const [name, setName] = useState(() =>
    humanizeStockMovementTypeName(item.name)
  );
  const [direction, setDirection] = useState<SelectableStockMovementDirection>(
    getSelectableDirection(item.direction)
  );

  useEffect(() => {
    setName(humanizeStockMovementTypeName(item.name));
    setDirection(getSelectableDirection(item.direction));
  }, [item]);

  const { mutateAsync, isPending } = useUpdateStockMovementTypeMutation({
    organizationId: tokenPayload?.organization_id || "",
  });

  const handleSubmit = () => {
    const formattedName = formatStockMovementTypeName(name);
    if (!formattedName || !direction) return;

    mutateAsync({
      direction: direction as StockMovementDirection,
      name: formattedName,
      stock_movement_type_id: item.id,
    }).then(() => {
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_STOCK_MOVEMENT_TYPES(
          tokenPayload?.organization_id || ""
        ),
      });
      onClose();
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("modal.edit.title")}</DialogTitle>
          <DialogDescription>{t("modal.edit.description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">{t("modal.edit.name")}</Label>
            <Input
              id="edit-name"
              placeholder={t("modal.edit.namePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-direction">{t("modal.edit.direction")}</Label>
            <Select
              value={direction}
              onValueChange={(value) =>
                setDirection(value as SelectableStockMovementDirection)
              }
            >
              <SelectTrigger id="edit-direction">
                <SelectValue
                  placeholder={t("modal.edit.directionPlaceholder")}
                />
              </SelectTrigger>
              <SelectContent>
                {SELECTABLE_STOCK_MOVEMENT_DIRECTIONS.map((directionOption) => (
                  <SelectItem key={directionOption} value={directionOption}>
                    {t(`directions.${directionOption.toLowerCase()}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("modal.edit.cancel")}
          </Button>
          <Button
            disabled={!formatStockMovementTypeName(name) || !direction || isPending}
            onClick={handleSubmit}
          >
            {isPending ? t("modal.edit.updating") : t("modal.edit.update")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditStockMovementTypeModal;
