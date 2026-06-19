import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "next-i18next";
import { useEffect } from "react";
import { useState } from "react";

import ButtonEdit from "@/components/shared/ButtonEdit";
import { InputWithLabel } from "@/components/shared/InputWithLabel";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/user-context";
import { KEY_USE_GET_RFID_DATA } from "@/hooks/api/rfid/useGetRfidDataQuery";
import { toastError } from "@/services";
import { RfidCategory, RfidItemType, RfidStatus, RfidType } from "@/types/rfid";

import { useEpcStore } from "./store";
import { useEpcActions } from "./useEpcActions";

interface EpcModalProps {
  type: "create" | "edit";
  epcData?: RfidItemType;
}

const ALL_STORES_VALUE = "0";

const EpcModalAdd = ({ type, epcData }: EpcModalProps) => {
  const { t } = useTranslation(["epc"]);
  const queryClient = useQueryClient();
  const { setFilters } = useEpcStore();
  const { tokenPayload, selectedTeam, stores } = useUser();
  const [open, setOpen] = useState(false);
  const [epcCode, setEpcCode] = useState(epcData?.epc || "");
  const [name, setName] = useState(epcData?.name || "");
  const [epcType, setEpcType] = useState<string | undefined>(
    epcData?.type || undefined
  );
  const [category, setCategory] = useState<string | undefined>(
    epcData?.category || undefined
  );
  const [status, setStatus] = useState<string | undefined>(
    epcData?.status || undefined
  );
  const [storeId, setStoreId] = useState(
    epcData?.store?.id || selectedTeam || "0"
  );

  const { createEpc, updateEpc } = useEpcActions();
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      if (type === "edit" && epcData) {
        setEpcCode(epcData.epc);
        setName(epcData.name);
        setEpcType(epcData.type);
        setCategory(epcData.category);
        setStatus(epcData.status);
        setStoreId(epcData.store?.id || selectedTeam || "0");
      }
    } else if (type === "create") {
      setEpcCode("");
      setName("");
      setEpcType(undefined);
      setCategory(undefined);
      setStatus(undefined);
      setStoreId(selectedTeam || "0");
    }
  }, [open, type, epcData, selectedTeam]);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (type === "create") {
        await createEpc({
          rfids: [
            {
              category: category as RfidCategory,
              epc: epcCode,
              name: name,
              status: status as RfidStatus,
              store_id: storeId !== ALL_STORES_VALUE ? storeId : undefined,
              type: epcType as RfidType,
            },
          ],
        });
        // toast.success(t("modal.create.success"));
      } else {
        await updateEpc({
          rfids: [
            {
              category: category as RfidCategory,
              epc: epcCode,
              id: epcData?.id || "",
              name: name,
              status: status as RfidStatus,
              store_id: storeId !== ALL_STORES_VALUE ? storeId : undefined,
              type: epcType as RfidType,
            },
          ],
        });
        // toast.success(t("modal.edit.success"));
      }
      setFilters({});
      // // Invalidate queries to refetch data
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_RFID_DATA(
          tokenPayload?.organization_id || "",
          {}
        ),
      });

      setOpen(false);

      // Reset form for create mode
      if (type === "create") {
        setEpcCode("");
        setName("");
        setEpcType(undefined);
        setCategory(undefined);
        setStatus(undefined);
        setStoreId(selectedTeam || "0");
      }
    } catch (error) {
      toastError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled =
    !epcCode || !epcType || !category || !status || !storeId || isLoading;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {type === "create" ? (
          <Button size={"sm"}>{t("modal.create.button")}</Button>
        ) : (
          <ButtonEdit />
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {type === "create"
              ? t("modal.create.title")
              : t("modal.edit.title")}
          </DialogTitle>
          <DialogDescription>
            {type === "create"
              ? t("modal.create.description")
              : t("modal.edit.description")}
          </DialogDescription>
          <div className="flex py-4 flex-col w-full gap-4">
            <InputWithLabel
              isRequired
              label={t("modal.form.epcCode")}
              placeholder={t("modal.form.epcCodePlaceholder")}
              value={epcCode}
              onChange={(e) => setEpcCode(e.target.value)}
            />

            <InputWithLabel
              label={t("modal.form.name")}
              placeholder={t("modal.form.namePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className="space-y-2">
              <Label isRequired htmlFor="type">
                {t("modal.form.type")}
              </Label>
              <Select value={epcType} onValueChange={setEpcType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("modal.form.typeSelect")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={RfidType.REUSABLE}>
                    {t("type.reusable")}
                  </SelectItem>
                  <SelectItem value={RfidType.DISPOSABLE}>
                    {t("type.disposable")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label isRequired htmlFor="category">
                {t("modal.form.category")}
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("modal.form.categorySelect")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={RfidCategory.SINGLE}>
                    {t("category.single")}
                  </SelectItem>
                  <SelectItem value={RfidCategory.PACKAGE}>
                    {t("category.package")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label isRequired htmlFor="status">
                {t("modal.form.status")}
              </Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("modal.form.statusSelect")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={RfidStatus.ACTIVE}>
                    {t("status.active")}
                  </SelectItem>
                  <SelectItem value={RfidStatus.INACTIVE}>
                    {t("status.inactive")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label isRequired htmlFor="store">
                {t("modal.form.store")}
              </Label>
              <Select value={storeId} onValueChange={setStoreId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("modal.form.storeSelect")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_STORES_VALUE}>
                    {t("modal.form.allStores")}
                  </SelectItem>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button disabled={isDisabled} type="button" onClick={handleSubmit}>
              {isLoading
                ? type === "create"
                  ? t("modal.create.creating")
                  : t("modal.edit.saving")
                : t("modal.form.save")}
            </Button>
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default EpcModalAdd;
