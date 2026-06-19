import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "next-i18next";
import React, { useState } from "react";

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
import { useCreateStockMovementTypeMutation } from "@/hooks/api/stock-movement-types";
import { KEY_USE_GET_STOCK_MOVEMENT_TYPES } from "@/hooks/api/stock-movement-types/useGetStockMovementTypesQuery";
import { StockMovementDirection } from "@/services/stock-movement-types/getStockMovementTypesService";

import {
  SELECTABLE_STOCK_MOVEMENT_DIRECTIONS,
  SelectableStockMovementDirection,
} from "../constants";
import formatStockMovementTypeName from "../utils/formatStockMovementTypeName";

interface CreateStockMovementTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateStockMovementTypeModal: React.FC<
  CreateStockMovementTypeModalProps
> = ({ isOpen, onClose }) => {
  const { t } = useTranslation("stock-movement-types");
  const { tokenPayload } = useUser();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [direction, setDirection] =
    useState<SelectableStockMovementDirection | "">("");

  const { mutateAsync, isPending } = useCreateStockMovementTypeMutation({
    organizationId: tokenPayload?.organization_id || "",
  });

  const handleSubmit = () => {
    const formattedName = formatStockMovementTypeName(name);
    if (!formattedName || !direction) return;

    mutateAsync({
      direction: direction as StockMovementDirection,
      name: formattedName,
    }).then(() => {
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_STOCK_MOVEMENT_TYPES(
          tokenPayload?.organization_id || ""
        ),
      });

      // Reset form
      setName("");
      setDirection("");
      onClose();
    });
  };

  const handleClose = () => {
    setName("");
    setDirection("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("modal.create.title")}</DialogTitle>
          <DialogDescription>
            {t("modal.create.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("modal.create.name")}</Label>
            <Input
              id="name"
              placeholder={t("modal.create.namePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="direction">{t("modal.create.direction")}</Label>
            <Select
              value={direction}
              onValueChange={(value) =>
                setDirection(value as SelectableStockMovementDirection)
              }
            >
              <SelectTrigger id="direction">
                <SelectValue
                  placeholder={t("modal.create.directionPlaceholder")}
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
          <Button variant="outline" onClick={handleClose}>
            {t("modal.create.cancel")}
          </Button>
          <Button
            disabled={!formatStockMovementTypeName(name) || !direction || isPending}
            onClick={handleSubmit}
          >
            {isPending ? t("modal.create.creating") : t("modal.create.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateStockMovementTypeModal;
