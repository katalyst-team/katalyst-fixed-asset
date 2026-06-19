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
import { useCreateSkuDataMutation } from "@/hooks/api/sku/useCreateSkuDataMutation";
import { KEY_USE_GET_SKU_DATA } from "@/hooks/api/sku/useGetSKUDataQuery";
import useUpdateSkuMutation from "@/hooks/api/sku/useUpdateSkuMutation";
import useGetStoreDataQuery from "@/hooks/api/store/useGetStoreDataQuery";
import { toastError } from "@/services";
import { AttributeItemType, AttributeTypeEnum } from "@/types/attribute";
import { SkuItemType, SkuStatus, SkuType } from "@/types/sku";

import { AttributeValueInput } from "./components/AttributeValueInput";
import {
  productFormSchema,
  ProductFormValues,
} from "./schemas/productFormSchema";
import { useProductStore } from "./store";

interface ProductFormPageProps {
  product?: SkuItemType; // If provided, component will be in edit mode
}

type CategoryAttributeItem = {
  attribute: AttributeItemType;
  is_required: boolean;
};

/**
 * Full-page component for adding or editing a unique product with improved UX/UI
 */
export const ProductFormPage = ({ product }: ProductFormPageProps) => {
  const { t } = useTranslation(["product", "sku"]);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { tokenPayload, selectedTeam } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const isEditMode = Boolean(product);

  // Get store values for query invalidation and pagination reset
  const { resetPagination, setFilters } = useProductStore(
    useShallow((state) => ({
      resetPagination: state.resetPagination,
      setFilters: state.setFilters,
    })),
  );

  // Form state
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [categoryAttributes, setCategoryAttributes] = useState<
    CategoryAttributeItem[]
  >([]);
  const [attributeValues, setAttributeValues] = useState<
    Record<string, string | number | string[]>
  >({});
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isCategoryMissing, setIsCategoryMissing] = useState(false);

  // API hooks
  const { data: categoryData, isLoading: isCategoriesLoading } =
    useGetCategoryDataQuery({
      organizationId,
    });
  const { data: storeData } = useGetStoreDataQuery({
    organizationId,
  });
  const { mutateAsync: createSkuData } = useCreateSkuDataMutation();
  const { mutateAsync: updateSkuData } = useUpdateSkuMutation();

  // Form setup with react-hook-form
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProductFormValues>({
    defaultValues: {
      categoryId: product?.categories?.[0]?.id || "",
      internal_code: product?.internal_code || "",
      name: product?.name || "",
      storeId: product?.store?.id || selectedTeam || "0",
    },
    resolver: zodResolver(productFormSchema),
  });
  const watchedStoreId = useWatch({ control, name: "storeId" });
  const storeIdForRef =
    watchedStoreId && watchedStoreId !== "0" ? watchedStoreId : undefined;

  // Watch form changes for unsaved changes warning
  useEffect(() => {
    setHasUnsavedChanges(
      isDirty ||
        Object.keys(attributeValues).length > 0 ||
        imageUrls.length > 0,
    );
  }, [isDirty, attributeValues, imageUrls]);

  // Initialize form for edit mode
  useEffect(() => {
    if (isEditMode && product) {
      // Set basic form values
      setValue("name", product.name);
      setValue("internal_code", product.internal_code || "");
      setValue("storeId", product.store?.id || "0");

      // Set category and trigger category selection effect
      if (product.categories && product.categories.length > 0) {
        const categoryId = product.categories[0].id;
        setValue("categoryId", categoryId);
        setSelectedCategoryId(categoryId);
      }

      // Set image URLs
      if (product.image_urls && product.image_urls.length > 0) {
        setImageUrls(product.image_urls);
      }
    }
  }, [product, isEditMode, setValue]);

  // Initialize attribute values when category is selected
  // Merging category attributes + attribute values prevents a timing issue
  // where AttributeValueInput mounts with empty initialValue
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
      if (isEditMode && product?.attributes && product.attributes.length > 0) {
        setIsCategoryMissing(true);
        const skuAttrs: CategoryAttributeItem[] = product.attributes.map(
          (attr) => ({
            attribute: {
              created_at: "",
              description: attr.description || attr.Description || "",
              id: attr.attribute_id,
              name: attr.name || attr.Name,
              presets: null,
              type: (attr.type || attr.Type) as AttributeTypeEnum,
              unit: null,
              updated_at: "",
            },
            is_required: false,
          }),
        );
        setCategoryAttributes(skuAttrs);

        const processedValues: Record<string, string | number | string[]> = {};
        product.attributes.forEach((attr) => {
          const attrId = attr.attribute_id;
          const rawValues = attr.values ?? attr.Values;
          if (rawValues && rawValues.length > 0) {
            const attrType = (attr.type || attr.Type) as AttributeTypeEnum;
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
              case AttributeTypeEnum.DATE:
              case AttributeTypeEnum.SELECT:
              case AttributeTypeEnum.TEXT:
              case AttributeTypeEnum.DATETIME:
              default:
                processedValues[attrId] = rawValues[0] || "";
                break;
            }
          }
        });
        setAttributeValues(processedValues);
      } else {
        setCategoryAttributes([]);
      }
      return;
    }

    setIsCategoryMissing(false);

    const attributeItems = category.attribute_items || [];
    const typedAttributes = attributeItems.map((item) => ({
      attribute: item.attribute as unknown as AttributeItemType,
      is_required: item.is_required,
    }));

    setCategoryAttributes(typedAttributes);

    // In create mode, reset attribute values
    if (!isEditMode) {
      setAttributeValues({});
      return;
    }

    // In edit mode, populate attribute values from product data in the same cycle
    if (
      product &&
      typedAttributes.length > 0 &&
      product.attributes &&
      product.attributes.length > 0
    ) {
      const processedValues: Record<string, string | number | string[]> = {};

      product.attributes.forEach((productAttr) => {
        const attrId = productAttr.attribute_id;
        const rawValues = productAttr.values ?? productAttr.Values;
        const attributeDef = typedAttributes.find(
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
  }, [selectedCategoryId, categoryData, isEditMode, product]);

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

  // Handle navigation with unsaved changes warning
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        t("form.unsavedChanges", {
          defaultValue:
            "You have unsaved changes. Are you sure you want to leave?",
        }),
      );
      if (!confirmed) return;
    }
    router.push("/dashboard/product");
  };

  // Submit handler
  const isAttributeValueEmpty = (
    value: string | number | string[] | undefined,
  ): boolean => {
    if (value === null || value === undefined) {
      return true;
    }

    if (Array.isArray(value)) {
      return value.length === 0;
    }

    if (typeof value === "string") {
      return value.trim() === "";
    }

    return false;
  };

  const onSubmit = async (data: ProductFormValues) => {
    setIsProcessing(true);
    try {
      // Validate required attributes
      const missingRequired = categoryAttributes
        .filter((item) => item.is_required)
        .filter((item) => {
          const value = attributeValues[item.attribute.id];
          return isAttributeValueEmpty(value);
        });

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

      // Prepare attribute items for API submission
      const attribute_items = Object.entries(attributeValues).map(
        ([attributeId, value]) => {
          return {
            attribute_id: attributeId,
            values: value,
          };
        },
      );

      if (isEditMode && product) {
        // Update existing product
        await updateSkuData({
          attribute_items,
          category_ids: data.categoryId ? [data.categoryId] : [],
          image_urls: imageUrls,
          internal_code: data.internal_code,
          name: data.name,
          organization_id: organizationId,
          sku_id: product.id,
          sku_type: SkuType.UNIQUE,
          store_id: data.storeId,
        });
        toast.success(
          t("form.updateSuccess", {
            defaultValue: t("sku:modal.addSku.updateSuccess"),
          }),
        );
      } else {
        // Create new product
        await createSkuData({
          attribute_items,
          category_ids: data.categoryId ? [data.categoryId] : [],
          image_urls: imageUrls,
          internal_code: data.internal_code,
          name: data.name,
          organization_id: organizationId,
          sku: "", // Generated by the backend
          sku_type: SkuType.UNIQUE,
          status: SkuStatus.ACTIVE,
          store_id: data.storeId,
        });
        toast.success(
          t("form.createSuccess", {
            defaultValue: t("sku:modal.addSku.createSuccess"),
          }),
        );
      }

      // Clear filters and reset pagination, then invalidate query
      setFilters({ assign_status: "UNASSIGNED", type: SkuType.UNIQUE });
      resetPagination();
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_SKU_DATA(organizationId, {
          assign_status: "UNASSIGNED",
          type: SkuType.UNIQUE,
        }),
      });

      setHasUnsavedChanges(false);
      router.push("/dashboard/product");
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
              {t("form.backToList", {
                defaultValue: "Back to Product List",
              })}
            </Button>
          </div>
          <CardTitle className="text-2xl font-bold font-heading">
            {isEditMode
              ? t("form.editTitle", {
                  defaultValue: t("sku:modal.addSku.editTitle", "Edit Product"),
                })
              : t("form.createTitle", {
                  defaultValue: "Create New Unique Product",
                })}
          </CardTitle>
          <CardDescription className="text-base">
            {isEditMode
              ? t("form.editDescription", {
                  defaultValue:
                    "Update the details of your unique product. This represents a one-of-a-kind serialized item.",
                })
              : t("form.createDescription", {
                  defaultValue:
                    "Add a new unique product to your catalog. Unique products are serialized items with individual tracking capabilities.",
                })}
          </CardDescription>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Basic Information Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {t("form.section.basicInfo", {
                defaultValue: "Basic Information",
              })}
            </CardTitle>
            <CardDescription>
              {t("form.section.basicInfoDescription", {
                defaultValue:
                  "Essential details to identify and categorize your unique product",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Product Name */}
            <div className="space-y-2">
              <Label className="text-base font-medium" htmlFor="name">
                {t("form.field.name", {
                  defaultValue: t("sku:modal.addSku.nameLabel"),
                })}
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
                    placeholder={t("form.field.namePlaceholder", {
                      defaultValue:
                        "e.g., Vintage Leather Jacket Serial #12345",
                    })}
                  />
                )}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
              <p className="text-sm text-muted-foreground">
                {t("form.field.nameHelp", {
                  defaultValue:
                    "Choose a descriptive name for this unique product. Include serial numbers or unique identifiers if applicable.",
                })}
              </p>
            </div>

            {/* Internal Code */}
            <div className="space-y-2">
              <Label className="text-base font-medium" htmlFor="internal_code">
                {t("form.field.internalCode", {
                  defaultValue: "Internal Code",
                })}
              </Label>
              <Controller
                control={control}
                name="internal_code"
                render={({ field }) => (
                  <Input
                    {...field}
                    disabled={isDisabled}
                    id="internal_code"
                    placeholder={t("form.field.internalCodePlaceholder", {
                      defaultValue: "e.g., INT-001",
                    })}
                  />
                )}
              />
              <p className="text-sm text-muted-foreground">
                {t("form.field.internalCodeHelp", {
                  defaultValue: "Optional internal code for your reference",
                })}
              </p>
            </div>

            <Separator />

            {/* Store Selection */}
            <div className="space-y-2">
              <Label className="text-base font-medium" htmlFor="storeId">
                {t("form.field.store", {
                  defaultValue: "Store",
                })}
                <span className="text-destructive ml-1">*</span>
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
                        placeholder={t("form.field.storePlaceholder", {
                          defaultValue: "Select a store...",
                        })}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">
                        {t("form.field.allStores", {
                          defaultValue: "All Stores",
                        })}
                      </SelectItem>
                      {storeData?.data.stores?.map((store) => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.storeId && (
                <p className="text-sm text-destructive">{errors.storeId.message}</p>
              )}
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                Pastikan store yang dipilih sudah benar sebelum menyimpan
              </p>
              <p className="text-sm text-muted-foreground">
                {t("form.field.storeHelp", {
                  defaultValue:
                    "Select the store where this product will be available",
                })}
              </p>
            </div>

            <Separator />

            {/* Category Selection */}
            <div className="space-y-2">
              <Label className="text-base font-medium" htmlFor="categoryId">
                {t("form.field.category", {
                  defaultValue: t("sku:modal.addSku.categoryLabel"),
                })}
              </Label>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <Select
                    disabled={isDisabled || isCategoryMissing}
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleCategoryChange(value);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={t("form.field.categoryPlaceholder", {
                          defaultValue: "Select a category for this product",
                        })}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {isCategoryMissing && product?.categories?.[0] && (
                        <SelectItem value={product.categories[0].id}>
                          {product.categories[0].name}
                        </SelectItem>
                      )}
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
              <p className="text-sm text-muted-foreground">
                {t("form.field.categoryHelp", {
                  defaultValue:
                    "Category determines which attributes are available for this product",
                })}
              </p>
              {isCategoryMissing && (
                <p className="text-sm text-yellow-600 dark:text-yellow-500">
                  {t("form.field.categoryDeleted", {
                    defaultValue:
                      "This category is no longer available. Attributes are loaded from the original product data.",
                  })}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Product Images Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {t("form.section.images", {
                defaultValue: "Product Images",
              })}
            </CardTitle>
            <CardDescription>
              {t("form.section.imagesDescription", {
                defaultValue:
                  "Capture detailed images of this unique product for identification",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUploadWithCamera
              description={t("form.field.imageDescription", {
                defaultValue:
                  "Upload up to 5 images. Take photos of distinctive features, serial numbers, or unique markings.",
              })}
              disabled={isDisabled}
              featureId="product"
              initialImages={imageUrls}
              label={t("form.field.imageLabel", {
                defaultValue: t("sku:modal.addSku.imageLabel"),
              })}
              maxImages={5}
              prefix="product-image"
              onImagesChange={setImageUrls}
            />
          </CardContent>
        </Card>

        {/* Attributes Section */}
        {selectedCategoryId && categoryAttributes.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {t("form.section.attributes", {
                  defaultValue: "Product Attributes",
                })}
              </CardTitle>
              <CardDescription>
                {t("form.section.attributesDescription", {
                  defaultValue:
                    "Provide detailed specifications for this unique product. Fields marked with * are required.",
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isCategoriesLoading ? (
                <div className="text-sm text-muted-foreground py-8 text-center">
                  {t("form.loadingAttributes", {
                    defaultValue: t("sku:modal.addSku.loadingAttributes"),
                  })}
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
                          disabled={
                            isCategoryMissing &&
                            !attributeItem.attribute.presets?.length &&
                            [
                              AttributeTypeEnum.SELECT,
                              AttributeTypeEnum.CHECKBOX,
                              AttributeTypeEnum.REFERENCE_GROUP,
                            ].includes(attributeItem.attribute.type)
                          }
                          initialValue={
                            attributeValues[attributeItem.attribute.id] || ""
                          }
                          organizationId={organizationId}
                          storeId={storeIdForRef}
                          onChange={(value) =>
                            handleAttributeValueChange(
                              attributeItem.attribute.id,
                              value,
                            )
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

        {/* Action Buttons - Sticky on mobile */}
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
                {t("form.button.cancel", {
                  defaultValue: "Cancel",
                })}
              </Button>
              <Button
                className="sm:order-2"
                disabled={isProcessing}
                type="submit"
              >
                {isProcessing
                  ? isEditMode
                    ? t("form.button.updating", {
                        defaultValue: t("sku:modal.addSku.updating"),
                      })
                    : t("form.button.creating", {
                        defaultValue: t("sku:modal.addSku.creating"),
                      })
                  : isEditMode
                    ? t("form.button.update", {
                        defaultValue: t("sku:modal.addSku.update"),
                      })
                    : t("form.button.create", {
                        defaultValue: "Create Product",
                      })}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};
