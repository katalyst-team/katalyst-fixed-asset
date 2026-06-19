/* eslint-disable no-unused-vars */
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { InputWithLabel } from "@/components/shared/InputWithLabel";
import { Button } from "@/components/ui/button";
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
import { useUser } from "@/context/user-context";
import useCreateLedgerItemMutation from "@/hooks/api/ledger/useCreateLedgerItemMutation";
import useGetRfidDataQuery from "@/hooks/api/rfid/useGetRfidDataQuery";
import { useGetSkuDataQuery } from "@/hooks/api/sku/useGetSKUDataQuery";
import useGetStatusLedgerDataQuery from "@/hooks/api/status/useGetLedgerStatusDataQuery";
import { toastError } from "@/services";
import { EnumLedgerStatus, ItemType } from "@/types/ledger";
import { RfidStatus } from "@/types/rfid";

interface LedgerItem {
  sku_id: string;
  quantity: number;
}

const PackingModalAddPack = () => {
  const { t } = useTranslation("packing");
  const { tokenPayload, selectedTeam } = useUser();
  const queryClient = useQueryClient();

  const { data, isLoading } = useGetSkuDataQuery({
    filters: {
      assigned_store_id: selectedTeam !== "0" ? selectedTeam : undefined,
    },
    organizationId: tokenPayload?.organization_id ?? "",
  });

  const { data: rfidData, isLoading: isLoadingRfid } = useGetRfidDataQuery({
    filters: {
      assigned_store_id: selectedTeam !== "0" ? selectedTeam : undefined,
      status: RfidStatus.ACTIVE,
    },
    organizationId: tokenPayload?.organization_id ?? "",
  });

  const { mutateAsync, isPending } = useCreateLedgerItemMutation();
  const [open, setOpen] = useState(false);

  const [_selectedRfidId, setSelectedRfidId] = useState<string>("");
  const [items, setItems] = useState<LedgerItem[]>([
    { quantity: 0, sku_id: "" },
  ]);

  const optionsSku = useMemo(() => {
    if (!data) return [];
    const skus = data.data.skus || [];
    return skus.map((sku) => ({
      label: sku.name,
      value: sku.id,
    }));
  }, [data]);

  const optionsRfid = useMemo(() => {
    if (!rfidData) return [];
    const rfids = rfidData.data.rfids || [];
    return rfids.map((rfid) => ({
      label: `${rfid.epc} (${rfid.name || "N/A"})`,
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

  const handleAddItem = () => {
    setItems([...items, { quantity: 0, sku_id: "" }]);
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

  const isFormValid = useMemo(() => {
    return items.every((item) => item.sku_id && item.quantity > 0);
  }, [items]);

  const handleSave = () => {
    mutateAsync({
      organizationId: tokenPayload?.organization_id ?? "",
      params: {
        items: items.map((item) => ({
          ...item,
          status_id: statusIdWaitingPrint as EnumLedgerStatus,
        })),
        type: ItemType.PACKING,
      },
      storeId: selectedTeam ?? "",
    })
      .then(() => {
        toast.success(t("modal.create.success"));
        setOpen(false);
        setSelectedRfidId("");
        setItems([{ quantity: 0, sku_id: "" }]);

        // Invalidate stock movement queries to refresh the ledger list
        queryClient.invalidateQueries({
          queryKey: ["stockMovementData"],
        });

        // Also invalidate ledger-specific queries if they exist
        queryClient.invalidateQueries({
          queryKey: ["ledgerData"],
        });
      })
      .catch((e) => toastError(e));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={"sm"}>{t("buttons.addLedger")}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("modal.create.title")}</DialogTitle>
          <DialogDescription>{t("modal.create.description")}</DialogDescription>
          <div className="flex py-4 flex-col w-full gap-4">
            <Combobox
              label="RFID"
              options={optionsRfid}
              placeholder={
                isLoadingRfid ? t("loading") : t("modal.create.selectRfid")
              }
              onSelect={(value) => setSelectedRfidId(value || "")}
            />
            {items.map((item, index) => (
              <div
                key={index}
                className="flex flex-col gap-4 border p-4 rounded-md"
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
                <Combobox
                  isRequired
                  label="SKU"
                  options={optionsSku}
                  placeholder={
                    isLoading ? t("loading") : t("modal.create.selectSku")
                  }
                  onSelect={(value) =>
                    handleItemChange(index, "sku_id", value || "")
                  }
                />
                <InputWithLabel
                  isRequired
                  label={t("modal.create.quantity")}
                  type="number"
                  value={item.quantity || ""}
                  onChange={(e) =>
                    handleItemChange(index, "quantity", Number(e.target.value))
                  }
                />
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
          </div>

          <DialogFooter>
            <Button
              disabled={!isFormValid || isPending}
              type="button"
              onClick={handleSave}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("modal.create.saving")}
                </>
              ) : (
                t("modal.create.save")
              )}
            </Button>
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default PackingModalAddPack;
