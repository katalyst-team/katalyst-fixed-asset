import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { toast } from "sonner";

import ButtonEdit from "@/components/shared/ButtonEdit";
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
import useEditApiKeyDataMutation from "@/hooks/api/api-key/useEditApiKeyDataMutation";
import { KEY_USE_GET_API_KEY_DATA } from "@/hooks/api/api-key/useGetApiKeyDataQuery";
import { toastError } from "@/services";
import { ApiKeyItemType } from "@/types/api-key";

interface ApiKeyModalProps {
  keyId: string;
  apiKeyData: ApiKeyItemType;
}

const ApiKeyModalAddApiKey = ({
  keyId,
  apiKeyData,
}: ApiKeyModalProps) => {
  const { t } = useTranslation(["api-key"]);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<string | undefined>(
    apiKeyData?.status || undefined
  );
  const queryClient = useQueryClient();

  const { tokenPayload } = useUser();
  const { mutateAsync: editApiKey, isPending } =
    useEditApiKeyDataMutation();

  const handleEditApiKey = async () => {
    editApiKey({
      accountOrganizationID: tokenPayload?.account_organization_role_id || "",
      keyID: keyId,
      organizationID: tokenPayload?.organization_id || "",
      status: (status as "ACTIVE" | "INACTIVE") || "ACTIVE",
    })
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: KEY_USE_GET_API_KEY_DATA(
            tokenPayload?.organization_id || "",
            tokenPayload?.account_organization_role_id || ""
          ),
        });
        toast.success(t("api-key:modal.addApiKey.apiKeyUpdated"));
      })
      .catch((e) => toastError(e));
    setOpen(false);
  };

  const isDisabled = !status || isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ButtonEdit />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {t("api-key:modal.addApiKey.editTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("api-key:modal.addApiKey.editDescription")}
          </DialogDescription>
          <div className="flex py-4 flex-col w-full gap-4">
            <Label isRequired htmlFor="status">
              {t("api-key:modal.addApiKey.statusLabel")}
            </Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={t("api-key:modal.addApiKey.statusPlaceholder")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">
                  {t("api-key:modal.addApiKey.statusActive")}
                </SelectItem>
                <SelectItem value="INACTIVE">
                  {t("api-key:modal.addApiKey.statusInactive")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              disabled={isDisabled}
              type="button"
              onClick={handleEditApiKey}
            >
              {isPending
                ? t("api-key:modal.addApiKey.saving")
                : t("api-key:modal.addApiKey.editButton")}
            </Button>
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyModalAddApiKey;
