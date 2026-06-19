"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SkuItemType } from "@/types/sku";

interface DetailInventorySkuInfoProps {
  skuData: SkuItemType | null;
}

const DetailInventorySkuInfo: React.FC<DetailInventorySkuInfoProps> = ({
  skuData,
}) => {
  const { t } = useTranslation("inventory");
  if (!skuData) {
    return null;
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "default";
      case "INACTIVE":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getAttributeTypeColor = (type: string) => {
    switch (type) {
      case "TEXT":
        return "bg-blue-100 text-blue-800";
      case "NUMBER":
        return "bg-green-100 text-green-800";
      case "SELECT":
        return "bg-purple-100 text-purple-800";
      case "CHECKBOX":
        return "bg-orange-100 text-orange-800";
      case "REFERENCE_GROUP":
        return "bg-teal-100 text-teal-800";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Format attribute value - trim decimals to max 2 digits for NUMBER type
  const formatAttributeValue = (value: string, type: string): string => {
    if (type === "NUMBER") {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        // Check if it's a whole number
        if (Number.isInteger(numValue)) {
          return numValue.toString();
        }
        // Format with max 2 decimal places, removing trailing zeros
        return parseFloat(numValue.toFixed(2)).toString();
      }
    }
    return value;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">
          {t("skuInformation")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {/* Basic SKU Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <div>
            <span className="text-xs text-muted-foreground font-medium">
              {t("name")}
            </span>
            <p className="text-sm font-medium mt-1">
              <Link
                className="text-primary hover:underline"
                href={
                  skuData.type === "UNIQUE"
                    ? `/dashboard/product/${skuData.id}`
                    : `/dashboard/sku/${skuData.id}`
                }
              >
                {skuData.name}
              </Link>
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium">
              {t("sku", "SKU")}
            </span>
            <p className="font-mono text-sm font-medium mt-1">
              {skuData.sku || "-"}
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium">
              {t("internalCode", "Internal Code")}
            </span>
            <p className="font-mono text-sm font-medium mt-1">
              {skuData.internal_code || "-"}
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium">
              {t("status")}
            </span>
            <div className="mt-1">
              <Badge
                className="text-xs"
                variant={getStatusVariant(skuData.status)}
              >
                {skuData.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Categories */}
        {skuData.categories && skuData.categories.length > 0 && (
          <div>
            <span className="text-xs text-muted-foreground font-medium">
              {t("categories")}
            </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {skuData.categories.map((category, index) => (
                <Badge key={index} className="text-xs" variant="secondary">
                  {category.code ? `${category.code} - ${category.name}` : category.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Images */}
        {skuData.image_urls && skuData.image_urls.length > 0 && (
          <div>
            <span className="text-xs text-muted-foreground font-medium">
              {t("images")}
            </span>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-1 mt-1">
              {skuData.image_urls.map((url, index) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    fill
                    alt={`${skuData.name} ${index + 1}`}
                    className="rounded border object-cover"
                    sizes="(max-width: 768px) 25vw, 16vw"
                    src={url}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attributes */}
        {skuData.attributes && skuData.attributes.length > 0 && (
          <div>
            <span className="text-xs text-muted-foreground font-medium">
              {t("attributes")}
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 mt-1">
              {skuData.attributes.map((attribute, index) => {
                const attrName = attribute.name ?? attribute.Name;
                const attrType = attribute.type ?? attribute.Type;
                const attrDesc = attribute.description ?? attribute.Description;
                const attrValues = attribute.values ?? attribute.Values ?? [];
                const resolvedMap = new Map(
                  (attribute.resolved_values ?? []).map((rv) => [rv.id, rv.name])
                );
                return (
                  <div key={index} className="border rounded p-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">
                        {attrName}
                      </span>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${getAttributeTypeColor(
                          attrType
                        )}`}
                      >
                        {attrType}
                      </span>
                    </div>
                    {attrDesc && (
                      <p className="text-xs text-muted-foreground mb-1">
                        {attrDesc}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {attrValues.map((value, valueIndex) => (
                        <Badge
                          key={valueIndex}
                          className="text-xs"
                          variant="outline"
                        >
                          {resolvedMap.has(value)
                            ? resolvedMap.get(value)
                            : formatAttributeValue(value, attrType)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state for no images */}
        {(!skuData.image_urls || skuData.image_urls.length === 0) && (
          <div>
            <span className="text-xs text-muted-foreground font-medium">Images</span>
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded text-center mt-1">
              {t("noImagesAvailable")}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DetailInventorySkuInfo;
