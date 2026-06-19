import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/user-context";
import useGetCategoryDataQuery from "@/hooks/api/category/useGetCategoryDataQuery";
import { USE_GET_PRODUCT_DATA_QUERY_KEY } from "@/hooks/api/product/useGetProductDataQuery";
import { useCreateSkuDataMutation } from "@/hooks/api/sku/useCreateSkuDataMutation";
import { KEY_USE_GET_SKU_DATA } from "@/hooks/api/sku/useGetSKUDataQuery";
import useUpdateSkuMutation from "@/hooks/api/sku/useUpdateSkuMutation";
import useGetStoreDataQuery from "@/hooks/api/store/useGetStoreDataQuery";
import { toastError } from "@/services";
import { AttributeItemType, AttributeTypeEnum } from "@/types/attribute";
import { SkuItemType, SkuStatus, SkuType } from "@/types/sku";

import { useKbmGradeConfig } from "../kbm-grade/KbmGradeConfigContext";
import KbmItemAttributesCard from "./components/KbmItemAttributesCard";

const ATTR_TYPE = "G_TYPE";

const kbmItemFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
});

type KbmItemFormValues = z.infer<typeof kbmItemFormSchema>;

interface KbmItemFormPageProps {
  itemData?: SkuItemType;
}

type CategoryAttributeItem = {
  attribute: AttributeItemType;
  is_required: boolean;
};

/**
 * Dynamic full-page form for adding or editing a KBM Item.
 * All category attributes are rendered automatically — no hardcoded attribute list.
 */
export const KbmItemFormPage = ({ itemData }: KbmItemFormPageProps) => {
  const { basePath, gradeType, title, translationNamespace } =
    useKbmGradeConfig();
  const { t } = useTranslation([translationNamespace]);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { tokenPayload, selectedTeam } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const isEditMode = Boolean(itemData);

  const defaultStoreId = selectedTeam !== "0" ? selectedTeam : "all";
  const [selectedStoreId, setSelectedStoreId] = useState<string>(
    isEditMode && itemData?.store?.id ? itemData.store.id : defaultStoreId
  );

  const { data: storeData } = useGetStoreDataQuery({ organizationId });
  const stores = storeData?.data?.stores ?? [];

  const [categoryAttributes, setCategoryAttributes] = useState<
    CategoryAttributeItem[]
  >([]);
  const [attributeValues, setAttributeValues] = useState<
    Record<string, string | number | string[]>
  >({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { data: categoryData, isLoading: isCategoriesLoading } =
    useGetCategoryDataQuery({ limit: 200, organizationId });
  const { mutateAsync: createSkuData } = useCreateSkuDataMutation();
  const { mutateAsync: updateSkuData } = useUpdateSkuMutation();

  // Find category by title name (e.g. "KBM Department")
  const kbmCategory = useMemo(() => {
    if (!categoryData?.data?.categories) return null;
    return (
      categoryData.data.categories.find(
        (category) => category.name === title,
      ) ?? null
    );
  }, [categoryData, title]);

  const kbmCategoryId = kbmCategory?.id;

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<KbmItemFormValues>({
    defaultValues: { name: itemData?.name || "" },
    resolver: zodResolver(kbmItemFormSchema),
  });

  useEffect(() => {
    setHasUnsavedChanges(isDirty || Object.keys(attributeValues).length > 0);
  }, [isDirty, attributeValues]);

  // Load all category attributes (excluding G_TYPE — set automatically)
  useEffect(() => {
    if (!kbmCategory) {
      setCategoryAttributes([]);
      return;
    }
    const attributeItems = kbmCategory.attribute_items || [];
    const typed = attributeItems
      .filter((item) => item.attribute?.name !== ATTR_TYPE)
      .map((item) => ({
        attribute: item.attribute as unknown as AttributeItemType,
        is_required: item.is_required,
      }));
    setCategoryAttributes(typed);
    if (!isEditMode) setAttributeValues({});
  }, [kbmCategory, isEditMode]);

  useEffect(() => {
    if (isEditMode && itemData) setValue("name", itemData.name);
  }, [itemData, isEditMode, setValue]);

  // Pre-fill attribute values in edit mode
  useEffect(() => {
    if (
      isEditMode &&
      itemData &&
      categoryAttributes.length > 0 &&
      itemData.attributes &&
      itemData.attributes.length > 0
    ) {
      const processed: Record<string, string | number | string[]> = {};
      itemData.attributes.forEach((skuAttr) => {
        const attrId = skuAttr.attribute_id;
        const rawValues = skuAttr.Values ?? skuAttr.values;
        const attributeDef = categoryAttributes.find(
          (ca) => ca.attribute.id === attrId,
        );
        if (attributeDef && rawValues && rawValues.length > 0) {
          if (attributeDef.attribute.type === AttributeTypeEnum.NUMBER) {
            const num = parseFloat(rawValues[0]);
            processed[attrId] = isNaN(num) ? 0 : num;
          } else if (
            attributeDef.attribute.type === AttributeTypeEnum.CHECKBOX
          ) {
            processed[attrId] = rawValues;
          } else {
            processed[attrId] = rawValues[0] || "";
          }
        }
      });
      setAttributeValues(processed);
    }
  }, [itemData, isEditMode, categoryAttributes]);

  const typeAttrId = useMemo(() => {
    if (!kbmCategory?.attribute_items) return undefined;
    const typeItem = kbmCategory.attribute_items.find(
      (item) => item.attribute?.name === ATTR_TYPE,
    );
    return typeItem?.attribute?.id;
  }, [kbmCategory]);

  const handleAttributeChange = (
    attributeId: string,
    value: string | number | string[],
  ) => {
    setAttributeValues((prev) => ({ ...prev, [attributeId]: value }));
  };

  const isAttributeValueEmpty = (
    value: string | number | string[] | undefined,
  ): boolean => {
    if (value === null || value === undefined) return true;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === "string") return value.trim() === "";
    return false;
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        t(
          "form.unsavedChanges",
          "You have unsaved changes. Are you sure you want to leave?",
        ),
      );
      if (!confirmed) return;
    }
    router.push(basePath);
  };

  const onSubmit = async (data: KbmItemFormValues) => {
    if (!kbmCategoryId) {
      toast.error(
        t(
          "form.categoryNotFound",
          `${title} category not found. Please create the category first.`,
        ),
      );
      return;
    }

    setIsProcessing(true);
    try {
      // Validate required attributes
      const missingRequired = categoryAttributes
        .filter((item) => item.is_required)
        .filter((item) =>
          isAttributeValueEmpty(attributeValues[item.attribute.id]),
        );

      if (missingRequired.length > 0) {
        const missingNames = missingRequired
          .map((item) => item.attribute.name)
          .join(", ");
        toast.error(
          t("form.missingRequired", {
            attributes: missingNames,
            defaultValue:
              "Please fill in all required attributes: {{attributes}}",
          }),
        );
        setIsProcessing(false);
        return;
      }

      // Build attribute_items for API
      const attribute_items: {
        attribute_id: string;
        values: string | number | string[];
      }[] = Object.entries(attributeValues).map(([attributeId, value]) => ({
        attribute_id: attributeId,
        values: value,
      }));

      // Set G_TYPE automatically if the attribute exists
      if (typeAttrId) {
        attribute_items.push({
          attribute_id: typeAttrId,
          values: gradeType,
        });
      }

      if (isEditMode && itemData) {
        await updateSkuData({
          attribute_items,
          category_ids: [kbmCategoryId],
          image_urls: [],
          name: data.name,
          organization_id: organizationId,
          sku_id: itemData.id,
          sku_type: SkuType.COMMON,
          store_id: selectedStoreId !== "all" ? selectedStoreId : undefined,
        });
        toast.success(t("form.updateSuccess", `${title} updated successfully`));
      } else {
        await createSkuData({
          attribute_items,
          category_ids: [kbmCategoryId],
          image_urls: [],
          name: data.name,
          organization_id: organizationId,
          sku: "",
          sku_type: SkuType.COMMON,
          status: SkuStatus.ACTIVE,
          store_id: selectedStoreId !== "all" ? selectedStoreId : undefined,
        });
        toast.success(t("form.createSuccess", `${title} created successfully`));
      }

      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_SKU_DATA(organizationId),
      });
      if (organizationId) {
        queryClient.invalidateQueries({
          queryKey: USE_GET_PRODUCT_DATA_QUERY_KEY(organizationId),
        });
      }

      setHasUnsavedChanges(false);
      router.push(basePath);
    } catch (err) {
      toastError(err as Error | { message?: string });
    } finally {
      setIsProcessing(false);
    }
  };

  const isDisabled = isSubmitting || isProcessing;

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2 mb-4">
            <Button
              className="text-muted-foreground hover:text-foreground"
              size="sm"
              variant="ghost"
              onClick={handleCancel}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("form.backToList", `Back to ${title} List`)}
            </Button>
          </div>
          <CardTitle className="text-2xl font-bold font-heading">
            {isEditMode
              ? t("form.editTitle", `Edit ${title}`)
              : t("form.createTitle", `Create ${title}`)}
          </CardTitle>
          <CardDescription className="text-base">
            {isEditMode
              ? t(
                  "form.editDescription",
                  `Update the ${title} details. Changes will be reflected across all records.`,
                )
              : t(
                  "form.createDescription",
                  `Add a new ${title} to the master data. Fields marked with * are required.`,
                )}
          </CardDescription>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Basic Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {t("form.section.basicInfo", "Basic Information")}
            </CardTitle>
            <CardDescription>
              {t(
                "form.section.basicInfoDescription",
                `Essential details to identify the ${title}`,
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-base font-medium" htmlFor="name">
                {t("form.field.name", `${title} Name`)}
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <Input
                    {...field}
                    disabled={isDisabled}
                    id="name"
                    placeholder={t(
                      "form.field.namePlaceholder",
                      `e.g., ${title}-001`,
                    )}
                  />
                )}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
              <p className="text-sm text-muted-foreground">
                {t(
                  "form.field.nameHelp",
                  `Choose a descriptive name that clearly identifies this ${title}`,
                )}
              </p>
            </div>

            {/* Store */}
            <div className="space-y-2">
              <Label className="text-base font-medium" htmlFor="store">
                {t("form.field.store", "Store")}
              </Label>
              <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
                <SelectTrigger id="store">
                  <SelectValue placeholder={t("form.field.storeAll", "All Stores")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("form.field.storeAll", "All Stores")}
                  </SelectItem>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                Pastikan store yang dipilih sudah benar sebelum menyimpan
              </p>
              <p className="text-sm text-muted-foreground">
                {t("form.field.storeHelp", "Optionally assign this item to a specific store")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Attributes Section */}
        {!isCategoriesLoading && categoryAttributes.length > 0 && (
          <KbmItemAttributesCard
            attributeValues={attributeValues}
            categoryAttributes={categoryAttributes}
            isDisabled={isDisabled}
            title={title}
            translationNamespace={translationNamespace}
            onAttributeChange={handleAttributeChange}
          />
        )}

        {/* Action Buttons */}
        <Card className="sticky bottom-0 z-10 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Button
                className="sm:order-1"
                disabled={isDisabled}
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                {t("form.button.cancel", "Cancel")}
              </Button>
              <Button
                className="sm:order-2"
                disabled={isProcessing || !kbmCategoryId}
                type="submit"
              >
                {isProcessing
                  ? isEditMode
                    ? t("form.button.updating", "Updating...")
                    : t("form.button.creating", "Creating...")
                  : isEditMode
                    ? t("form.button.update", `Update ${title}`)
                    : t("form.button.create", `Create ${title}`)}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};
