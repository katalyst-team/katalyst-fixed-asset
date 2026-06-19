/* eslint-disable max-lines */
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import type { ChangeEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
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

import { type KbmGradeType,useKbmGradeConfig } from "./KbmGradeConfigContext";
import {
  isDuplicateKbmGradeName,
  normalizeKbmGradeName,
} from "./utils/duplicateUtils";

// KBM Grade category name constants (fallback for legacy name)
const KBM_GRADE_CATEGORY_NAMES = [
  "KBM Grade ST Susun",
  "KBM Grade ST Batang",
  "KBM Grade",
];

// KBM Grade attribute names
const ATTR_KD_GRADE = "G_KD_GRADE";
const ATTR_NM_GRADE = "G_NM_GRADE";
const ATTR_TEBAL = "G_TEBAL";
const ATTR_LEBAR = "G_LEBAR";
const ATTR_PANJANG = "G_PANJANG";
const ATTR_STD_SUSUN = "G_STD_SUSUN";
const ATTR_VOL = "G_VOL";
const ATTR_STD_VOL = "G_STD_VOL";
const ATTR_TYPE = "G_TYPE";

// Input attributes for ST SUSUN (user fills these)
const INPUT_ATTRIBUTES_SUSUN = [
  ATTR_KD_GRADE,
  ATTR_NM_GRADE,
  ATTR_TEBAL,
  ATTR_LEBAR,
  ATTR_PANJANG,
  ATTR_STD_SUSUN,
];

// Input attributes for ST BATANG (simplified - only KD Grade)
const INPUT_ATTRIBUTES_BATANG = [ATTR_KD_GRADE];

// Get input attributes based on grade type
const getInputAttributes = (gradeType: KbmGradeType): string[] => {
  return gradeType === "BATANG" ? INPUT_ATTRIBUTES_BATANG : INPUT_ATTRIBUTES_SUSUN;
};

// Form schema
const kbmGradeFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
});

type KbmGradeFormValues = z.infer<typeof kbmGradeFormSchema>;

interface KbmGradeFormPageProps {
  gradeData?: SkuItemType; // If provided, component will be in edit mode
}

type CategoryAttributeItem = {
  attribute: AttributeItemType;
  is_required: boolean;
};

/**
 * Calculate VOL (Volume per Susun) in m³
 * VOL = (TEBAL × LEBAR × PANJANG) ÷ 1,000,000,000
 * Input: mm, Output: m³
 */
const calculateVol = (
  tebal: number,
  lebar: number,
  panjang: number
): number => {
  if (tebal <= 0 || lebar <= 0 || panjang <= 0) return 0;
  return (tebal * lebar * panjang) / 1_000_000_000;
};

/**
 * Calculate STD_VOL (Standard Volume) in m³
 * STD_VOL = VOL × STD_SUSUN
 */
const calculateStdVol = (vol: number, stdSusun: number): number => {
  if (vol <= 0 || stdSusun <= 0) return 0;
  return vol * stdSusun;
};

/**
 * Full-page component for adding or editing a KBM Grade
 */
export const KbmGradeFormPage = ({ gradeData }: KbmGradeFormPageProps) => {
  const { basePath, gradeType, title, translationNamespace } =
    useKbmGradeConfig();
  const { t } = useTranslation([translationNamespace]);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { tokenPayload, selectedTeam } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const isEditMode = Boolean(gradeData);

  // Store selection - default to selectedTeam if available
  const defaultStoreId = selectedTeam !== "0" ? selectedTeam : "all";
  const [selectedStoreId, setSelectedStoreId] = useState<string>(
    isEditMode && gradeData?.store?.id ? gradeData.store.id : defaultStoreId
  );

  const { data: storeData } = useGetStoreDataQuery({ organizationId });
  const stores = storeData?.data?.stores ?? [];

  // Form state
  const [categoryAttributes, setCategoryAttributes] = useState<
    CategoryAttributeItem[]
  >([]);
  const [attributeValues, setAttributeValues] = useState<
    Record<string, string | number | string[]>
  >({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // API hooks
  const { data: categoryData, isLoading: isCategoriesLoading } =
    useGetCategoryDataQuery({
      organizationId,
    });
  const { mutateAsync: createSkuData } = useCreateSkuDataMutation();
  const { mutateAsync: updateSkuData } = useUpdateSkuMutation();

  // Find KBM Grade category (case-insensitive match)
  const kbmGradeCategory = useMemo(() => {
    if (!categoryData?.data?.categories) return null;
    const lowerNames = KBM_GRADE_CATEGORY_NAMES.map((n) => n.toLowerCase());
    return categoryData.data.categories.find((category) =>
      lowerNames.includes(category.name.toLowerCase())
    );
  }, [categoryData]);

  const kbmGradeCategoryId = kbmGradeCategory?.id;

  // Form setup with react-hook-form
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<KbmGradeFormValues>({
    defaultValues: {
      name: gradeData?.name || "",
    },
    resolver: zodResolver(kbmGradeFormSchema),
  });

  // Watch form changes for unsaved changes warning
  useEffect(() => {
    setHasUnsavedChanges(isDirty || Object.keys(attributeValues).length > 0);
  }, [isDirty, attributeValues]);

  // Initialize category attributes when KBM Grade category is found
  useEffect(() => {
    if (!kbmGradeCategory) {
      setCategoryAttributes([]);
      return;
    }

    const attributeItems = kbmGradeCategory.attribute_items || [];
    const typedAttributes = attributeItems.map((item) => ({
      attribute: item.attribute as unknown as AttributeItemType,
      is_required: item.is_required,
    }));

    setCategoryAttributes(typedAttributes);
    if (!isEditMode) {
      setAttributeValues({});
    }
  }, [kbmGradeCategory, isEditMode]);

  // Initialize form for edit mode
  useEffect(() => {
    if (isEditMode && gradeData) {
      setValue("name", gradeData.name);
    }
  }, [gradeData, isEditMode, setValue]);

  // Initialize attribute values when both data and category attributes are available
  useEffect(() => {
    if (
      isEditMode &&
      gradeData &&
      categoryAttributes.length > 0 &&
      gradeData.attributes &&
      gradeData.attributes.length > 0
    ) {
      const processedValues: Record<string, string | number | string[]> = {};

      gradeData.attributes.forEach((skuAttr) => {
        const attrId = skuAttr.attribute_id;
        const rawValues = skuAttr.Values ?? skuAttr.values;
        const attributeDef = categoryAttributes.find(
          (catAttr) => catAttr.attribute.id === attrId
        );

        if (attributeDef && rawValues && rawValues.length > 0) {
          const attrType = attributeDef.attribute.type;

          switch (attrType) {
            case AttributeTypeEnum.NUMBER:
              const numValue = parseFloat(rawValues[0]);
              processedValues[attrId] = isNaN(numValue) ? 0 : numValue;
              break;
            case AttributeTypeEnum.TEXT:
            default:
              processedValues[attrId] = rawValues[0] || "";
              break;
          }
        }
      });

      setAttributeValues(processedValues);
    }
  }, [gradeData, isEditMode, categoryAttributes]);

  // Get attribute ID by name
  const getAttributeIdByName = useCallback(
    (name: string): string | undefined => {
      const attr = categoryAttributes.find(
        (item) => item.attribute.name === name
      );
      return attr?.attribute.id;
    },
    [categoryAttributes]
  );

  // Get attribute value by name
  const getAttributeValueByName = useCallback(
    (name: string): number => {
      const attrId = getAttributeIdByName(name);
      if (!attrId) return 0;
      const value = attributeValues[attrId];
      if (typeof value === "number") return value;
      if (typeof value === "string") {
        const num = parseFloat(value);
        return isNaN(num) ? 0 : num;
      }
      return 0;
    },
    [getAttributeIdByName, attributeValues]
  );

  // Calculate VOL and STD_VOL
  const calculatedValues = useMemo(() => {
    const tebal = getAttributeValueByName(ATTR_TEBAL);
    const lebar = getAttributeValueByName(ATTR_LEBAR);
    const panjang = getAttributeValueByName(ATTR_PANJANG);
    const stdSusun = getAttributeValueByName(ATTR_STD_SUSUN);

    const vol = calculateVol(tebal, lebar, panjang);
    const stdVol = calculateStdVol(vol, stdSusun);

    return { stdVol, vol };
  }, [getAttributeValueByName]);

  const handleAttributeValueChange = (
    attributeId: string,
    value: string | number | string[]
  ) => {
    setAttributeValues((prev) => ({ ...prev, [attributeId]: value }));
  };

  const getAttributeById = useCallback(
    (attributeId: string | undefined) => {
      if (!attributeId) return undefined;
      return categoryAttributes.find(
        (item) => item.attribute.id === attributeId
      );
    },
    [categoryAttributes]
  );

  const isAttributeRequiredById = useCallback(
    (attributeId: string | undefined): boolean => {
      const attributeItem = getAttributeById(attributeId);
      return Boolean(attributeItem?.is_required);
    },
    [getAttributeById]
  );

  const getAttributeNameById = useCallback(
    (attributeId: string | undefined): string | undefined => {
      const attributeItem = getAttributeById(attributeId);
      return attributeItem?.attribute.name;
    },
    [getAttributeById]
  );

  const handleManualValueChange =
    (attributeId: string | undefined) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      if (!attributeId) return;
      handleAttributeValueChange(attributeId, event.target.value);
    };

  // Handle navigation with unsaved changes warning
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        t(
          "form.unsavedChanges",
          "You have unsaved changes. Are you sure you want to leave?"
        )
      );
      if (!confirmed) return;
    }
    router.push(basePath);
  };

  // Check if attribute value is empty
  const isAttributeValueEmpty = (
    value: string | number | string[] | undefined
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

  // Check if an attribute is an input attribute (not auto-calculated)
  const isInputAttribute = useCallback(
    (attributeName: string): boolean => {
      return getInputAttributes(gradeType).includes(attributeName);
    },
    [gradeType]
  );

  // Get attribute label
  const getAttributeLabel = (attributeName: string): string => {
    const labels: Record<string, string> = {
      [ATTR_KD_GRADE]: t("form.attribute.kdGrade", "KD_GRADE (Kode Grade)"),
      [ATTR_LEBAR]: t("form.attribute.lebar", "G_LEBAR (Lebar in mm)"),
      [ATTR_NM_GRADE]: t("form.attribute.nmGrade", "NM_GRADE (Nama Grade)"),
      [ATTR_PANJANG]: t("form.attribute.panjang", "G_PANJANG (Panjang in mm)"),
      [ATTR_STD_SUSUN]: t(
        "form.attribute.stdSusun",
        "G_STD_SUSUN (Standard Susun)"
      ),
      [ATTR_STD_VOL]: t(
        "form.attribute.stdVol",
        "G_STD_VOL (Standard Volume in m³)"
      ),
      [ATTR_TEBAL]: t("form.attribute.tebal", "G_TEBAL (Tebal in mm)"),
      [ATTR_VOL]: t("form.attribute.vol", "G_VOL (Volume per Susun in m³)"),
    };
    return labels[attributeName] || attributeName;
  };

  const volAttrId = useMemo(
    () => getAttributeIdByName(ATTR_VOL),
    [getAttributeIdByName]
  );

  const stdVolAttrId = useMemo(
    () => getAttributeIdByName(ATTR_STD_VOL),
    [getAttributeIdByName]
  );
  const typeAttrId = useMemo(
    () => getAttributeIdByName(ATTR_TYPE),
    [getAttributeIdByName]
  );

  // Submit handler
  const onSubmit = async (data: KbmGradeFormValues) => {
    if (!kbmGradeCategoryId) {
      toast.error(
        t(
          "form.categoryNotFound",
          "KBM Grade category not found. Please create the category first."
        )
      );
      return;
    }

    setIsProcessing(true);
    try {
      // Get input attributes that are required
      const inputAttributeItems = categoryAttributes.filter(
        (item) => isInputAttribute(item.attribute.name) && item.is_required
      );

      // Validate required attributes
      const missingRequired = inputAttributeItems.filter((item) => {
        const value = attributeValues[item.attribute.id];
        return isAttributeValueEmpty(value);
      });

      const missingManual = [volAttrId, stdVolAttrId]
        .filter((id): id is string => Boolean(id))
        .filter((id) => isAttributeRequiredById(id))
        .filter((id) => {
          const value = attributeValues[id];
          return isAttributeValueEmpty(value);
        })
        .map((id) => getAttributeNameById(id) ?? id);

      if (missingRequired.length > 0 || missingManual.length > 0) {
        const missingNames = [
          ...missingRequired.map((item) =>
            getAttributeLabel(item.attribute.name)
          ),
          ...missingManual.map((name) => getAttributeLabel(name)),
        ].join(", ");
        toast.error(
          t("form.missingRequired", {
            attributes: missingNames,
            defaultValue:
              "Please fill in all required attributes: {{attributes}}",
          })
        );
        setIsProcessing(false);
        return;
      }

      if (!typeAttrId) {
        toast.error(
          t(
            "form.typeAttributeMissing",
            "G_TYPE attribute not found. Please update the category configuration."
          )
        );
        setIsProcessing(false);
        return;
      }

      const normalizedName = normalizeKbmGradeName(data.name);
      const existingName =
        isEditMode && gradeData
          ? normalizeKbmGradeName(gradeData.name)
          : null;

      if (!isEditMode || normalizedName !== existingName) {
        const isDuplicate = await isDuplicateKbmGradeName({
          categoryId: kbmGradeCategoryId,
          excludeSkuId: gradeData?.id,
          gTypeAttributeId: typeAttrId,
          gradeType,
          name: data.name,
          organizationId,
        });

        if (isDuplicate) {
          toast.error(
            t("form.duplicateName", {
              defaultValue:
                "Grade name '{{name}}' already exists for this grade type.",
              name: data.name,
            })
          );
          setIsProcessing(false);
          return;
        }
      }

      // Prepare attribute items for API submission
      const attribute_items: {
        attribute_id: string;
        values: string | number | string[];
      }[] = [];

      // Add input attribute values
      Object.entries(attributeValues).forEach(([attributeId, value]) => {
        const attr = categoryAttributes.find(
          (item) => item.attribute.id === attributeId
        );
        if (attr && isInputAttribute(attr.attribute.name)) {
          attribute_items.push({
            attribute_id: attributeId,
            values: value,
          });
        }
      });

      // Add manual values for VOL and STD_VOL
      if (volAttrId && !isAttributeValueEmpty(attributeValues[volAttrId])) {
        const rawVol = attributeValues[volAttrId];
        const parsedVol =
          typeof rawVol === "string" ? parseFloat(rawVol) : rawVol;
        attribute_items.push({
          attribute_id: volAttrId,
          values: Number.isNaN(parsedVol) ? rawVol : parsedVol,
        });
      }

      if (
        stdVolAttrId &&
        !isAttributeValueEmpty(attributeValues[stdVolAttrId])
      ) {
        const rawStdVol = attributeValues[stdVolAttrId];
        const parsedStdVol =
          typeof rawStdVol === "string" ? parseFloat(rawStdVol) : rawStdVol;
        attribute_items.push({
          attribute_id: stdVolAttrId,
          values: Number.isNaN(parsedStdVol) ? rawStdVol : parsedStdVol,
        });
      }

      attribute_items.push({
        attribute_id: typeAttrId,
        values: gradeType,
      });

      if (isEditMode && gradeData) {
        // Update existing grade
        await updateSkuData({
          attribute_items,
          category_ids: [kbmGradeCategoryId],
          image_urls: [],
          name: data.name,
          organization_id: organizationId,
          sku_id: gradeData.id,
          sku_type: SkuType.COMMON,
          store_id: selectedStoreId !== "all" ? selectedStoreId : undefined,
        });
        toast.success(t("form.updateSuccess", "Grade updated successfully"));
      } else {
        // Create new grade
        await createSkuData({
          attribute_items,
          category_ids: [kbmGradeCategoryId],
          image_urls: [],
          name: data.name,
          organization_id: organizationId,
          sku: "",
          sku_type: SkuType.COMMON,
          status: SkuStatus.ACTIVE,
          store_id: selectedStoreId !== "all" ? selectedStoreId : undefined,
        });
        toast.success(t("form.createSuccess", "Grade created successfully"));
      }

      // Invalidate queries
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

  // Sort attributes to show in specific order
  const sortedInputAttributes = useMemo(() => {
    const order = getInputAttributes(gradeType);
    return categoryAttributes
      .filter((item) => isInputAttribute(item.attribute.name))
      .sort((a, b) => {
        const indexA = order.indexOf(a.attribute.name);
        const indexB = order.indexOf(b.attribute.name);
        return indexA - indexB;
      });
  }, [categoryAttributes, gradeType, isInputAttribute]);

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
              {t("form.backToList", "Back to Grade List")}
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
                  "Update the grade details. Changes will be reflected across all records."
                )
              : t(
                  "form.createDescription",
                  "Add a new grade to the master data. Fields marked with * are required."
                )}
          </CardDescription>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Basic Information Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {t("form.section.basicInfo", "Basic Information")}
            </CardTitle>
            <CardDescription>
              {t(
                "form.section.basicInfoDescription",
                "Essential details to identify the grade"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Grade Name */}
            <div className="space-y-2">
              <Label className="text-base font-medium" htmlFor="name">
                {t("form.field.name", "Grade Name")}
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
                      "e.g., TA(41-10)ALL"
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
                  "Choose a descriptive name that clearly identifies this grade"
                )}
              </p>
            </div>

            {/* Store */}
            <div className="space-y-2">
              <Label className="text-base font-medium" htmlFor="store">
                {t("form.field.store", "Store")}
              </Label>
              <Select
                value={selectedStoreId}
                onValueChange={setSelectedStoreId}
              >
                <SelectTrigger id="store">
                  <SelectValue placeholder={t("form.field.storePlaceholder", "All Stores (no specific store)")} />
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
                {t("form.field.storeHelp", "Optionally assign this grade to a specific store")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Attributes Section */}
        {!isCategoriesLoading && sortedInputAttributes.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {t("form.section.attributes", "Grade Attributes")}
              </CardTitle>
              <CardDescription>
                {t(
                  "form.section.attributesDescription",
                  "Provide detailed specifications for this grade. Fields marked with * are required."
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sortedInputAttributes.map((attributeItem) => (
                  <div key={attributeItem.attribute.id} className="space-y-2">
                    <Label className="text-base font-medium">
                      {getAttributeLabel(attributeItem.attribute.name)}
                      {attributeItem.is_required && (
                        <span className="text-destructive ml-1">*</span>
                      )}
                    </Label>
                    <Input
                      disabled={isDisabled}
                      placeholder={
                        attributeItem.attribute.type ===
                        AttributeTypeEnum.NUMBER
                          ? "0"
                          : "Enter value..."
                      }
                      type={
                        attributeItem.attribute.type ===
                        AttributeTypeEnum.NUMBER
                          ? "number"
                          : "text"
                      }
                      value={
                        attributeValues[attributeItem.attribute.id] !==
                        undefined
                          ? String(attributeValues[attributeItem.attribute.id])
                          : ""
                      }
                      onChange={(e) => {
                        const value =
                          attributeItem.attribute.type ===
                          AttributeTypeEnum.NUMBER
                            ? parseFloat(e.target.value) || 0
                            : e.target.value;
                        handleAttributeValueChange(
                          attributeItem.attribute.id,
                          value
                        );
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* VOL and STD_VOL fields - only for SUSUN type */}
              {gradeType === "SUSUN" && (
                <div className="mt-6 border-t pt-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* VOL */}
                  <div className="space-y-2">
                    <Label className="text-base font-medium">
                      {t("form.calculation.vol", "VOL (Volume per Susun)")}
                      {isAttributeRequiredById(volAttrId) && (
                        <span className="text-destructive ml-1">*</span>
                      )}
                    </Label>
                    <div className="flex items-center gap-4">
                      <Input
                        className="font-mono"
                        disabled={isDisabled || !volAttrId}
                        inputMode="decimal"
                        placeholder={t(
                          "form.calculation.volPlaceholder",
                          "Enter VOL"
                        )}
                        step="0.0001"
                        type="number"
                        value={
                          volAttrId && attributeValues[volAttrId] !== undefined
                            ? String(attributeValues[volAttrId])
                            : ""
                        }
                        onChange={handleManualValueChange(volAttrId)}
                      />
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        m³
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t(
                        "form.calculation.volFormula",
                        "= (TEBAL × LEBAR × PANJANG) ÷ 1,000,000,000"
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("form.calculation.expectedVol", {
                        defaultValue: `Expected (auto): ${calculatedValues.vol.toFixed(4)} m³`,
                        value: calculatedValues.vol.toFixed(4),
                      })}
                    </p>
                  </div>

                  {/* STD_VOL */}
                  <div className="space-y-2">
                    <Label className="text-base font-medium">
                      {t(
                        "form.calculation.stdVol",
                        "STD_VOL (Standard Volume)"
                      )}
                      {isAttributeRequiredById(stdVolAttrId) && (
                        <span className="text-destructive ml-1">*</span>
                      )}
                    </Label>
                    <div className="flex items-center gap-4">
                      <Input
                        className="font-mono"
                        disabled={isDisabled || !stdVolAttrId}
                        inputMode="decimal"
                        placeholder={t(
                          "form.calculation.stdVolPlaceholder",
                          "Enter STD_VOL"
                        )}
                        step="0.0001"
                        type="number"
                        value={
                          stdVolAttrId &&
                          attributeValues[stdVolAttrId] !== undefined
                            ? String(attributeValues[stdVolAttrId])
                            : ""
                        }
                        onChange={handleManualValueChange(stdVolAttrId)}
                      />
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        m³
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("form.calculation.stdVolFormula", "= VOL × STD_SUSUN")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("form.calculation.expectedStdVol", {
                        defaultValue: `Expected (auto): ${calculatedValues.stdVol.toFixed(4)} m³`,
                        value: calculatedValues.stdVol.toFixed(4),
                      })}
                    </p>
                  </div>
                </div>
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
              <Button
                className="sm:order-2"
                disabled={isProcessing || !kbmGradeCategoryId}
                type="submit"
              >
                {isProcessing
                  ? isEditMode
                    ? t("form.button.updating", "Updating...")
                    : t("form.button.creating", "Creating...")
                  : isEditMode
                    ? t("form.button.update", "Update Grade")
                    : t("form.button.create", "Create Grade")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};
