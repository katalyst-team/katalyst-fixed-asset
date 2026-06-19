import { useTranslation } from "next-i18next";
import type { ChangeEvent } from "react";

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
import { AttributeItemType, AttributeTypeEnum } from "@/types/attribute";

type CategoryAttributeItem = {
  attribute: AttributeItemType;
  is_required: boolean;
};

interface KbmItemAttributesCardProps {
  attributeValues: Record<string, string | number | string[]>;
  categoryAttributes: CategoryAttributeItem[];
  isDisabled: boolean;
  title: string;
  translationNamespace: string;
  onAttributeChange: (
    attributeId: string,
    value: string | number | string[]
  ) => void;
}

const KbmItemAttributesCard = ({
  attributeValues,
  categoryAttributes,
  isDisabled,
  onAttributeChange,
  title,
  translationNamespace,
}: KbmItemAttributesCardProps) => {
  const { t } = useTranslation([translationNamespace]);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>
          {t("form.section.attributes", `${title} Attributes`)}
        </CardTitle>
        <CardDescription>
          {t(
            "form.section.attributesDescription",
            `Provide detailed specifications for this ${title}. Fields marked with * are required.`
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {categoryAttributes.map((attributeItem) => (
            <div key={attributeItem.attribute.id} className="space-y-2">
              <Label className="text-base font-medium">
                {attributeItem.attribute.name}
                {attributeItem.is_required && (
                  <span className="ml-1 text-destructive">*</span>
                )}
              </Label>
              {attributeItem.attribute.type === AttributeTypeEnum.SELECT &&
                attributeItem.attribute.presets &&
                attributeItem.attribute.presets.length > 0 ? (
                <Select
                  disabled={isDisabled}
                  value={
                    attributeValues[attributeItem.attribute.id] !== undefined
                      ? String(attributeValues[attributeItem.attribute.id])
                      : ""
                  }
                  onValueChange={(value) =>
                    onAttributeChange(attributeItem.attribute.id, value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select value..." />
                  </SelectTrigger>
                  <SelectContent>
                    {attributeItem.attribute.presets.map((preset) => (
                      <SelectItem key={preset} value={preset}>
                        {preset}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  disabled={isDisabled}
                  placeholder={
                    attributeItem.attribute.type === AttributeTypeEnum.NUMBER
                      ? "0"
                      : "Enter value..."
                  }
                  type={
                    attributeItem.attribute.type === AttributeTypeEnum.NUMBER
                      ? "number"
                      : "text"
                  }
                  value={
                    attributeValues[attributeItem.attribute.id] !== undefined
                      ? String(attributeValues[attributeItem.attribute.id])
                      : ""
                  }
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const value =
                      attributeItem.attribute.type === AttributeTypeEnum.NUMBER
                        ? parseFloat(e.target.value) || 0
                        : e.target.value;
                    onAttributeChange(attributeItem.attribute.id, value);
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default KbmItemAttributesCard;
