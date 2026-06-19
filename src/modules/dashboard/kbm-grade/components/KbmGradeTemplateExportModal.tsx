import { FileSpreadsheet, Info } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useMemo, useState } from "react";
import { toast } from "sonner";

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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@/context/user-context";
import useGetCategoryDataQuery from "@/hooks/api/category/useGetCategoryDataQuery";
import { AttributeTypeEnum } from "@/types/attribute";
import { exportToExcel } from "@/utils/exportUtils";

import { useKbmGradeConfig } from "../KbmGradeConfigContext";

interface KbmGradeTemplateExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const KBM_GRADE_CATEGORY_NAMES = [
  "KBM Grade ST Susun",
  "KBM Grade ST Batang",
  "KBM Grade",
];
const ATTR_TYPE = "G_TYPE";
const GRADE_NAME_COLUMN = "Grade Name";

const getAttributeExampleValue = (
  attrType: AttributeTypeEnum,
  attrName: string,
  presets?: string[]
): string => {
  switch (attrType) {
    case AttributeTypeEnum.TEXT:
      return `Sample ${attrName}`;
    case AttributeTypeEnum.NUMBER:
      return "100";
    case AttributeTypeEnum.BOOLEAN:
      return "true";
    case AttributeTypeEnum.SELECT:
      return presets?.[0] || "Option 1";
    case AttributeTypeEnum.CHECKBOX:
      return presets?.slice(0, 2).join(",") || "Option 1,Option 2";
    case AttributeTypeEnum.DATE:
      return "2024-01-15";
    case AttributeTypeEnum.DATETIME:
      return "2024-01-15T10:30:00";
    default:
      return `Sample ${attrName}`;
  }
};

const normalizeAttributeType = (type: string): AttributeTypeEnum => {
  if (
    (Object.values(AttributeTypeEnum) as string[]).includes(type)
  ) {
    return type as AttributeTypeEnum;
  }
  return AttributeTypeEnum.TEXT;
};

export const KbmGradeTemplateExportModal: React.FC<
  KbmGradeTemplateExportModalProps
> = ({ isOpen, onClose }) => {
  const { gradeType, title, translationNamespace } = useKbmGradeConfig();
  const { t } = useTranslation([translationNamespace, "common"]);
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const [isExporting, setIsExporting] = useState(false);

  const { data: categoryData, isLoading: isCategoriesLoading } =
    useGetCategoryDataQuery({
      organizationId,
    });

  const kbmGradeCategory = useMemo(() => {
    if (!categoryData?.data?.categories) return undefined;
    const lowerNames = KBM_GRADE_CATEGORY_NAMES.map((n) => n.toLowerCase());
    return categoryData.data.categories.find((category) =>
      lowerNames.includes(category.name.toLowerCase())
    );
  }, [categoryData]);

  const exportableAttributes = useMemo(() => {
    if (!kbmGradeCategory?.attribute_items) return [];
    return kbmGradeCategory.attribute_items.filter(
      (item) => item.attribute && item.attribute.name !== ATTR_TYPE
    );
  }, [kbmGradeCategory]);

  const handleExport = async () => {
    if (!kbmGradeCategory) {
      toast.error(
        t(
          "exportTemplate.categoryNotFound",
          "KBM Grade category not found. Please create the category first."
        )
      );
      return;
    }

    setIsExporting(true);

    try {
      const columns = [{ key: "gradeName", label: GRADE_NAME_COLUMN }];

      exportableAttributes.forEach((attrItem) => {
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

      const exampleRow: Record<string, string> = {
        gradeName: `Example ${title}`,
      };

      exportableAttributes.forEach((attrItem) => {
        exampleRow[`attr_${attrItem.attribute.id}`] = getAttributeExampleValue(
          normalizeAttributeType(attrItem.attribute.type),
          attrItem.attribute.name,
          attrItem.attribute.presets
        );
      });

      await exportToExcel({
        columns,
        data: [exampleRow],
        filename: `kbm_grade_${gradeType.toLowerCase()}_template_${new Date()
          .toISOString()
          .split("T")[0]}`,
      });

      onClose();
    } catch (error) {
      console.error("Failed to export KBM Grade template:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const hasAttributes = exportableAttributes.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            {t("exportTemplate.title", "Export KBM Grade Template")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "exportTemplate.description",
              "Download an Excel template tailored for this grade type. The file includes the required attributes and an example row."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm space-y-2">
              <p className="font-semibold">
                {t("exportTemplate.howToUse", "How to use:")}
              </p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>
                  {t(
                    "exportTemplate.step1",
                    "Review the attributes included in the template"
                  )}
                </li>
                <li>
                  {t(
                    "exportTemplate.step2",
                    "Click 'Export Template' to download the Excel file"
                  )}
                </li>
                <li>
                  {t(
                    "exportTemplate.step3",
                    "Fill in your grade data following the example row format"
                  )}
                </li>
                <li>
                  {t(
                    "exportTemplate.step4",
                    "Use 'Import Excel' to upload your completed file"
                  )}
                </li>
              </ol>
              <p className="text-xs text-muted-foreground mt-2">
                {t("exportTemplate.note", {
                  defaultValue:
                    "Fields marked with * are required. G_TYPE is auto-set to {{gradeType}}.",
                  gradeType,
                })}
              </p>
            </AlertDescription>
          </Alert>

          {!kbmGradeCategory && !isCategoriesLoading && (
            <Alert variant="destructive">
              <AlertDescription>
                {t(
                  "exportTemplate.categoryNotFound",
                  "KBM Grade category not found. Please create the category first."
                )}
              </AlertDescription>
            </Alert>
          )}

          {kbmGradeCategory && (
            <div className="space-y-2">
              <div className="text-sm font-medium">
                {t("exportTemplate.categoryLabel", {
                  category: kbmGradeCategory.name,
                  defaultValue: "Category: {{category}}",
                })}
              </div>

              {hasAttributes ? (
                <div className="border rounded-md p-3 bg-muted/50">
                  <ScrollArea className="h-[150px]">
                    <div className="space-y-1 text-sm">
                      {exportableAttributes.map((attrItem) => (
                        <div
                          key={attrItem.attribute.id}
                          className="flex items-center gap-2"
                        >
                          <span className="font-medium">
                            {attrItem.attribute.name}
                          </span>
                          {attrItem.is_required && (
                            <span className="text-xs text-red-500">
                              {t("exportTemplate.required", "*required")}
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
              ) : (
                <Alert variant="default">
                  <AlertDescription>
                    {t(
                      "exportTemplate.noAttributes",
                      "This category has no attributes defined."
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("common:cancel", "Cancel")}
          </Button>
          <Button
            disabled={
              isExporting || isCategoriesLoading || !kbmGradeCategory
            }
            onClick={handleExport}
          >
            {isExporting
              ? t("common:exporting", "Exporting...")
              : t("exportTemplate.exportButton", "Export Template")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
