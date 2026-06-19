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
import { useUser } from "@/context/user-context";
import useCreateStoreAreaDataMutation from "@/hooks/api/store/useCreateStoreAreaDataMutation";
import { KEY_USE_GET_STORE_AREA_DATA } from "@/hooks/api/store/useGetStoreAreaDataQuery";
import useUpdateStoreAreaDataMutation from "@/hooks/api/store/useUpdateStoreAreaDataMutation";
import { toastError } from "@/services";
import { StoreAreaItemType } from "@/types/store";

interface StoreAreaModalProps {
  type: "create" | "edit";
  areaId?: string;
  storeId: string;
  areaData?: StoreAreaItemType;
}

const StoreAreaModalAdd: React.FC<StoreAreaModalProps> = ({
  type,
  areaId = "",
  areaData,
  storeId,
}) => {
  const { t } = useTranslation(["store"]);
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id || "";
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [areaName, setAreaName] = useState(areaData?.name || "");
  const [isLoading, setIsLoading] = useState(false);

  const { mutateAsync: createArea } = useCreateStoreAreaDataMutation();
  const { mutateAsync: updateArea } = useUpdateStoreAreaDataMutation();

  // Reset form state when dialog opens or areaData changes
  useEffect(() => {
    if (open) {
      setAreaName(areaData?.name || "");
    }
  }, [open, areaData]);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (type === "create") {
        await createArea({
          areaName,
          organizationId,
          storeId,
        });
        toast.success(t("store:modal.addArea.areaCreated"));
      } else {
        await updateArea({
          areaId,
          areaName,
          organizationId,
          storeId,
        });
        toast.success(t("store:modal.addArea.areaUpdated"));
      }

      // Invalidate queries to refetch data
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_STORE_AREA_DATA(organizationId, storeId),
      });

      setIsLoading(false);
      setOpen(false);
    } catch (error) {
      setIsLoading(false);
      toastError(error as Error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {type === "create" ? (
          <Button size={"sm"}>{t("store:modal.addArea.addButton")}</Button>
        ) : (
          <ButtonEdit />
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {type === "create"
              ? t("store:modal.addArea.createTitle")
              : t("store:modal.addArea.editTitle")}
          </DialogTitle>
          <DialogDescription>
            {type === "create"
              ? t("store:modal.addArea.createDescription")
              : t("store:modal.addArea.editDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <InputWithLabel
            isRequired
            label={t("store:modal.addArea.areaNameLabel")}
            placeholder={t("store:modal.addArea.areaNamePlaceholder")}
            value={areaName}
            onChange={(e) => setAreaName(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button disabled={isLoading} type="submit" onClick={handleSubmit}>
            {isLoading
              ? t("store:modal.addArea.processing")
              : t("store:modal.addArea.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StoreAreaModalAdd;
