"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { KEY_USE_GET_ATTRIBUTE_DATA } from "@/hooks/api/attribute/useGetAttributeDataQuery";
import useUpdateAttributeDataMutation from "@/hooks/api/attribute/useUpdateAttributeDataMutation";
import { toastError } from "@/services";
import { AttributeItemType } from "@/types/attribute";

import { KbmAttributeValueType, type KbmPresetValue } from "./constants";

interface KbmBatangManualModalEditProps {
  allPresets: KbmPresetValue[];
  attribute: AttributeItemType | null;
  attributeId: string;
  organizationId: string;
  translationNamespace?: string;
  value: KbmPresetValue;
  valueType: KbmAttributeValueType;
}

const KbmBatangManualModalEdit = ({
  allPresets,
  attribute,
  attributeId,
  organizationId,
  translationNamespace,
  value,
  valueType,
}: KbmBatangManualModalEditProps) => {
  const namespace = translationNamespace ?? "kbm-batang-manual";
  const { t } = useTranslation(["common", namespace]);
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const isNumber = valueType === "number";

  // Create schema with dynamic validation for duplicates (excluding current value)
  const formSchema = z.object({
    value: z
      .string()
      .min(1, { message: t(`${namespace}:validation.required`) })
      .refine(
        (val) => (isNumber ? !isNaN(parseInt(val, 10)) : true),
        {
          message: t(`${namespace}:validation.mustBeNumber`),
        }
      )
      .refine((val) => (isNumber ? parseInt(val, 10) > 0 : true), {
        message: t(`${namespace}:validation.mustBePositive`),
      })
      .refine((val) => {
        const normalized = val.trim();
        if (isNumber) {
          const newVal = parseInt(normalized, 10);
          const numericPresets = allPresets
            .map((p) => parseInt(String(p), 10))
            .filter((n) => !isNaN(n));
          const currentValue = parseInt(String(value), 10);
          if (newVal === currentValue) return true;
          return !numericPresets.includes(newVal);
        }

        const textPresets = allPresets.map((p) => String(p).trim());
        const currentValue = String(value).trim();
        if (normalized === currentValue) return true;
        return !textPresets.includes(normalized);
      }, {
        message: t(`${namespace}:validation.duplicate`),
      }),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    defaultValues: {
      value: String(value),
    },
    resolver: zodResolver(formSchema),
  });

  const { mutate: updateAttribute, isPending } = useUpdateAttributeDataMutation(
    {
      attributeId,
      organizationId,
    }
  );

  const handleSuccess = () => {
    queryClient.invalidateQueries({
      queryKey: KEY_USE_GET_ATTRIBUTE_DATA(organizationId),
    });
    setIsOpen(false);
  };

  const onSubmit = (values: FormValues) => {
    const normalizedValue = values.value.trim();
    const newPresets = isNumber
      ? allPresets
          .map((p) => parseInt(String(p), 10))
          .filter((n) => !isNaN(n))
          .map((p) =>
            p === parseInt(String(value), 10)
              ? parseInt(normalizedValue, 10)
              : p
          )
          .sort((a, b) => a - b)
          .map(String)
      : allPresets
          .map((p) => String(p).trim())
          .map((p) =>
            p === String(value).trim() ? normalizedValue : p
          )
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
          toast.success(t(`${namespace}:toast.editSuccess`));
          handleSuccess();
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="outline">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {t(`${namespace}:modal.edit.title`, "Edit Value")}
          </DialogTitle>
          <DialogDescription>
            {t(
              `${namespace}:modal.edit.description`,
              "Change the preset value. Values must be unique positive integers."
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t(`${namespace}:modal.edit.valueLabel`, "Value")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      autoFocus
                      inputMode={isNumber ? "numeric" : undefined}
                      pattern={isNumber ? "[0-9]*" : undefined}
                      placeholder={t(
                        `${namespace}:modal.edit.valuePlaceholder`,
                        isNumber ? "Enter a number" : "Enter a value"
                      )}
                      type="text"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-md bg-muted p-3">
              <p className="text-sm text-muted-foreground">
                {t(
                  `${namespace}:modal.edit.currentValue`,
                  "Current value"
                )}
                :{" "}
                <span className="font-mono font-semibold text-foreground">
                  {value}
                </span>
              </p>
            </div>

            <DialogFooter className="gap-2 sm:justify-start">
              <Button disabled={isPending} type="submit">
                {isPending ? t("common:submitting") : t("common:save")}
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  {t("common:cancel")}
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default KbmBatangManualModalEdit;
