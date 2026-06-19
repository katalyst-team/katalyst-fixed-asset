/* eslint-disable max-lines */
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ImageUploadWithCamera } from "@/components/ui/image-upload-with-camera";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/context/user-context";
import useGetCategoryDataQuery from "@/hooks/api/category/useGetCategoryDataQuery";
import { USE_GET_PRODUCT_DATA_QUERY_KEY } from "@/hooks/api/product/useGetProductDataQuery";
import { useCreateSkuDataMutation } from "@/hooks/api/sku/useCreateSkuDataMutation";
import { KEY_USE_GET_SKU_DATA } from "@/hooks/api/sku/useGetSKUDataQuery";
import useUpdateSkuMutation from "@/hooks/api/sku/useUpdateSkuMutation";
import useGetStoreDataQuery from "@/hooks/api/store/useGetStoreDataQuery";
import { toastError } from "@/services";
import { AttributeItemType, AttributeTypeEnum } from "@/types/attribute";
import { CategoryItemType } from "@/types/category";
import { SkuItemType, SkuStatus, SkuType } from "@/types/sku";

import { AttributeValueInput } from "./components/AttributeValueInput";
import { skuFormSchema, SkuFormValues } from "./schemas/skuFormSchema";
import { useSkuStore } from "./store/SkuStore";

interface SkuFormPageProps {
  sku?: SkuItemType;
}

type CategoryAttributeItem = {
  attribute: AttributeItemType;
  is_required: boolean;
};

/**
 * Full-page component for adding or editing a SKU with improved UX/UI
 */
export const SkuFormPage = ({ sku }: SkuFormPageProps) => {
  const { t } = useTranslation(["sku"]);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { tokenPayload, selectedTeam } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const isEditMode = Boolean(sku);

  const { resetPagination, setFilters } = useSkuStore(
    useShallow((state) => ({
      resetPagination: state.resetPagination,
      setFilters: state.setFilters,
    })),
  );

  // Form state
  const [selectedParentCategoryId, setSelectedParentCategoryId] = useState("");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState("");
  const [categoryAttributes, setCategoryAttributes] = useState<CategoryAttributeItem[]>([]);
  const [attributeValues, setAttributeValues] = useState<Record<string, string | number | string[]>>({});
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // API hooks
  const { data: categoryData, isLoading: isCategoriesLoading } = useGetCategoryDataQuery({ organizationId });
  const { data: storeData } = useGetStoreDataQuery({ organizationId });
  const { mutateAsync: createSkuData } = useCreateSkuDataMutation();
  const { mutateAsync: updateSkuData } = useUpdateSkuMutation();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SkuFormValues>({
    defaultValues: {
      categoryId: sku?.categories?.[0]?.id || "",
      internal_code: sku?.internal_code || "",
      name: sku?.name || "",
      storeId: sku?.store?.id || selectedTeam || "0",
    },
    resolver: zodResolver(skuFormSchema),
  });

  const watchedStoreId = useWatch({ control, name: "storeId" });
  const storeIdForRef = watchedStoreId && watchedStoreId !== "0" ? watchedStoreId : undefined;

  // Derived category state
  const parentCategories: CategoryItemType[] = categoryData?.data?.categories ?? [];
  const selectedParent = parentCategories.find((c) => c.id === selectedParentCategoryId);
  const subCategories: CategoryItemType[] = selectedParent?.subcategories ?? [];
  const isDirectMode =
    Boolean(selectedParent) &&
    subCategories.length === 0 &&
    (selectedParent?.attribute_items?.length ?? 0) > 0;

  const activeCategoryId = isDirectMode ? selectedParentCategoryId : selectedSubCategoryId;
  const activeCategory: CategoryItemType | undefined = isDirectMode
    ? selectedParent
    : subCategories.find((s) => s.id === selectedSubCategoryId);

  useEffect(() => {
    setHasUnsavedChanges(isDirty || Object.keys(attributeValues).length > 0 || imageUrls.length > 0);
  }, [isDirty, attributeValues, imageUrls]);

  // Initialize form for edit mode
  useEffect(() => {
    if (!isEditMode || !sku) return;
    setValue("name", sku.name);
    setValue("internal_code", sku.internal_code || "");
    setValue("storeId", sku.store?.id || "0");
    if (sku.image_urls && sku.image_urls.length > 0) {
      setImageUrls(sku.image_urls);
    }
  }, [sku, isEditMode, setValue]);

  // Resolve edit mode category → parent + sub
  useEffect(() => {
    if (!isEditMode || !sku || !categoryData?.data?.categories) return;
    const savedId = sku.categories?.[0]?.id;
    if (!savedId) return;

    const asRoot = categoryData.data.categories.find((c) => c.id === savedId);
    if (asRoot) {
      setSelectedParentCategoryId(savedId);
      setValue("categoryId", savedId);
      return;
    }

    for (const parent of categoryData.data.categories) {
      const sub = parent.subcategories?.find((s) => s.id === savedId);
      if (sub) {
        setSelectedParentCategoryId(parent.id);
        setSelectedSubCategoryId(savedId);
        setValue("categoryId", savedId);
        return;
      }
    }
  }, [sku, isEditMode, categoryData, setValue]);

  // Load attributes from active category + pre-fill defaults (create only)
  useEffect(() => {
    if (!activeCategory) {
      setCategoryAttributes([]);
      return;
    }

    const attributeItems = activeCategory.attribute_items ?? [];
    const typedAttributes = attributeItems.map((item) => ({
      attribute: item.attribute as unknown as AttributeItemType,
      is_required: item.is_required,
    }));
    setCategoryAttributes(typedAttributes);

    if (!isEditMode) {
      // Pre-fill defaults from active category
      const defaults: Record<string, string | number | string[]> = {};
      activeCategory.attribute_defaults?.forEach((d) => {
        if (d.values.length > 0) {
          const attrId = d.attribute.attribute.id;
          const attrType = d.attribute.attribute.type;
          if (attrType === AttributeTypeEnum.CHECKBOX) {
            defaults[attrId] = d.values;
          } else if (attrType === AttributeTypeEnum.NUMBER) {
            const num = parseFloat(d.values[0]);
            defaults[attrId] = isNaN(num) ? d.values[0] : num;
          } else {
            defaults[attrId] = d.values[0];
          }
        }
      });
      setAttributeValues(defaults);
      return;
    }

    // Edit mode: populate from SKU data
    if (sku && typedAttributes.length > 0 && sku.attributes && sku.attributes.length > 0) {
      const processedValues: Record<string, string | number | string[]> = {};
      sku.attributes.forEach((skuAttr) => {
        const attrId = skuAttr.attribute_id;
        const rawValues = skuAttr.Values;
        const attributeDef = typedAttributes.find((a) => a.attribute.id === attrId);
        if (attributeDef && rawValues && rawValues.length > 0) {
          const attrType = attributeDef.attribute.type;
          switch (attrType) {
            case AttributeTypeEnum.NUMBER: {
              const numValue = parseFloat(rawValues[0]);
              processedValues[attrId] = isNaN(numValue) ? 0 : numValue;
              break;
            }
            case AttributeTypeEnum.BOOLEAN:
              processedValues[attrId] = rawValues[0] === "true" ? "true" : "false";
              break;
            case AttributeTypeEnum.CHECKBOX:
              processedValues[attrId] = rawValues;
              break;
            case AttributeTypeEnum.REFERENCE_GROUP:
            case AttributeTypeEnum.SELECT:
            case AttributeTypeEnum.TEXT:
            case AttributeTypeEnum.DATETIME:
            case AttributeTypeEnum.DATE:
            default:
              processedValues[attrId] = rawValues[0] || "";
              break;
          }
        }
      });
      setAttributeValues(processedValues);
    }
  }, [activeCategory, activeCategoryId, categoryData, isEditMode, sku]);

  const handleParentCategoryChange = (parentId: string) => {
    setSelectedParentCategoryId(parentId);
    setSelectedSubCategoryId("");
    setValue("categoryId", parentId, { shouldValidate: true });
    setAttributeValues({});
  };

  const handleSubCategoryChange = (subId: string) => {
    setSelectedSubCategoryId(subId);
    setValue("categoryId", subId, { shouldValidate: true });
    setAttributeValues({});
  };

  const handleAttributeValueChange = (attributeId: string, value: string | number | string[]) => {
    setAttributeValues((prev) => ({ ...prev, [attributeId]: value }));
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        t("form.unsavedChanges", "You have unsaved changes. Are you sure you want to leave?"),
      );
      if (!confirmed) return;
    }
    router.push("/dashboard/sku");
  };

  const isAttributeValueEmpty = (value: string | number | string[] | undefined): boolean => {
    if (value === null || value === undefined) return true;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === "string") return value.trim() === "";
    return false;
  };

  const onSubmit = async (data: SkuFormValues) => {
    setIsProcessing(true);
    try {
      const missingRequired = categoryAttributes
        .filter((item) => item.is_required)
        .filter((item) => isAttributeValueEmpty(attributeValues[item.attribute.id]));

      if (missingRequired.length > 0) {
        const missingNames = missingRequired.map((item) => item.attribute.name).join(", ");
        toast.error(
          t("form.missingRequired", {
            attributes: missingNames,
            defaultValue: "Please fill in all required attributes: {{attributes}}",
          }),
        );
        setIsProcessing(false);
        return;
      }

      const attribute_items = Object.entries(attributeValues).map(([attribute_id, values]) => ({
        attribute_id,
        values,
      }));

      const finalCategoryId = activeCategoryId || data.categoryId;

      if (isEditMode && sku) {
        await updateSkuData({
          attribute_items,
          category_ids: finalCategoryId ? [finalCategoryId] : [],
          image_urls: imageUrls,
          internal_code: data.internal_code,
          name: data.name,
          organization_id: organizationId,
          sku_id: sku.id,
          sku_type: SkuType.COMMON,
          store_id: data.storeId,
        });
        toast.success(t("form.updateSuccess", "SKU updated successfully"));
      } else {
        await createSkuData({
          attribute_items,
          category_ids: finalCategoryId ? [finalCategoryId] : [],
          image_urls: imageUrls,
          internal_code: data.internal_code,
          name: data.name,
          organization_id: organizationId,
          sku: "",
          sku_type: SkuType.COMMON,
          status: SkuStatus.ACTIVE,
          store_id: data.storeId,
        });
        toast.success(t("form.createSuccess", "SKU created successfully"));
      }

      setFilters({ type: SkuType.COMMON });
      resetPagination();
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_SKU_DATA(organizationId, { type: SkuType.COMMON }),
      });
      if (organizationId) {
        queryClient.invalidateQueries({ queryKey: USE_GET_PRODUCT_DATA_QUERY_KEY(organizationId) });
      }

      setHasUnsavedChanges(false);
      router.push("/dashboard/sku");
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
              {t("form.backToList", "Back to SKU List")}
            </Button>
          </div>
          <CardTitle className="text-2xl font-bold font-heading">
            {isEditMode ? t("form.editTitle", "Edit SKU") : t("form.createTitle", "Create New SKU")}
          </CardTitle>
          <CardDescription className="text-base">
            {isEditMode
              ? t("form.editDescription", "Update the details of your SKU. Changes will be reflected across all inventory records.")
              : t("form.createDescription", "Add a new SKU to your product catalog. This will allow you to track and manage inventory for this item.")}
          </CardDescription>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Basic Information Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t("form.section.basicInfo", "Basic Information")}</CardTitle>
            <CardDescription>
              {t("form.section.basicInfoDescription", "Essential details to identify and categorize your SKU")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* SKU Name */}
            <div className="space-y-2">
              <Label className="text-base font-medium" htmlFor="name">
                {t("form.field.name", "SKU Name")}
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
                    placeholder={t("form.field.namePlaceholder", "e.g., Cotton T-Shirt Blue Size M")}
                  />
                )}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              <p className="text-sm text-muted-foreground">
                {t("form.field.nameHelp", "Choose a descriptive name that clearly identifies this product")}
              </p>
            </div>

            {/* Internal Code */}
            <div className="space-y-2">
              <Label className="text-base font-medium" htmlFor="internal_code">
                {t("form.field.internalCode", "Internal Code")}
              </Label>
              <Controller
                control={control}
                name="internal_code"
                render={({ field }) => (
                  <Input
                    {...field}
                    disabled={isDisabled}
                    id="internal_code"
                    placeholder={t("form.field.internalCodePlaceholder", "e.g., INT-001")}
                  />
                )}
              />
              <p className="text-sm text-muted-foreground">
                {t("form.field.internalCodeHelp", "Optional internal code for your reference")}
              </p>
            </div>

            <Separator />

            {/* Store Selection */}
            <div className="space-y-2">
              <Label className="text-base font-medium" htmlFor="storeId">
                {t("form.field.store", "Store")}
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Controller
                control={control}
                name="storeId"
                render={({ field }) => (
                  <Select disabled={isDisabled} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("form.field.storePlaceholder", "Select a store...")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">{t("form.field.allStores", "All Stores")}</SelectItem>
                      {storeData?.data.stores?.map((store) => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.storeId && <p className="text-sm text-destructive">{errors.storeId.message}</p>}
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                Pastikan store yang dipilih sudah benar sebelum menyimpan
              </p>
              <p className="text-sm text-muted-foreground">
                {t("form.field.storeHelp", "Select the store where this SKU will be available")}
              </p>
            </div>

            <Separator />

            {/* Parent Category Selection */}
            <div className="space-y-2">
              <Label className="text-base font-medium" htmlFor="parentCategory">
                {t("form.field.category", "Category")}
              </Label>
              <Select
                disabled={isDisabled || isCategoriesLoading}
                value={selectedParentCategoryId}
                onValueChange={handleParentCategoryChange}
              >
                <SelectTrigger className="w-full" id="parentCategory">
                  <SelectValue
                    placeholder={t("form.field.categoryPlaceholder", "Select a category for this SKU")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {parentCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-sm text-destructive">{errors.categoryId.message}</p>
              )}
              <p className="text-sm text-muted-foreground">
                {t("form.field.categoryHelp", "Category determines which attributes are available for this SKU")}
              </p>
            </div>

            {/* Sub Category Selection — only shown when parent has subcategories */}
            {subCategories.length > 0 && (
              <div className="space-y-2">
                <Label className="text-base font-medium" htmlFor="subCategory">
                  {t("form.field.subCategory", "Sub Category")}
                </Label>
                <Select
                  disabled={isDisabled}
                  value={selectedSubCategoryId}
                  onValueChange={handleSubCategoryChange}
                >
                  <SelectTrigger className="w-full" id="subCategory">
                    <SelectValue
                      placeholder={t("form.field.subCategoryPlaceholder", "Select a sub category")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {subCategories.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {sub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Images Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t("form.section.images", "Product Images")}</CardTitle>
            <CardDescription>
              {t("form.section.imagesDescription", "Upload high-quality images to help identify your products")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUploadWithCamera
              description={t(
                "form.field.imageDescription",
                "Upload up to 5 images. You can take photos with your camera or choose from your device.",
              )}
              disabled={isDisabled}
              featureId="product"
              initialImages={imageUrls}
              label={t("form.field.imageLabel", "Product Images")}
              maxImages={5}
              prefix="sku-image"
              onImagesChange={setImageUrls}
            />
          </CardContent>
        </Card>

        {/* Attributes Section */}
        {activeCategoryId && categoryAttributes.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t("form.section.attributes", "Product Attributes")}</CardTitle>
              <CardDescription>
                {t(
                  "form.section.attributesDescription",
                  "Provide detailed specifications for this SKU. Fields marked with * are required.",
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isCategoriesLoading ? (
                <div className="text-sm text-muted-foreground py-8 text-center">
                  {t("form.loadingAttributes", "Loading attributes...")}
                </div>
              ) : (
                <div className="space-y-6">
                  {categoryAttributes.map((attributeItem, index) => (
                    <div key={attributeItem.attribute.id}>
                      {index > 0 && <Separator className="my-6" />}
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <Label className="text-base font-medium">
                              {attributeItem.attribute.name}
                              {attributeItem.is_required && (
                                <span className="text-destructive ml-1">*</span>
                              )}
                            </Label>
                            {attributeItem.attribute.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {attributeItem.attribute.description}
                              </p>
                            )}
                          </div>
                          <span className="text-xs px-2 py-1 bg-muted rounded-md text-muted-foreground font-mono">
                            {attributeItem.attribute.type}
                          </span>
                        </div>
                        <AttributeValueInput
                          attribute={attributeItem.attribute}
                          initialValue={attributeValues[attributeItem.attribute.id] || ""}
                          organizationId={organizationId}
                          storeId={storeIdForRef}
                          onChange={(value) =>
                            handleAttributeValueChange(attributeItem.attribute.id, value)
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
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
              <Button className="sm:order-2" disabled={isProcessing} type="submit">
                {isProcessing
                  ? isEditMode
                    ? t("form.button.updating", "Updating...")
                    : t("form.button.creating", "Creating...")
                  : isEditMode
                    ? t("form.button.update", "Update SKU")
                    : t("form.button.create", "Create SKU")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};
