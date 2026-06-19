import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
import useCreateStoreAreaDataMutation from "@/hooks/api/store/useCreateStoreAreaDataMutation";
import useCreateStoreDataMutation from "@/hooks/api/store/useCreateStoreDataMutation";
import useEditStoreDataMutation from "@/hooks/api/store/useEditStoreDataMutation";
import { KEY_USE_GET_STORE_DATA } from "@/hooks/api/store/useGetStoreDataQuery";
import { toastError } from "@/services";
import { StoreItemType } from "@/types/store";

interface StoreModalProps {
  type: "create" | "edit";
  storeId?: string;
  storeData?: StoreItemType;
}

const StoreModalAddStore = ({ type, storeId, storeData }: StoreModalProps) => {
  const { t } = useTranslation(["store"]);
  const [open, setOpen] = useState(false);
  const [storeName, setStoreName] = useState(storeData?.name || "");
  const [status, setStatus] = useState<string | undefined>(
    storeData?.status || undefined
  );
  const queryClient = useQueryClient();

  const { tokenPayload } = useUser();
  const { mutateAsync: createStore, isPending: isCreating } =
    useCreateStoreDataMutation();
  const { mutateAsync: createStoreArea, isPending: isCreatingArea } =
    useCreateStoreAreaDataMutation();
  const { mutateAsync: editStore, isPending: isEditing } =
    useEditStoreDataMutation();
  const [storeAddress, setStoreAddress] = useState(storeData?.address || "");
  const isPending = isCreating || isEditing || isCreatingArea;

  // Reset form state when dialog opens or storeData changes
  useEffect(() => {
    if (open) {
      setStoreName(storeData?.name || "");
      setStoreAddress(storeData?.address || "");
      setStatus(storeData?.status || undefined);
    }
  }, [open, storeData]);

  const handleCreateStore = async () => {
    if (type === "create") {
      await createStore({
        address: storeAddress,
        name: storeName,
        organization_id: tokenPayload?.organization_id || "",
        status: status || "ACTIVE",
      })
        .then(async (response) => {
          // Create a default "Main" area for the new store
          const storeId = response.data.id;
          try {
            await createStoreArea({
              areaName: "Main",
              organizationId: tokenPayload?.organization_id || "",
              storeId,
            });
          } catch (areaError) {
            console.error("Failed to create default area:", areaError);
            // Don't block the success flow if area creation fails
          }

          queryClient.invalidateQueries({
            queryKey: KEY_USE_GET_STORE_DATA(
              tokenPayload?.organization_id || ""
            ),
          });
          toast.success(t("store:modal.addStore.storeCreated"));
        })
        .catch((e) => toastError(e));
    } else {
      editStore({
        address: storeAddress,
        name: storeName,
        organizationID: tokenPayload?.organization_id || "",
        status: status || "ACTIVE",
        storeID: storeId || "",
      })
        .then(() => {
          queryClient.invalidateQueries({
            queryKey: KEY_USE_GET_STORE_DATA(
              tokenPayload?.organization_id || ""
            ),
          });
          toast.success(t("store:modal.addStore.storeUpdated"));
        })
        .catch((e) => toastError(e));
    }
    setOpen(false);
  };

  const isDisabled = !storeName || !status || isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {type === "create" ? (
          <Button size={"sm"}>{t("store:modal.addStore.addButton")}</Button>
        ) : (
          <ButtonEdit />
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {type === "create"
              ? t("store:modal.addStore.createTitle")
              : t("store:modal.addStore.editTitle")}
          </DialogTitle>
          <DialogDescription>
            {type === "create"
              ? t("store:modal.addStore.createDescription")
              : t("store:modal.addStore.editDescription")}
          </DialogDescription>
          <div className="flex py-4 flex-col w-full gap-4">
            <InputWithLabel
              isRequired
              label={t("store:modal.addStore.storeNameLabel")}
              placeholder={t("store:modal.addStore.storeNamePlaceholder")}
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
            />
            <InputWithLabel
              label={t("store:modal.addStore.addressLabel")}
              placeholder={t("store:modal.addStore.addressPlaceholder")}
              value={storeAddress}
              onChange={(e) => setStoreAddress(e.target.value)}
            />
            <Label isRequired htmlFor="status">
              {t("store:modal.addStore.statusLabel")}
            </Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={t("store:modal.addStore.statusPlaceholder")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">
                  {t("store:modal.addStore.statusActive")}
                </SelectItem>
                <SelectItem value="INACTIVE">
                  {t("store:modal.addStore.statusInactive")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              disabled={isDisabled}
              type="button"
              onClick={handleCreateStore}
            >
              {isPending
                ? type === "create"
                  ? t("store:modal.addStore.creating")
                  : t("store:modal.addStore.saving")
                : type === "create"
                  ? t("store:modal.addStore.createButton")
                  : t("store:modal.addStore.editButton")}
            </Button>
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default StoreModalAddStore;
