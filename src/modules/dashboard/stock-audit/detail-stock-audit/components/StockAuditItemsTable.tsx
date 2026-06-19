import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "next-i18next";
import React, { useState } from "react";
import { toast } from "sonner";

import DiscrepancyStatusBadge from "@/components/shared/DiscrepancyStatusBadge";
import ResultBadge from "@/components/shared/ResultBadge";
import TableExportButton from "@/components/shared/TableExportButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DiscrepancyItem, StockAuditDetail } from "@/types/stock-audit";
import { convertToTitleCase } from "@/utils/text";

import { useDetailStockAudit } from "../context/DetailStockAuditContext";
import { flattenDiscrepancyItems, normalizeDiscrepancyStatus } from "../utils";
import StockAuditDiscrepancyRow from "./StockAuditDiscrepancyRow";

interface StockAuditItemsTableProps {
  data: StockAuditDetail;
}

const StockAuditItemsTable: React.FC<StockAuditItemsTableProps> = ({
  data,
}) => {
  const { t } = useTranslation("stock-audit");
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const { updateNote } = useDetailStockAudit();
  const discrepancyItems = flattenDiscrepancyItems(data.discrepancy_items);

  const toggleExpand = (id: string) => {
    setExpandedItemId(expandedItemId === id ? null : id);
  };

  const getRfidTypeText = (type: string) => {
    switch (type) {
      case "REUSABLE":
        return t("rfid.type.reusable");
      case "DISPOSABLE":
        return t("rfid.type.disposable");
      default:
        return type;
    }
  };

  const getRfidCategoryText = (category: string) => {
    switch (category) {
      case "SINGLE":
        return t("rfid.category.single");
      case "PACKAGE":
        return t("rfid.category.package");
      default:
        return category;
    }
  };

  const handleNoteChange = (itemId: string, value: string) => {
    setNotes({ ...notes, [itemId]: value });
  };

  const handleNoteSubmit = (itemId: string) => {
    const note = notes[itemId] || "";
    updateNote(note);
    toast.success(t("note.saveSuccess"));
  };

  const renderDiscrepancyItems = (discrepancies: DiscrepancyItem[]) => {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[44px] text-center">
              {t("table.header.id")}
            </TableHead>
            <TableHead className="w-[120px] text-center">RFID Name</TableHead>
            <TableHead className="w-[120px] text-center">
              {t("table.header.epc")}
            </TableHead>
            <TableHead className="w-[150px] text-center">
              {t("table.header.skuName")}
            </TableHead>
            <TableHead className="w-[150px] text-center">
              {t("table.header.internalCode")}
            </TableHead>
            <TableHead className="w-[120px] text-center">
              {t("table.header.section")}
            </TableHead>
            <TableHead className="w-[100px] text-center">
              RFID Category
            </TableHead>
            <TableHead className="w-[100px] text-center">RFID Type</TableHead>
            <TableHead className="w-[100px] text-center">Image</TableHead>
            <TableHead className="w-[93px] text-center">
              {t("detail.match")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {discrepancies?.map((item) => (
            <StockAuditDiscrepancyRow
              key={`${item.discrepancy_id}-${item.discrepancy_status}-${item.item_id}`}
              item={item}
            />
          ))}
        </TableBody>
      </Table>
    );
  };

  // Export data for discrepancy items with summary below
  const exportDiscrepancyData = discrepancyItems.map((item, index) => ({
    epc: item.epc,
    id: item.item_id.slice(0, 4),
    imageUrl:
      item.sku?.image_urls && item.sku.image_urls.length > 0
        ? item.sku.image_urls[0]
        : "-",
    internalCode: item.sku?.internal_code || "-",
    match: convertToTitleCase(
      normalizeDiscrepancyStatus(item.discrepancy_status),
    ),
    no: String(index + 1),
    rfidCategory: item.rfid_detail?.category
      ? getRfidCategoryText(item.rfid_detail.category)
      : "-",
    rfidName: item.rfid_detail?.name || "-",
    rfidType: item.rfid_detail?.type
      ? getRfidTypeText(item.rfid_detail.type)
      : "-",
    section: item.section?.name || "-",
    skuName: item.sku?.name || "-",
  }));

  // Add summary rows below the discrepancy items
  const unexpectedCount = discrepancyItems.filter(
    (item) =>
      normalizeDiscrepancyStatus(item.discrepancy_status) === "UNEXPECTED",
  ).length;

  const summaryData = [
    {
      epc: "",
      id: "",
      imageUrl: "",
      internalCode: "",
      match: "",
      no: "",
      rfidCategory: "",
      rfidName: "",
      rfidType: "",
      section: "",
      skuName: "",
    },
    {
      epc: "",
      id: "",
      imageUrl: "",
      internalCode: "",
      match: "",
      no: "SUMMARY",
      rfidCategory: "",
      rfidName: "",
      rfidType: "",
      section: "",
      skuName: "",
    },
    {
      epc: "",
      id: String(data.actual_quantity),
      imageUrl: "",
      internalCode: "",
      match: "",
      no: t("table.header.matchQty"),
      rfidCategory: "",
      rfidName: "",
      rfidType: "",
      section: "",
      skuName: "",
    },
    {
      epc: "",
      id: String(data.expected_quantity),
      imageUrl: "",
      internalCode: "",
      match: "",
      no: t("table.header.expected"),
      rfidCategory: "",
      rfidName: "",
      rfidType: "",
      section: "",
      skuName: "",
    },
    {
      epc: "",
      id: String(data.expected_quantity - data.actual_quantity),
      imageUrl: "",
      internalCode: "",
      match: "",
      no: t("table.header.anomaly"),
      rfidCategory: "",
      rfidName: "",
      rfidType: "",
      section: "",
      skuName: "",
    },
    {
      epc: "",
      id: String(unexpectedCount || 0),
      imageUrl: "",
      internalCode: "",
      match: "",
      no: t("table.header.totalItemExtra"),
      rfidCategory: "",
      rfidName: "",
      rfidType: "",
      section: "",
      skuName: "",
    },
  ];

  const exportColumns = [
    { key: "no", label: "No" },
    { key: "id", label: t("table.header.id") },
    { key: "rfidName", label: "RFID Name" },
    { key: "epc", label: t("table.header.epc") },
    { key: "skuName", label: t("table.header.skuName") },
    { key: "internalCode", label: t("table.header.internalCode") },
    { key: "section", label: t("table.header.section") },
    { key: "rfidCategory", label: "RFID Category" },
    { key: "rfidType", label: "RFID Type" },
    { key: "imageUrl", label: "SKU Image URL" },
    { key: "match", label: t("detail.match") },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold font-heading">{t("detail.items")}</h2>
        <TableExportButton
          columns={exportColumns}
          data={[...exportDiscrepancyData, ...summaryData]}
          filename={`stock_audit_discrepancy_${data.id.slice(0, 8)}_${new Date().toISOString().split("T")[0]}`}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[44px] text-center">
              {t("table.header.sku")}
            </TableHead>
            <TableHead className="w-[174px] text-center">
              {t("table.header.skuName")}
            </TableHead>
            <TableHead className="w-[94px] text-center">
              {t("table.header.matchQty")}
            </TableHead>
            <TableHead className="w-[98px] text-center">
              {t("table.header.expected")}
            </TableHead>
            <TableHead className="w-[93px] text-center">
              {t("detail.match")}
            </TableHead>
            <TableHead className="w-[140px] text-center">
              {t("table.header.anomaly")}
            </TableHead>
            <TableHead className="w-[140px] text-center">
              {t("table.header.totalItemExtra")}
            </TableHead>
            <TableHead className="w-[140px] text-center">
              {t("table.header.note")}
            </TableHead>
            <TableHead className="w-[50px] text-center"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="text-center font-medium">
              1
            </TableCell>
            <TableCell className="text-center">
              {data.checking_object?.name ?? "-"}
            </TableCell>
            <TableCell className="text-center">
              <DiscrepancyStatusBadge
                customText={String(data.actual_quantity)}
                status="MATCHED"
              />
            </TableCell>
            <TableCell className="text-center">
              {data.expected_quantity}
            </TableCell>
            <TableCell className="text-center">
              <ResultBadge
                customText={
                  data.result ? t(`result.${data.result.toLowerCase()}`) : "-"
                }
                result={
                  (data.result as "CONSISTENT" | "MISMATCH" | "UNKNOWN") ||
                  "UNKNOWN"
                }
              />
            </TableCell>
            <TableCell className="text-center">
              <DiscrepancyStatusBadge
                customText={String(
                  data.expected_quantity - data.actual_quantity,
                )}
                status="MISSING"
              />
            </TableCell>
            <TableCell className="text-center">
              <DiscrepancyStatusBadge
                customText={String(unexpectedCount || 0)}
                status="UNEXPECTED"
              />
            </TableCell>
            <TableCell className="text-center">
              <div className="flex items-center gap-2">
                <Input
                  className="text-xs"
                  placeholder="Add Note"
                  value={notes[data.id] || data.note || ""}
                  onChange={(e) => handleNoteChange(data.id, e.target.value)}
                />
                <Button
                  className="h-8 w-8 p-0 flex-shrink-0"
                  size="sm"
                  onClick={() => handleNoteSubmit(data.id)}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
            <TableCell className="text-center">
              <Button
                className="p-0 h-8 w-8"
                size="sm"
                variant="ghost"
                onClick={() => toggleExpand(data.id)}
              >
                {expandedItemId === data.id ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </TableCell>
          </TableRow>
          {expandedItemId === data.id && (
            <TableRow>
              <TableCell className="p-0" colSpan={9}>
                <div className="p-4 bg-muted">
                  {renderDiscrepancyItems(discrepancyItems)}
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default StockAuditItemsTable;
