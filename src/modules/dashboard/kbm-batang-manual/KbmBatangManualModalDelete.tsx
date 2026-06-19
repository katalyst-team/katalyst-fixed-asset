"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
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
import { KEY_USE_GET_ATTRIBUTE_DATA } from "@/hooks/api/attribute/useGetAttributeDataQuery";
import useUpdateAttributeDataMutation from "@/hooks/api/attribute/useUpdateAttributeDataMutation";
import { toastError } from "@/services";
import { AttributeItemType } from "@/types/attribute";

import { KbmAttributeValueType, type KbmPresetValue } from "./constants";

interface KbmBatangManualModalDeleteProps {
  allPresets: KbmPresetValue[];
  attribute: AttributeItemType | null;
  attributeId: string;
  organizationId: string;
  translationNamespace?: string;
  value: KbmPresetValue;
  valueType: KbmAttributeValueType;
}

const KbmBatangManualModalDelete = ({
  allPresets,
  attribute,
  attributeId,
  organizationId,
  translationNamespace,
  value,
  valueType,
}: KbmBatangManualModalDeleteProps) => {
  const namespace = translationNamespace ?? "kbm-batang-manual";
  const { t } = useTranslation(["common", namespace]);
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const isNumber = valueType === "number";

  const { mutate: updateAttribute, isPending } = useUpdateAttributeDataMutation(
    {
      attributeId,
      organizationId,
    }
  );

  const handleDelete = () => {
    // Remove the value from presets
    const newPresets = isNumber
      ? allPresets
          .map((p) => parseInt(String(p), 10))
          .filter((n) => !isNaN(n))
          .filter((p) => p !== parseInt(String(value), 10))
          .sort((a, b) => a - b)
          .map(String)
      : allPresets
          .map((p) => String(p).trim())
          .filter((p) => p !== String(value).trim())
          .filter((p) => p.length > 0)
          .sort((a, b) => a.localeCompare(b))
          .map(String);

    updateAttribute(
      {
        description: attribute?.description,
        name: attribute?.name,
        presets: newPresets,
        type: attribute?.type,
        unit: attribute?.unit,
      },
      {
        onError: (error) => {
          toastError(error);
        },
        onSuccess: () => {
          toast.success(t(`${namespace}:toast.deleteSuccess`));
          queryClient.invalidateQueries({
            queryKey: KEY_USE_GET_ATTRIBUTE_DATA(organizationId),
          });
          setIsOpen(false);
        },
      }
    );
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button size="icon" variant="outline">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t(`${namespace}:modal.delete.title`, "Delete Value")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t(
              `${namespace}:modal.delete.description`,
              "Are you sure you want to delete this value? This action cannot be undone."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-md bg-muted p-4 my-2">
          <p className="text-sm text-muted-foreground">
            {t(
              `${namespace}:modal.delete.valueToDelete`,
              "Value to delete"
            )}
            :
          </p>
          <p className="font-mono text-2xl font-bold text-foreground">{value}</p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {t("common:cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
          >
            {isPending
              ? t("common:deleting", "Deleting...")
              : t("common:delete.continue", "Delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default KbmBatangManualModalDelete;
