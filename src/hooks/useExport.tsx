/* eslint-disable max-lines */
import { useTranslation } from "next-i18next";
import { useState } from "react";

import {
  isKbmOrganizationId,
  KBM_ATTRIBUTE_ORDER,
} from "@/constants/organization";
import { useUser } from "@/context/user-context";
import useGetStockMovementTypesQuery from "@/hooks/api/stockMovement/useGetStockMovementTypesQuery";
import {
  extractUniqueAttributes,
  formatAttributeValues as formatSkuAttributeValues,
  getAttributeValue as getSkuAttributeValue,
} from "@/modules/dashboard/ledger-product/utils/attributeUtils";
import {
  extractCommonAttributes,
  formatAttributeValues,
  getAttributeValues,
  getHistoryItem,
} from "@/modules/dashboard/stock-movement-log/utils";
import type { ProductFilterOptions } from "@/services/product/getProductService";
import { StockMovementType } from "@/services/stockMovement/getStockMovementDataService";
import { InboundFilterOptions } from "@/types/inbound";
import { InventoryFilterOptions } from "@/types/inventory";
import {
  InventoryAreaDetailFilterOptions,
  InventoryAreaFilterOptions,
} from "@/types/inventory-area";
import { OutboundFilterOptions } from "@/types/outbound";
import { SkuItemType } from "@/types/sku";
import { exportToCSV, exportToExcel, formatDate } from "@/utils/exportUtils";
import { convertToTitleCase } from "@/utils/text";

export type ExportType =
  | "inventory"
  | "inventory-area"
  | "inventory-area-detail"
  | "inbound"
  | "outbound"
  | "inbound-packing"
  | "outbound-packing"
  | "st-kering-log"
  | "lamina-log"
  | "penerimaan-log"
  | "st-penerimaan-log-log"
  | "st-basah-log"
  | "inbound-penerimaan-log"
  | "outbound-penerimaan-log"
  | "inbound-st-basah"
  | "outbound-st-basah";
export type ExportFormat = "csv" | "excel";

type StockMovementFilterOptions = InboundFilterOptions | OutboundFilterOptions;
type StockMovementExportLayout = "default" | "log";

interface UseExportOptions {
  type: ExportType;
  inventoryFilters?: InventoryFilterOptions;
  stockMovementFilters?: StockMovementFilterOptions;
  stockMovementStoreId?: string;
  stockMovementTypeIds?: string[];
  stockMovementExportLayout?: StockMovementExportLayout;
  productFilters?: ProductFilterOptions;
  inventoryAreaStoreId?: string;
  inventoryAreaFilters?: InventoryAreaFilterOptions;
  inventoryAreaDetailStoreId?: string;
  inventoryAreaDetailSectionId?: string;
  inventoryAreaDetailFilters?: InventoryAreaDetailFilterOptions;
}

interface StatusHistory {
  item?: {
    status?: {
      name?: string;
    };
  };
}

interface CategoryItem {
  name: string;
}

export const useExport = ({
  type,
  inventoryFilters,
  stockMovementFilters,
  stockMovementStoreId,
  stockMovementTypeIds,
  stockMovementExportLayout = "default",
  productFilters,
  inventoryAreaStoreId,
  inventoryAreaFilters,
  inventoryAreaDetailStoreId,
  inventoryAreaDetailSectionId,
  inventoryAreaDetailFilters,
}: UseExportOptions) => {
  const [isExporting, setIsExporting] = useState(false);
  const { tokenPayload, selectedTeam } = useUser();
  const { t: tInbound } = useTranslation("inbound");
  const { t: tOutbound } = useTranslation("outbound");
  const { t: tStKeringLog } = useTranslation("st-kering-log");

  // Get stock movement types for inbound/outbound filtering (only when needed)
  const { data: stockMovementTypesData } = useGetStockMovementTypesQuery({
    organizationId: tokenPayload?.organization_id || "",
  });

  const getFilteredTypeIds = (direction: "INBOUND" | "OUTBOUND") => {
    return (
      stockMovementTypesData
        ?.filter(
          (stockType: StockMovementType) => stockType.direction === direction,
        )
        .map((stockType: StockMovementType) => stockType.id) || []
    );
  };

  const fetchInventoryData = async () => {
    const { getInventoryService } = await import(
      "@/services/inventory/getInventoryService"
    );

    const filters = {
      ...inventoryFilters,
      limit: 1000000,
      ...(inventoryFilters?.store_id && { store_id: inventoryFilters.store_id }),
    };

    const data = await getInventoryService({
      filters,
      organizationId: tokenPayload?.organization_id || "",
    });

    return data.data.inventories;
  };

  const fetchStockMovementData = async (direction: "INBOUND" | "OUTBOUND") => {
    const { getStockMovementDataService } = await import(
      "@/services/stockMovement/getStockMovementDataService"
    );

    const typeIds =
      stockMovementTypeIds && stockMovementTypeIds.length > 0
        ? stockMovementTypeIds
        : getFilteredTypeIds(direction);
    const filters = {
      ...stockMovementFilters,
      limit: 1000000,
      stock_movement_type_ids: typeIds.length > 0 ? typeIds : undefined,
    };

    const data = await getStockMovementDataService({
      filters,
      organizationId: tokenPayload?.organization_id || "",
      storeId: stockMovementStoreId ?? selectedTeam ?? "",
    });

    return data.data.stock_movements;
  };

  const exportInventory = async (format: ExportFormat) => {
    try {
      const inventoryData = await fetchInventoryData();

      if (!inventoryData || inventoryData.length === 0) {
        console.error("No inventory data available for export");
        return;
      }

      // Extract unique attributes across all inventory items
      const isKbm = isKbmOrganizationId(tokenPayload?.organization_id);
      const attrMap = new Map<string, { id: string; name: string }>();

      inventoryData.forEach((item) => {
        if (item.attributes && item.attributes.length > 0) {
          item.attributes.forEach((attr) => {
            if (!attrMap.has(attr.attribute_id)) {
              attrMap.set(attr.attribute_id, {
                id: attr.attribute_id,
                name: attr.name ?? attr.Name,
              });
            }
          });
        }
      });

      let uniqueAttributes = Array.from(attrMap.values());

      if (isKbm) {
        uniqueAttributes = uniqueAttributes.sort((a, b) => {
          const aIndex = KBM_ATTRIBUTE_ORDER.indexOf(
            a.name as (typeof KBM_ATTRIBUTE_ORDER)[number],
          );
          const bIndex = KBM_ATTRIBUTE_ORDER.indexOf(
            b.name as (typeof KBM_ATTRIBUTE_ORDER)[number],
          );
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          return (a.name ?? "").localeCompare(b.name ?? "");
        });
      } else {
        uniqueAttributes = uniqueAttributes.sort((a, b) =>
          (a.name ?? "").localeCompare(b.name ?? ""),
        );
      }

      // Build export data rows
      const data = inventoryData.map((item, index) => {
        const categories =
          item.categories?.map((cat: CategoryItem) => cat.name).join(", ") ||
          "";

        const attributeValues = uniqueAttributes.reduce(
          (acc, attribute) => {
            const found = item.attributes?.find(
              (attr) => attr.attribute_id === attribute.id,
            );
            const resolvedValues = found?.resolved_values;
            const rawValues = found?.values ?? found?.Values;
            const displayValues = resolvedValues && resolvedValues.length > 0
              ? resolvedValues.map((rv) => rv.name)
              : rawValues;
            acc[`attr_${attribute.id}`] =
              displayValues && displayValues.length > 0 ? displayValues.join(", ") : "-";
            return acc;
          },
          {} as Record<string, string>,
        );

        return {
          aging: String(item.aging ?? ""),
          categories,
          internal_code: item.internal_code || "",
          name: item.name || "",
          no: String(index + 1),
          quantity: String(item.quantity ?? ""),
          store_name: item.store_name || "",
          ...attributeValues,
        };
      });

      const columns = [
        { key: "no", label: "No" },
        { key: "name", label: "Product Name" },
        { key: "internal_code", label: "Internal Code" },
        { key: "store_name", label: "Store" },
        { key: "categories", label: "Categories" },
        { key: "quantity", label: "Quantity" },
        { key: "aging", label: "Aging (Days)" },
        ...uniqueAttributes.map((attribute) => ({
          key: `attr_${attribute.id}`,
          label: attribute.name,
        })),
      ];

      const exportOptions = {
        columns,
        data,
        filename: `inventory_export_${new Date().toISOString().split("T")[0]}`,
      };

      if (format === "csv") {
        exportToCSV(exportOptions);
      } else {
        await exportToExcel(exportOptions);
      }
    } catch (error) {
      console.error("Failed to export inventory data:", error);
      throw error;
    }
  };

  const exportStockMovement = async (
    format: ExportFormat,
    exportType: "inbound" | "outbound",
  ) => {
    try {
      const direction = exportType === "inbound" ? "INBOUND" : "OUTBOUND";
      const stockMovementData = await fetchStockMovementData(direction);

      if (!stockMovementData || stockMovementData.length === 0) {
        console.error(`No ${exportType} data available for export`);
        return;
      }

      if (stockMovementExportLayout === "log") {
        const t = exportType === "inbound" ? tInbound : tOutbound;
        const commonAttributes = extractCommonAttributes(
          stockMovementData,
          tokenPayload?.organization_id,
        );

        const data = stockMovementData.map((item, index) => {
          const historyItem = getHistoryItem(item);
          const sku = historyItem?.sku;
          const rfidDetail = historyItem?.rfid_detail;

          const statusCounts: Record<string, number> = {};
          item.new_item_status_histories?.forEach((history) => {
            const statusName = history.item?.status?.name;
            if (statusName) {
              statusCounts[statusName] = (statusCounts[statusName] || 0) + 1;
            }
          });

          const statusText = Object.entries(statusCounts)
            .map(([status, count]) => `${status} (${count})`)
            .join(", ");

          const categories =
            sku?.categories?.map((category) => category.name).join(", ") || "";

          const skuImages = sku?.image_urls?.join(", ") || "";
          const images = item.image_urls?.join(", ") || "";

          const attributeValues = commonAttributes.reduce(
            (acc, attribute) => {
              const values = getAttributeValues(sku?.attributes, attribute.id);
              acc[`attr_${attribute.id}`] = formatAttributeValues(values);
              return acc;
            },
            {} as Record<string, string>,
          );

          return {
            date: formatDate(item.created_at),
            internal_code: sku?.internal_code || "",
            no: String(index + 1),
            sku_name: sku?.name || "",
            status: statusText,
            type: convertToTitleCase(item.stock_movement_type?.name || ""),
            ...attributeValues,
            categories,
            images,
            note: item.note || "",
            operator: item.editor?.name || "",
            quantity: String(item.new_item_status_histories?.length || 0),
            rfid_epc: rfidDetail?.epc || "",
            rfid_name: rfidDetail?.name || "",
            sku_images: skuImages,
            store: item.store_name || "",
            store_area: item.section?.name || "",
          };
        });

        const columns = [
          { key: "no", label: t("table.header.no") },
          { key: "status", label: t("table.header.status") },
          {
            key: "type",
            label:
              exportType === "inbound"
                ? t("table.header.inboundType")
                : t("table.header.outboundType"),
          },
          {
            key: "date",
            label:
              exportType === "inbound"
                ? t("table.header.inboundDate")
                : t("table.header.outboundDate"),
          },
          { key: "sku_name", label: t("table.header.skuName") },
          { key: "internal_code", label: t("table.header.internalCode") },
          ...commonAttributes.map((attribute) => ({
            key: `attr_${attribute.id}`,
            label: attribute.name,
          })),
          {
            key: "quantity",
            label:
              exportType === "inbound"
                ? t("table.header.inboundQty")
                : t("table.header.outboundQty"),
          },
          { key: "store", label: t("table.header.store") },
          {
            key: "store_area",
            label:
              exportType === "inbound"
                ? t("table.header.storeArea")
                : t("table.header.warehouse"),
          },
          { key: "operator", label: t("table.header.operator") },
          { key: "note", label: t("table.header.note") },
          { key: "images", label: t("table.header.images") },
          { key: "rfid_name", label: t("table.header.rfidName") },
          { key: "rfid_epc", label: t("table.header.rfidEpc") },
          { key: "categories", label: t("table.header.categories") },
          { key: "sku_images", label: t("table.header.skuImages") },
        ];

        const exportOptions = {
          columns,
          data,
          filename: `${exportType}_export_${new Date().toISOString().split("T")[0]}`,
        };

        if (format === "csv") {
          exportToCSV(exportOptions);
        } else {
          await exportToExcel(exportOptions);
        }

        return;
      }

      const columns = [
        { key: "id", label: "ID" },
        {
          formatter: (histories: unknown) => {
            if (!Array.isArray(histories) || histories.length === 0) return "";
            const statusCounts: Record<string, number> = {};
            histories.forEach((history: StatusHistory) => {
              const statusName = history.item?.status?.name;
              if (statusName) {
                statusCounts[statusName] = (statusCounts[statusName] || 0) + 1;
              }
            });
            return Object.entries(statusCounts)
              .map(([status, count]) => `${status} (${count})`)
              .join(", ");
          },
          key: "new_item_status_histories",
          label: "Status",
        },
        { key: "stock_movement_type.name", label: "Type" },
        { formatter: formatDate, key: "created_at", label: "Date" },
        {
          formatter: (histories: unknown) =>
            String(Array.isArray(histories) ? histories.length : 0),
          key: "new_item_status_histories",
          label: "Quantity",
        },
        { key: "store_name", label: "Warehouse" },
        { key: "editor.name", label: "Operator" },
      ];

      const exportOptions = {
        columns,
        data: stockMovementData,
        filename: `${exportType}_export_${new Date().toISOString().split("T")[0]}`,
      };

      if (format === "csv") {
        exportToCSV(exportOptions);
      } else {
        await exportToExcel(exportOptions);
      }
    } catch (error) {
      console.error(`Failed to export ${exportType} data:`, error);
      throw error;
    }
  };

  const fetchProductData = async () => {
    const { getProductService } = await import(
      "@/services/product/getProductService"
    );

    const filters = {
      ...productFilters,
      limit: 1000000,
    };

    const data = await getProductService({
      filters,
      organizationId: tokenPayload?.organization_id || "",
    });

    return data.data.skus;
  };

  const exportStKeringLog = async (format: ExportFormat) => {
    try {
      const productData = await fetchProductData();

      if (!productData || productData.length === 0) {
        console.error("No ST Kering Log data available for export");
        return;
      }

      const uniqueAttributes = extractUniqueAttributes(
        productData,
        tokenPayload?.organization_id,
      );

      const data = productData.map((item: SkuItemType, index: number) => {
        const categories =
          item.categories?.map((category) => category.name).join(", ") || "";

        const imageUrls = item.image_urls?.join(", ") || "";

        const attributeValues = uniqueAttributes.reduce(
          (acc, attribute) => {
            const values = getSkuAttributeValue(item, attribute.id);
            acc[`attr_${attribute.id}`] = formatSkuAttributeValues(values);
            return acc;
          },
          {} as Record<string, string>,
        );

        return {
          ...attributeValues,
          categories,
          image_urls: imageUrls,
          internal_code: item.internal_code || "",
          item_status: item.item?.status?.name || "",
          name: item.name || "",
          no: String(index + 1),
          rfid_epc: item.rfid?.epc || "",
          rfid_name: item.rfid?.name || "",
          status: item.status || "",
          stock_movement_type: convertToTitleCase(
            item.item?.last_item_status_history?.new_stock_movement
              ?.stock_movement_type?.name || "",
          ),
        };
      });

      const columns = [
        { key: "no", label: tStKeringLog("table.header.no", "No") },
        {
          key: "image_urls",
          label: tStKeringLog("table.header.image", "Image"),
        },
        { key: "name", label: tStKeringLog("table.header.name", "Name") },
        {
          key: "internal_code",
          label: tStKeringLog("table.header.internalCode", "Internal Code"),
        },
        {
          key: "rfid_epc",
          label: tStKeringLog("table.header.rfidEpc", "RFID EPC"),
        },
        {
          key: "rfid_name",
          label: tStKeringLog("table.header.rfidName", "RFID Name"),
        },
        {
          key: "categories",
          label: tStKeringLog("table.header.category", "Category"),
        },
        { key: "status", label: tStKeringLog("table.header.status", "Status") },
        {
          key: "item_status",
          label: tStKeringLog("table.header.itemStatus", "Item Status"),
        },
        {
          key: "stock_movement_type",
          label: tStKeringLog(
            "table.header.stockMovementType",
            "Stock Movement Type",
          ),
        },
        ...uniqueAttributes.map((attribute) => ({
          key: `attr_${attribute.id}`,
          label: attribute.name,
        })),
      ];

      const exportOptions = {
        columns,
        data,
        filename: `st_kering_log_export_${new Date().toISOString().split("T")[0]}`,
      };

      if (format === "csv") {
        exportToCSV(exportOptions);
      } else {
        await exportToExcel(exportOptions);
      }
    } catch (error) {
      console.error("Failed to export ST Kering Log data:", error);
      throw error;
    }
  };

  const exportInventoryArea = async (format: ExportFormat) => {
    try {
      const { getInventoryService } = await import(
        "@/services/inventory/getInventoryService"
      );

      const storeId = inventoryAreaStoreId || selectedTeam || "";
      const result = await getInventoryService({
        filters: {
          ...(inventoryAreaFilters || {}),
          limit: 10000,
        },
        organizationId: tokenPayload?.organization_id || "",
      });

      const inventories = result.data?.inventories?.filter((item) => {
        return !storeId || item.store_id === storeId;
      });

      if (!inventories || inventories.length === 0) {
        console.error("No inventory area data available for export");
        return;
      }

      const data = inventories.map((item, index) => ({
        bundle_number: item.internal_code || "",
        bundle_quantity: String(item.bundle_qty ?? item.bundle_quantity ?? item.quantity ?? ""),
        creator_name: [item.creator?.first_name, item.creator?.last_name]
          .filter(Boolean)
          .join(" "),
        location: item.location || item.section?.name || item.section_name || "",
        no: String(index + 1),
        rfid_number:
          item.rfid_name ||
          (item.rfid && typeof item.rfid === "object"
            ? item.rfid.name || item.rfid.epc || ""
            : item.rfid || ""),
      }));

      const columns = [
        { key: "no", label: "No" },
        { key: "location", label: "Location" },
        { key: "rfid_number", label: "RFID Number" },
        { key: "bundle_number", label: "Bundle Number" },
        { key: "bundle_quantity", label: "Bundle Quantity" },
        { key: "creator_name", label: "Creator Name" },
      ];

      const exportOptions = {
        columns,
        data,
        filename: `inventory_area_export_${new Date().toISOString().split("T")[0]}`,
      };

      if (format === "csv") {
        exportToCSV(exportOptions);
      } else {
        await exportToExcel(exportOptions);
      }
    } catch (error) {
      console.error("Failed to export inventory area data:", error);
      throw error;
    }
  };

  const exportInventoryAreaDetail = async (format: ExportFormat) => {
    try {
      const { getInventoryAreaDetailService } = await import(
        "@/services/inventory-area/getInventoryAreaDetailService"
      );

      const storeId = inventoryAreaDetailStoreId || "";
      const sectionId = inventoryAreaDetailSectionId || "";

      if (!storeId || !sectionId) {
        console.error("Missing store ID or section ID for inventory area detail export");
        return;
      }

      const filters = {
        limit: 1000000,
        ...(inventoryAreaDetailFilters?.query && {
          query: inventoryAreaDetailFilters.query,
        }),
        ...(inventoryAreaDetailFilters?.start_date && {
          start_date: inventoryAreaDetailFilters.start_date,
        }),
        ...(inventoryAreaDetailFilters?.end_date && {
          end_date: inventoryAreaDetailFilters.end_date,
        }),
        ...(inventoryAreaDetailFilters?.stock_movement_type_ids &&
          inventoryAreaDetailFilters.stock_movement_type_ids.length > 0 && {
            stock_movement_type_ids:
              inventoryAreaDetailFilters.stock_movement_type_ids,
          }),
      };

      const result = await getInventoryAreaDetailService({
        filters,
        organizationId: tokenPayload?.organization_id || "",
        sectionId,
        storeId,
      });

      const sectionData = result.data?.section;
      const inventoryData = result.data?.inventories;
      if (!inventoryData || inventoryData.length === 0) {
        console.error("No inventory area detail data available for export");
        return;
      }

      const isKbm = isKbmOrganizationId(tokenPayload?.organization_id);
      const attrMap = new Map<string, { id: string; name: string }>();

      inventoryData.forEach((item) => {
        if (item.attributes && item.attributes.length > 0) {
          item.attributes.forEach((attr) => {
            if (!attrMap.has(attr.attribute_id)) {
              attrMap.set(attr.attribute_id, {
                id: attr.attribute_id,
                name: attr.name ?? attr.Name,
              });
            }
          });
        }
      });

      let uniqueAttributes = Array.from(attrMap.values());

      if (isKbm) {
        uniqueAttributes = uniqueAttributes.sort((a, b) => {
          const aIndex = KBM_ATTRIBUTE_ORDER.indexOf(
            a.name as (typeof KBM_ATTRIBUTE_ORDER)[number],
          );
          const bIndex = KBM_ATTRIBUTE_ORDER.indexOf(
            b.name as (typeof KBM_ATTRIBUTE_ORDER)[number],
          );
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          return (a.name ?? "").localeCompare(b.name ?? "");
        });
      } else {
        uniqueAttributes = uniqueAttributes.sort((a, b) =>
          (a.name ?? "").localeCompare(b.name ?? ""),
        );
      }

      const data = inventoryData.map((item, index) => {
        const categories =
          item.categories?.map((cat: CategoryItem) => cat.name).join(", ") ||
          "";

        const attributeValues = uniqueAttributes.reduce(
          (acc, attribute) => {
            const found = item.attributes?.find(
              (attr) => attr.attribute_id === attribute.id,
            );
            const resolvedValues = found?.resolved_values;
            const rawValues = found?.values ?? found?.Values;
            const displayValues = resolvedValues && resolvedValues.length > 0
              ? resolvedValues.map((rv) => rv.name)
              : rawValues;
            acc[`attr_${attribute.id}`] =
              displayValues && displayValues.length > 0 ? displayValues.join(", ") : "-";
            return acc;
          },
          {} as Record<string, string>,
        );

        return {
          aging: String(item.aging ?? ""),
          bundle_number: item.internal_code || "",
          categories,
          internal_code: item.internal_code || "",
          location: sectionData?.name || item.location || item.section_name || "",
          name: item.name || "",
          no: String(index + 1),
          quantity: String(item.quantity ?? ""),
          rfid_name: item.name || "",
          rfid_number: item.rfid_number || item.rfid_name || item.rfid || "",
          ...attributeValues,
        };
      });

      const columns = [
        { key: "no", label: "No" },
        { key: "name", label: "Product Name" },
        { key: "internal_code", label: "Internal Code" },
        { key: "bundle_number", label: "Bundle Number" },
        { key: "location", label: "Location" },
        { key: "rfid_name", label: "RFID Name" },
        { key: "rfid_number", label: "RFID Number" },
        { key: "categories", label: "Categories" },
        { key: "quantity", label: "Quantity" },
        { key: "aging", label: "Aging (Days)" },
        ...uniqueAttributes.map((attribute) => ({
          key: `attr_${attribute.id}`,
          label: attribute.name,
        })),
      ];

      const exportOptions = {
        columns,
        data,
        filename: `inventory_area_detail_export_${new Date().toISOString().split("T")[0]}`,
      };

      if (format === "csv") {
        exportToCSV(exportOptions);
      } else {
        await exportToExcel(exportOptions);
      }
    } catch (error) {
      console.error("Failed to export inventory area detail data:", error);
      throw error;
    }
  };

  const handleExport = async (format: ExportFormat) => {
    const resolvedStoreId =
      inventoryAreaStoreId ?? stockMovementStoreId ?? selectedTeam;

    if (!tokenPayload?.organization_id) {
      console.error("Missing organization ID");
      return;
    }

    if (type === "inventory-area-detail") {
      if (!inventoryAreaDetailStoreId || !inventoryAreaDetailSectionId) {
        console.error("Missing store ID or section ID for inventory area detail export");
        return;
      }
    } else if (!resolvedStoreId) {
      console.error("Missing store ID");
      return;
    }

    setIsExporting(true);
    try {
      switch (type) {
        case "inventory":
          await exportInventory(format);
          break;
        case "inventory-area":
          await exportInventoryArea(format);
          break;
        case "inventory-area-detail":
          await exportInventoryAreaDetail(format);
          break;
        case "inbound":
        case "inbound-packing":
          await exportStockMovement(format, "inbound");
          break;
        case "outbound":
        case "outbound-packing":
          await exportStockMovement(format, "outbound");
          break;
        case "st-kering-log":
        case "lamina-log":
        case "penerimaan-log":
        case "st-penerimaan-log-log":
        case "st-basah-log":
          await exportStKeringLog(format);
          break;
        case "inbound-penerimaan-log":
          await exportStockMovement(format, "inbound");
          break;
        case "outbound-penerimaan-log":
          await exportStockMovement(format, "outbound");
          break;
        case "inbound-st-basah":
          await exportStockMovement(format, "inbound");
          break;
        case "outbound-st-basah":
          await exportStockMovement(format, "outbound");
          break;
      }
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return {
    handleExport,
    // No longer dependent on queries
    hasData: true,

    isExporting,
    isLoading: false, // Always allow export attempt
  };
};
