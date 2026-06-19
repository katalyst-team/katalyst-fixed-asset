"use client";

import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useMemo } from "react";
import { Control, useFieldArray } from "react-hook-form";

import { InputWithLabel } from "@/components/shared/InputWithLabel";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useUser } from "@/context/user-context";
import { useGetSkuDataQuery } from "@/hooks/api/sku/useGetSKUDataQuery";

interface PackingItemsSelectorProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  name: string;
}

export default function PackingItemsSelector({
  control,
  name,
}: PackingItemsSelectorProps) {
  const { t } = useTranslation(["packing-collection"]);
  const { tokenPayload, selectedTeam } = useUser();

  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  const { data: skuData, isLoading: isLoadingSkus } = useGetSkuDataQuery({
    filters: {
      assigned_store_id: selectedTeam !== "0" ? selectedTeam : undefined,
      limit: 10000,
    },
    organizationId: tokenPayload?.organization_id ?? "",
  });

  const skuOptions = useMemo(() => {
    if (!skuData?.data?.skus) return [];
    return skuData.data.skus.map((sku) => ({
      label: sku.name,
      value: sku.id,
    }));
  }, [skuData]);

  const getSkuName = (skuId: string) => {
    const sku = skuData?.data?.skus?.find((s) => s.id === skuId);
    return sku?.name || "";
  };

  return (
    <div className="space-y-4">
      <div>
        <FormLabel>{t("form.packingItems.label")}</FormLabel>
        <p className="text-sm text-muted-foreground">
          {t("form.packingItems.description")}
        </p>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-2 items-end">
          <div className="flex-1">
            <FormField
              control={control}
              name={`${name}.${index}.sku_id`}
              render={({ field: skuField }) => (
                <FormItem>
                  <FormLabel>
                    {t("form.packingItems.sku")}
                    <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Combobox
                      disabled={isLoadingSkus}
                      options={skuOptions}
                      placeholder={
                        isLoadingSkus
                          ? t("loading", "Loading...")
                          : t("form.packingItems.selectSku")
                      }
                      value={skuField.value}
                      onSelect={(value) => {
                        skuField.onChange(value);
                        // Update the sku_name field as well
                        if (value) {
                          control._formValues[name][index].sku_name =
                            getSkuName(value);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-32">
            <FormField
              control={control}
              name={`${name}.${index}.quantity`}
              render={({ field: quantityField }) => (
                <FormItem>
                  <FormLabel>
                    {t("form.packingItems.quantity")}
                    <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <InputWithLabel
                      min="1"
                      type="number"
                      value={quantityField.value || ""}
                      onChange={(e) =>
                        quantityField.onChange(Number(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {fields.length > 1 && (
            <Button
              className="h-8 w-8 p-0"
              size="sm"
              type="button"
              variant="ghost"
              onClick={() => remove(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}

      <Button
        className="mt-2"
        type="button"
        variant="outline"
        onClick={() => append({ quantity: 1, sku_id: "", sku_name: "" })}
      >
        <Plus className="mr-2 h-4 w-4" />
        {t("form.packingItems.addItem")}
      </Button>
    </div>
  );
}
