/* eslint-disable max-lines */
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "next-i18next";
import { ReactNode, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";

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
import { ImageUploadWithCamera } from "@/components/ui/image-upload-with-camera";
// File input will use native input type="file"
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
import { useCreateSkuDataMutation } from "@/hooks/api/sku/useCreateSkuDataMutation";
import { KEY_USE_GET_SKU_DATA } from "@/hooks/api/sku/useGetSKUDataQuery";
import useUpdateSkuMutation from "@/hooks/api/sku/useUpdateSkuMutation";
import { toastError } from "@/services";
import { AttributeItemType, AttributeTypeEnum } from "@/types/attribute";
import { SkuItemType, SkuStatus, SkuType } from "@/types/sku";

import { AttributeValueInput } from "./components/AttributeValueInput";
import { skuFormSchema, SkuFormValues } from "./schemas/skuFormSchema";
import { useSkuStore } from "./store/SkuStore";

interface SkuModalAddSkuProps {
  trigger: ReactNode;
  sku?: SkuItemType; // If provided, component will be in edit mode
}

/**
 * Modal component for adding or editing a SKU with attributes
 */
export const SkuModalAddSkuRefactored = ({
  trigger,
  sku,
}: SkuModalAddSkuProps) => {
  const { t } = useTranslation(["sku"]);
  const queryClient = useQueryClient();
  const { tokenPayload, selectedTeam, stores } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const isEditMode = Boolean(sku);

  // Get store values for query invalidation and pagination reset
  const { resetPagination, setFilters } = useSkuStore(
    useShallow((state) => ({
      resetPagination: state.resetPagination,
      setFilters: state.setFilters,
    })),
  );

  // Modal state
  const [open, setOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  type CategoryAttributeItem = {
    attribute: AttributeItemType;
    is_required: boolean;
  };

  const [categoryAttributes, setCategoryAttributes] = useState<
    CategoryAttributeItem[]
  >([]);
  const [attributeValues, setAttributeValues] = useState<
    Record<string, string | number | string[]>
  >({});
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // API hooks
  const { data: categoryData, isLoading: isCategoriesLoading } =
    useGetCategoryDataQuery({
      organizationId,
    });
  const { mutateAsync: createSkuData } = useCreateSkuDataMutation();
  const { mutateAsync: updateSkuData } = useUpdateSkuMutation();

  // Form setup with react-hook-form
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SkuFormValues>({
    defaultValues: {
      categoryId: sku?.categories?.[0]?.id || "",
      name: sku?.name || "",
      storeId: sku?.store?.id || selectedTeam || "0",
    },
    resolver: zodResolver(skuFormSchema),
  });

  // Initialize attribute values when category is selected
  useEffect(() => {
    if (!selectedCategoryId || !categoryData?.data?.categories) {
      setCategoryAttributes([]);
      return;
    }

    // Find the selected category
    const category = categoryData.data.categories.find(
      (c: { id: string }) => c.id === selectedCategoryId,
    );
    if (!category) {
      setCategoryAttributes([]);
      return;
    }

    const attributeItems = category.attribute_items || [];
    const typedAttributes = attributeItems.map((item) => ({
      attribute: item.attribute as unknown as AttributeItemType,
      is_required: item.is_required,
    }));

    setCategoryAttributes(typedAttributes);
    if (!isEditMode) {
      setAttributeValues({});
    }
  }, [selectedCategoryId, categoryData, isEditMode]);

  // Initialize form for edit mode
  useEffect(() => {
    if (isEditMode && sku && open) {
      // Set basic form values
      setValue("name", sku.name);

      // Set category and trigger category selection effect
      if (sku.categories && sku.categories.length > 0) {
        const categoryId = sku.categories[0].id;
        setValue("categoryId", categoryId);
        setSelectedCategoryId(categoryId);
      }

      // Set store ID
      if (sku.store?.id) {
        setValue("storeId", sku.store.id);
      }
    } else if (!isEditMode && open) {
      // Set default store ID for create mode
      setValue("storeId", selectedTeam || "0");
    }
  }, [sku, isEditMode, setValue, open, selectedTeam]);

  // Initialize attribute values when both SKU data and category attributes are available
  useEffect(() => {
    if (
      isEditMode &&
      sku &&
      categoryAttributes.length > 0 &&
      sku.attributes &&
      sku.attributes.length > 0 &&
      open
    ) {
      const processedValues: Record<string, string | number | string[]> = {};

      sku.attributes.forEach((skuAttr) => {
        const attrId = skuAttr.attribute_id;
        const rawValues = skuAttr.Values;
        const attributeDef = categoryAttributes.find(
          (catAttr) => catAttr.attribute.id === attrId,
        );

        if (attributeDef && rawValues && rawValues.length > 0) {
          const attrType = attributeDef.attribute.type;

          switch (attrType) {
            case AttributeTypeEnum.NUMBER:
              const numValue = parseFloat(rawValues[0]);
              processedValues[attrId] = isNaN(numValue) ? 0 : numValue;
              break;
            case AttributeTypeEnum.BOOLEAN:
              processedValues[attrId] =
                rawValues[0] === "true" ? "true" : "false";
              break;
            case AttributeTypeEnum.CHECKBOX:
              processedValues[attrId] = rawValues;
              break;
            case AttributeTypeEnum.SELECT:
            case AttributeTypeEnum.TEXT:
            case AttributeTypeEnum.DATETIME:
            default:
              processedValues[attrId] = rawValues[0] || "";
              break;
            case AttributeTypeEnum.DATE:
              // Keep date in backend format (YYYY-MM-DD) for proper initialization
              processedValues[attrId] = rawValues[0] || "";
              break;
          }
        }
      });

      setAttributeValues(processedValues);
    }
  }, [sku, isEditMode, categoryAttributes, open]);

  const handleCategoryChange = (categoryId: string) => {
    setValue("categoryId", categoryId, { shouldValidate: true });
    setSelectedCategoryId(categoryId);
  };

  const handleAttributeValueChange = (
    attributeId: string,
    value: string | number | string[],
  ) => {
    setAttributeValues((prev) => ({ ...prev, [attributeId]: value }));
  };

  const resetForm = () => {
    reset();
    setImageUrls([]);
    if (!isEditMode) {
      setSelectedCategoryId("");
      setCategoryAttributes([]);
      setAttributeValues({});
    }
  };

  // Submit handler
  const onSubmit = async (data: SkuFormValues) => {
    setIsProcessing(true);
    try {
      // Prepare attribute items for API submission
      const attribute_items = Object.entries(attributeValues).map(
        ([attributeId, value]) => {
          // Return properly formatted attribute value - no need to wrap in array
          // as the AttributeValueInput already returns values in the correct format:
          // - NUMBER values as number
          // - CHECKBOX values as string[]
          // - Other values as string

          return {
            attribute_id: attributeId,
            values: value,
          };
        },
      );

      // Use uploaded image URLs

      // Submit data to appropriate endpoint based on mode

      if (isEditMode && sku) {
        // Update existing SKU
        await updateSkuData({
          attribute_items,
          category_ids: data.categoryId ? [data.categoryId] : [],
          image_urls: imageUrls,
          name: data.name,
          organization_id: organizationId,
          sku_id: sku.id,
          sku_type: SkuType.COMMON,
        });
        toast.success(
          t("modal.addSku.updateSuccess", "SKU updated successfully"),
        );
      } else {
        // Create new SKU
        await createSkuData({
          attribute_items,
          category_ids: data.categoryId ? [data.categoryId] : [],
          image_urls: imageUrls,
          name: data.name,
          organization_id: organizationId,
          sku: "", // Generated by the backend
          sku_type: SkuType.COMMON,
          status: SkuStatus.ACTIVE,
        });
        toast.success(
          t("modal.addSku.createSuccess", "SKU created successfully"),
        );
      }

      // Clear filters and reset pagination, then invalidate query
      setFilters({ type: SkuType.COMMON });
      resetPagination();
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_SKU_DATA(organizationId, {
          type: SkuType.COMMON,
        }),
      });

      if (organizationId) {
        queryClient.invalidateQueries({
          queryKey: ["products", organizationId],
        });
      }

      setOpen(false);
      resetForm();
    } catch (err) {
      toastError(err as Error | { message?: string });
    } finally {
      setIsProcessing(false);
    }
  };

  const isDisabled = isSubmitting || isProcessing;

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen && !isEditMode) resetForm();
        setOpen(newOpen);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-[425px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0 shrink-0">
          <DialogTitle className="text-xl">
            {isEditMode
              ? t("modal.addSku.editTitle", "Edit SKU")
              : t("modal.addSku.title", "Add New SKU")}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? t("modal.addSku.editDescription", "Edit existing SKU details")
              : t(
                  "modal.addSku.description",
                  "Add a new SKU to manage inventory",
                )}
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col flex-1 min-h-0"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex-1 overflow-y-auto px-6">
            <div className="grid gap-4 py-4">
              {/* SKU Name */}
              <div className="grid gap-2">
                <Label htmlFor="name">{t("modal.addSku.nameLabel")}</Label>
                <Controller
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <Input
                      id="name"
                      placeholder={t("modal.addSku.namePlaceholder")}
                      {...field}
                    />
                  )}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              {/* Internal Code */}
              {/* <div className="grid gap-2">
              <Label htmlFor="internalCode">
                {t("modal.addSku.internalCodeLabel")}
              </Label>
              <Controller
                control={control}
                name="internalCode"
                render={({ field }) => (
                  <Input
                    id="internalCode"
                    placeholder={t("modal.addSku.internalCodePlaceholder")}
                    {...field}
                  />
                )}
              />
              {errors.internalCode && (
                <p className="text-sm text-destructive">
                  {errors.internalCode.message}
                </p>
              )}
            </div> */}

              {/* Category Selection */}
              <div className="grid gap-2">
                <Label htmlFor="categoryId">
                  {t("modal.addSku.categoryLabel", "Category")}
                </Label>
                <Controller
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <Select
                      disabled={isDisabled}
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleCategoryChange(value);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={t(
                            "modal.addSku.selectCategory",
                            "Select a category",
                          )}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryData?.data?.categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.categoryId && (
                  <p className="text-sm text-destructive">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>

              {/* Store Selection */}
              <div className="grid gap-2">
                <Label htmlFor="storeId">
                  {t("modal.addSku.storeLabel", "Store")}
                </Label>
                <Controller
                  control={control}
                  name="storeId"
                  render={({ field }) => (
                    <Select
                      disabled={isDisabled}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={t(
                            "modal.addSku.selectStore",
                            "Select a store",
                          )}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {stores.map((store) => (
                          <SelectItem key={store.id} value={store.id}>
                            {store.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.storeId && (
                  <p className="text-sm text-destructive">
                    {errors.storeId.message}
                  </p>
                )}
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  Pastikan store yang dipilih sudah benar sebelum menyimpan
                </p>
              </div>

              {/* Image Upload */}
              <ImageUploadWithCamera
                description={t(
                  "modal.addSku.imageDescription",
                  "Upload product images from your device or take photos with your camera",
                )}
                disabled={isDisabled}
                featureId="product"
                label={t("modal.addSku.imageLabel", "Images")}
                maxImages={5}
                prefix="sku-image"
                onImagesChange={setImageUrls}
              />

              {/* Attribute Values */}
              {selectedCategoryId && categoryAttributes.length > 0 && (
                <div className="grid gap-4">
                  <Label>
                    {t("modal.addSku.attributesLabel", "Attributes")}
                  </Label>
                  {isCategoriesLoading ? (
                    <div className="text-sm text-muted-foreground">
                      {t(
                        "modal.addSku.loadingAttributes",
                        "Loading attributes...",
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[200px] overflow-y-auto">
                      {categoryAttributes.map((attributeItem) => (
                        <div
                          key={attributeItem.attribute.id}
                          className="grid gap-2"
                        >
                          <div className="flex justify-between">
                            <Label>
                              {attributeItem.attribute.name}
                              {attributeItem.is_required && (
                                <span className="text-destructive ml-1">*</span>
                              )}
                            </Label>
                            <span className="text-xs text-muted-foreground">
                              {attributeItem.attribute.type}
                            </span>
                          </div>
                          {attributeItem.attribute.description && (
                            <p className="text-xs text-muted-foreground -mt-1">
                              {attributeItem.attribute.description}
                            </p>
                          )}
                          <AttributeValueInput
                            key={attributeItem.attribute.id}
                            attribute={attributeItem.attribute}
                            initialValue={
                              attributeValues[attributeItem.attribute.id] || ""
                            }
                            onChange={(value) =>
                              handleAttributeValueChange(
                                attributeItem.attribute.id,
                                value,
                              )
                            }
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="px-6 py-4 border-t shrink-0">
            <Button disabled={isProcessing} type="submit">
              {isProcessing
                ? isEditMode
                  ? t("modal.addSku.updating", "Updating...")
                  : t("modal.addSku.creating", "Creating...")
                : isEditMode
                  ? t("modal.addSku.update", "Update SKU")
                  : t("modal.addSku.create", "Create SKU")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
