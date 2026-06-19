"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
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

interface KbmBatangManualModalAddProps {
  attribute: AttributeItemType | null;
  attributeId: string;
  organizationId: string;
  presets: KbmPresetValue[];
  translationNamespace?: string;
  valueType: KbmAttributeValueType;
}

const KbmBatangManualModalAdd = ({
  attribute,
  attributeId,
  organizationId,
  presets,
  translationNamespace,
  valueType,
}: KbmBatangManualModalAddProps) => {
  const namespace = translationNamespace ?? "kbm-batang-manual";
  const { t } = useTranslation(["common", namespace]);
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const isNumber = valueType === "number";

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
          const numericPresets = presets
            .map((p) => parseInt(String(p), 10))
            .filter((n) => !isNaN(n));
          return !numericPresets.includes(parseInt(normalized, 10));
        }

        const textPresets = presets.map((p) => String(p).trim());
        return !textPresets.includes(normalized);
      }, {
        message: t(`${namespace}:validation.duplicate`),
      }),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    defaultValues: {
      value: "",
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
    form.reset();
  };

  const onSubmit = (values: FormValues) => {
    const normalizedValue = values.value.trim();
    const newPresets = isNumber
      ? [...presets, parseInt(normalizedValue, 10)]
          .map((p) => parseInt(String(p), 10))
          .filter((n) => !isNaN(n))
          .sort((a, b) => a - b)
          .map(String)
      : [...presets, normalizedValue]
          .map((p) => String(p).trim())
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
          toast.success(t(`${namespace}:toast.addSuccess`));
          handleSuccess();
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          {t(`${namespace}:buttons.add`, "Add Value")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {t(`${namespace}:modal.add.title`, "Add New Value")}
          </DialogTitle>
          <DialogDescription>
            {t(
              `${namespace}:modal.add.description`,
              "Enter a new preset value. Values must be unique positive integers."
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
                    {t(`${namespace}:modal.add.valueLabel`, "Value")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      autoFocus
                      inputMode={isNumber ? "numeric" : undefined}
                      pattern={isNumber ? "[0-9]*" : undefined}
                      placeholder={t(
                        `${namespace}:modal.add.valuePlaceholder`,
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

export default KbmBatangManualModalAdd;
