import { FileSpreadsheet, Info } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/user-context";
import useGetCategoryDataQuery from "@/hooks/api/category/useGetCategoryDataQuery";
import { AttributeTypeEnum } from "@/types/attribute";
import { CategoryItemType } from "@/types/category";
import { SkuStatus, SkuType } from "@/types/sku";
import { exportToExcel } from "@/utils/exportUtils";

interface SkuTemplateExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSkuType?: SkuType;
}

export const SkuTemplateExportModal: React.FC<SkuTemplateExportModalProps> = ({
  isOpen,
  onClose,
  defaultSkuType = SkuType.COMMON,
}) => {
  const { t } = useTranslation(["sku", "common"]);
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);

  const { data: categoryData, isLoading: isCategoriesLoading } =
    useGetCategoryDataQuery({
      organizationId,
    });

  const categories = categoryData?.data?.categories || [];
  const selectedCategory = categories.find(
    (cat) => cat.id === selectedCategoryId,
  );

  const subCategories = selectedCategory?.subcategories || [];
  const hasSubCategories = subCategories.length > 0;

  const selectedSubCategory = hasSubCategories
    ? subCategories.find((s) => s.id === selectedSubCategoryId)
    : undefined;

  // Active category for attribute columns: sub-category if selected, otherwise parent
  const activeCategory = selectedSubCategory ?? selectedCategory;

  // Reset sub-category when parent category changes
  useEffect(() => {
    setSelectedSubCategoryId("");
  }, [selectedCategoryId]);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const columns = [
        { key: "skuName", label: "SKU Name" },
        { key: "internalCode", label: "Internal Code (optional)" },
        { key: "categoryId", label: "Category ID" },
        { key: "categoryName", label: "Category Name" },
      ];

      // Add sub-category columns when applicable
      if (hasSubCategories) {
        columns.push(
          { key: "subCategoryId", label: "Sub Category ID" },
          { key: "subCategoryName", label: "Sub Category Name" },
        );
      }

      columns.push(
        { key: "imageUrls", label: "Image URLs (comma-separated, max 5)" },
        { key: "status", label: "Status" },
        { key: "type", label: "Type" },
      );

      // Add dynamic attribute columns from active category
      if (activeCategory) {
        activeCategory.attribute_items?.forEach((attrItem) => {
          const attrName = attrItem.attribute.name;
          const isRequired = attrItem.is_required ? "*" : "";
          const attrType = attrItem.attribute.type;

          let suffix = "";
          if (attrType === AttributeTypeEnum.CHECKBOX) {
            suffix = " (comma-separated)";
          } else if (
            attrType === AttributeTypeEnum.SELECT &&
            attrItem.attribute.presets?.length
          ) {
            suffix = ` (${attrItem.attribute.presets.join("/")})`;
          } else if (attrType === AttributeTypeEnum.NUMBER) {
            suffix = " (number)";
          } else if (attrType === AttributeTypeEnum.BOOLEAN) {
            suffix = " (true/false)";
          }

          columns.push({
            key: `attr_${attrItem.attribute.id}`,
            label: `${attrName}${isRequired}${suffix}`,
          });
        });
      }

      // Build example row
      const exampleRow: Record<string, string> = {
        categoryId: selectedCategory?.id || "",
        categoryName: selectedCategory?.name || "",
        imageUrls:
          "https://example.com/image1.jpg,https://example.com/image2.jpg",
        internalCode: "INT-001",
        skuName: "Example Product",
        status: SkuStatus.ACTIVE,
        type: defaultSkuType,
      };

      if (hasSubCategories) {
        exampleRow.subCategoryId = selectedSubCategory?.id || "";
        exampleRow.subCategoryName = selectedSubCategory?.name || "";
      }

      if (activeCategory) {
        activeCategory.attribute_items?.forEach((attrItem) => {
          const attrType = attrItem.attribute.type;
          let exampleValue = "";

          switch (attrType) {
            case AttributeTypeEnum.TEXT:
              exampleValue = `Sample ${attrItem.attribute.name}`;
              break;
            case AttributeTypeEnum.NUMBER:
              exampleValue = "100";
              break;
            case AttributeTypeEnum.BOOLEAN:
              exampleValue = "true";
              break;
            case AttributeTypeEnum.SELECT:
              exampleValue = attrItem.attribute.presets?.[0] || "Option 1";
              break;
            case AttributeTypeEnum.CHECKBOX:
              exampleValue =
                attrItem.attribute.presets?.slice(0, 2).join(",") ||
                "Option 1,Option 2";
              break;
            case AttributeTypeEnum.DATE:
              exampleValue = "2024-01-15";
              break;
            case AttributeTypeEnum.DATETIME:
              exampleValue = "2024-01-15T10:30:00";
              break;
            default:
              exampleValue = `Sample ${attrItem.attribute.name}`;
          }

          exampleRow[`attr_${attrItem.attribute.id}`] = exampleValue;
        });
      }

      const exportName = selectedSubCategory?.name ?? selectedCategory?.name ?? "general";
      await exportToExcel({
        columns,
        data: [exampleRow],
        filename: `sku_template_${exportName.toLowerCase().replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}`,
      });

      onClose();
    } catch (error) {
      console.error("Failed to export template:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            {t("sku:exportTemplate.title", "Export SKU Template")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "sku:exportTemplate.description",
              "Download an Excel template with columns for a specific category. The template includes an example row to guide you.",
            )}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto pr-1">
        <div className="space-y-4 py-4">
          {/* Instructions */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm space-y-2">
              <p className="font-semibold">
                {t("sku:exportTemplate.howToUse", "How to use:")}
              </p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>
                  {t("sku:exportTemplate.step1", "Select a category below")}
                </li>
                <li>
                  {t(
                    "sku:exportTemplate.step2",
                    "Click 'Export Template' to download the Excel file",
                  )}
                </li>
                <li>
                  {t(
                    "sku:exportTemplate.step3",
                    "Fill in your product data following the example row format",
                  )}
                </li>
                <li>
                  {t(
                    "sku:exportTemplate.step4",
                    "Use 'Import Excel' button to upload your completed file",
                  )}
                </li>
              </ol>
              <p className="text-xs text-muted-foreground mt-2">
                {t(
                  "sku:exportTemplate.note",
                  "Note: Fields marked with * are required. Image URLs should be comma-separated (max 5).",
                )}
              </p>
            </AlertDescription>
          </Alert>

          {/* Category Selector */}
          <div className="space-y-2">
            <Label htmlFor="category">
              {t("sku:exportTemplate.selectCategory", "Select Category")} (
              {t("common:optional", "Optional")})
            </Label>
            <Select
              disabled={isCategoriesLoading}
              value={selectedCategoryId}
              onValueChange={setSelectedCategoryId}
            >
              <SelectTrigger id="category">
                <SelectValue
                  placeholder={
                    isCategoriesLoading
                      ? t("common:loading", "Loading...")
                      : t(
                          "sku:exportTemplate.categoryPlaceholder",
                          "Choose a category",
                        )
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <ScrollArea className="h-[200px]">
                  {categories.map((category: CategoryItemType) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                      {category.attribute_items?.length ? (
                        <span className="text-xs text-muted-foreground ml-2">
                          ({category.attribute_items.length}{" "}
                          {t("sku:exportTemplate.attributes", "attributes")})
                        </span>
                      ) : null}
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>

          {/* Sub Category Selector — only shown when parent has sub-categories */}
          {selectedCategory && hasSubCategories && (
            <div className="space-y-2">
              <Label htmlFor="sub-category">
                {t("sku:exportTemplate.selectSubCategory", "Select Sub Category")} (
                {t("common:optional", "Optional")})
              </Label>
              <Select
                value={selectedSubCategoryId}
                onValueChange={setSelectedSubCategoryId}
              >
                <SelectTrigger id="sub-category">
                  <SelectValue
                    placeholder={t(
                      "sku:exportTemplate.subCategoryPlaceholder",
                      "Choose a sub category",
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-[200px]">
                    {subCategories.map((sub: CategoryItemType) => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {sub.name}
                        {sub.attribute_items?.length ? (
                          <span className="text-xs text-muted-foreground ml-2">
                            ({sub.attribute_items.length}{" "}
                            {t("sku:exportTemplate.attributes", "attributes")})
                          </span>
                        ) : null}
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t(
                  "sku:exportTemplate.subCategoryNote",
                  "If selected, the template will use this sub category's attributes.",
                )}
              </p>
            </div>
          )}

          {/* Preview of attributes that will be included */}
          {activeCategory && activeCategory.attribute_items?.length ? (
            <div className="space-y-2">
              <Label>
                {t(
                  "sku:exportTemplate.attributesIncluded",
                  "Attributes that will be included:",
                )}
                {selectedSubCategory && (
                  <span className="text-xs text-muted-foreground ml-2">
                    ({t("sku:exportTemplate.fromSubCategory", "from sub category:")} {selectedSubCategory.name})
                  </span>
                )}
              </Label>
              <div className="border rounded-md p-3 bg-muted/50">
                <ScrollArea className="h-[150px]">
                  <div className="space-y-1 text-sm">
                    {activeCategory.attribute_items.map((attrItem) => (
                      <div
                        key={attrItem.attribute.id}
                        className="flex items-center gap-2"
                      >
                        <span className="font-medium">
                          {attrItem.attribute.name}
                        </span>
                        {attrItem.is_required && (
                          <span className="text-destructive text-xs">
                            *required
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          ({attrItem.attribute.type.toLowerCase()})
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          ) : activeCategory ? (
            <Alert variant="default">
              <AlertDescription>
                {t(
                  "sku:exportTemplate.noAttributes",
                  "This category has no attributes defined.",
                )}
              </AlertDescription>
            </Alert>
          ) : null}
        </div>
        </ScrollArea>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            {t("common:cancel", "Cancel")}
          </Button>
          <Button disabled={isExporting} onClick={handleExport}>
            {isExporting
              ? t("common:exporting", "Exporting...")
              : t("sku:exportTemplate.exportButton", "Export Template")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
