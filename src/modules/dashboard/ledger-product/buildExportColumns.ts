import { TFunction } from "i18next";

import { AttributeTypeEnum, SKUAtributeItemType } from "@/types/attribute";
import { formatDisplayTimestamp } from "@/utils/dateTime";
import { convertToTitleCase } from "@/utils/text";

import { UniqueAttribute } from "./utils/attributeUtils";

type ExportColumn = {
  formatter?: (value: unknown) => string;
  key: string;
  label: string;
};

const toStringOrDash = (value: unknown): string => {
  if (value == null || value === "") return "-";
  return String(value);
};

const formatDateOrDash = (value: unknown): string => {
  if (!value || typeof value !== "string") return "-";
  return formatDisplayTimestamp(value);
};

const DATE_TYPES = new Set<AttributeTypeEnum>([AttributeTypeEnum.DATE, AttributeTypeEnum.DATETIME]);

const formatAttributeDate = (value: string): string => {
  const formatted = formatDisplayTimestamp(value);
  return formatted !== "-" ? formatted : value;
};

const makeAttributeFormatter =
  (attributeId: string) =>
  (value: unknown): string => {
    const attributes = value as SKUAtributeItemType[] | null | "";
    if (!attributes || !Array.isArray(attributes)) return "-";

    const attribute = attributes.find(
      (a) => a.attribute_id === attributeId,
    );
    if (!attribute) return "-";

    const attributeType = (attribute.type ?? attribute.Type ?? "") as
      | AttributeTypeEnum
      | "";

    if (attributeType === AttributeTypeEnum.REFERENCE_GROUP) {
      const resolvedNames =
        attribute.resolved_values?.map((v) => v.name).filter(Boolean) ?? [];
      if (resolvedNames.length > 0) return resolvedNames.join(", ");
    }

    const rawValues = attribute.values ?? attribute.Values ?? [];
    if (rawValues.length === 0) return "-";

    if (DATE_TYPES.has(attributeType as AttributeTypeEnum)) {
      return rawValues.map(formatAttributeDate).join(", ");
    }

    return rawValues.join(", ");
  };

export const buildExportColumns = (
  t: TFunction,
  uniqueAttributes: UniqueAttribute[],
): ExportColumn[] => {
  const baseColumns: ExportColumn[] = [
    { key: "name", label: t("ledger-product:item.name", "Name") },
    { key: "internal_code", label: t("ledger-product:item.internalCode", "Internal Code") },
    { key: "rfid.epc", label: t("ledger-product:item.rfidEpc", "RFID EPC") },
    { key: "rfid.name", label: t("ledger-product:item.rfidName", "RFID Name") },
    { key: "status", label: t("ledger-product:item.status", "Status") },
    {
      formatter: (value) => {
        const categories = value as { name: string }[] | null | "";
        if (!categories || !Array.isArray(categories) || categories.length === 0) return "-";
        return categories.map((c) => c.name).join(", ");
      },
      key: "categories",
      label: t("ledger-product:table.header.category", "Category"),
    },
    { key: "item.section.name", label: t("ledger-product:table.header.section", "Section") },
    {
      formatter: (value) => toStringOrDash(value).toUpperCase() === "-" ? "-" : convertToTitleCase(String(value)),
      key: "item.last_item_status_history.new_stock_movement.stock_movement_type.name",
      label: t("ledger-product:item.lastMovement", "Last Movement"),
    },
    { formatter: formatDateOrDash, key: "item.inbound_date", label: t("ledger-product:item.inboundDate", "Inbound Date") },
    { formatter: formatDateOrDash, key: "item.outbound_date", label: t("ledger-product:item.outboundDate", "Outbound Date") },
    { formatter: formatDateOrDash, key: "item.area_transfer_date", label: t("ledger-product:item.areaTransferDate", "Area Transfer Date") },
    {
      formatter: (value) => (typeof value === "number" ? `${value}d` : "-"),
      key: "item.aging_days",
      label: t("ledger-product:item.agingDays", "Aging Days"),
    },
  ];

  const attributeColumns: ExportColumn[] = uniqueAttributes.map((attribute) => ({
    formatter: makeAttributeFormatter(attribute.id),
    key: "attributes",
    label: attribute.name,
  }));

  return [...baseColumns, ...attributeColumns];
};
