import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/user-context";
import useCreateApiKeyDataMutation from "@/hooks/api/api-key/useCreateApiKeyDataMutation";
import { KEY_USE_GET_API_KEY_DATA } from "@/hooks/api/api-key/useGetApiKeyDataQuery";
import { toastError } from "@/services";

const ApiKeyCreateDialog = () => {
  const { t } = useTranslation(["api-key"]);
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { tokenPayload } = useUser();
  const { mutateAsync: createApiKey, isPending } = useCreateApiKeyDataMutation();

  const handleCreateApiKey = async () => {
    await createApiKey({
      account_organization_id: tokenPayload?.account_organization_role_id || "",
      organization_id: tokenPayload?.organization_id || "",
    })
      .then((resp) => {
        queryClient.invalidateQueries({
          queryKey: KEY_USE_GET_API_KEY_DATA(
            tokenPayload?.organization_id || "",
            tokenPayload?.account_organization_role_id || ""
          ),
        });
        toast.success(t("api-key:modal.addApiKey.apiKeyCreated"));
        
        // Show the generated API key to the user
        if (resp.data.key) {
          toast.success(
            `${t("api-key:modal.addApiKey.generatedKey")}: ${resp.data.key}`,
            {
              duration: 10000,
            }
          );
        }
      })
      .catch((e) => toastError(e));
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size={"sm"}>{t("api-key:modal.addApiKey.addButton")}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("api-key:modal.addApiKey.createTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("api-key:modal.addApiKey.createDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("api-key:modal.addApiKey.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={handleCreateApiKey}
          >
            {isPending
              ? t("api-key:modal.addApiKey.creating")
              : t("api-key:modal.addApiKey.createButton")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ApiKeyCreateDialog;