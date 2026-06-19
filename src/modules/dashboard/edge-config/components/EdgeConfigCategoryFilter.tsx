import { useTranslation } from "next-i18next";
import { useMemo } from "react";
import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MultiCombobox } from "@/components/ui/multi-combobox";
import { useUser } from "@/context/user-context";
import useGetCategoryDataQuery from "@/hooks/api/category/useGetCategoryDataQuery";

import type { EdgeConfigFormValues } from "./EdgeConfigModal";

const EdgeConfigCategoryFilter = () => {
  const { t } = useTranslation(["edge-config"]);
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const form = useFormContext<EdgeConfigFormValues>();

  const { data: categoryData } = useGetCategoryDataQuery({
    limit: 10000,
    organizationId,
  });

  const categoryOptions = useMemo(
    () =>
      (categoryData?.data?.categories ?? []).map((c) => ({
        description: "",
        label: c.name,
        presets: [],
        type: "",
        value: c.id,
      })),
    [categoryData?.data?.categories]
  );

  return (
    <FormField
      control={form.control}
      name="parent_category_ids"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {t("modal.form.parentCategories", "Parent Categories")}
          </FormLabel>
          <FormControl>
            <MultiCombobox
              options={categoryOptions}
              placeholder={t(
                "modal.form.parentCategoriesSelect",
                "Select categories to filter..."
              )}
              selectedValues={field.value ?? []}
              onValueChange={field.onChange}
            />
          </FormControl>
          <p className="text-xs text-muted-foreground">
            {t(
              "modal.form.parentCategoriesHint",
              "Only process EPCs whose SKU belongs to one of these categories or their subcategories. Leave empty to process all."
            )}
          </p>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default EdgeConfigCategoryFilter;
