import { format } from "date-fns";
import { useTranslation } from "next-i18next";
import React from "react";

import ButtonDetail from "@/components/shared/ButtonDetail";
import DiscrepancyStatusBadge from "@/components/shared/DiscrepancyStatusBadge";
import ResultBadge from "@/components/shared/ResultBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AuditHistoryItem } from "@/types/stock-audit-area";

interface AuditHistoryTableProps {
  data: AuditHistoryItem[];
  storeId: string;
}

const AuditHistoryTable: React.FC<AuditHistoryTableProps> = ({
  data,
  storeId,
}) => {
  const { t } = useTranslation("stock-audit-area");

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d/M/yyyy, HH:mm:ss");
    } catch {
      return dateString;
    }
  };


  if (data.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">
          {t("auditHistory.noData", "No audit history available")}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">
              {t("auditHistory.columns.auditId", "Audit ID")}
            </TableHead>
            <TableHead className="whitespace-nowrap">
              {t("auditHistory.columns.createdAt", "Created At")}
            </TableHead>
            <TableHead className="whitespace-nowrap">
              {t("auditHistory.columns.updatedAt", "Updated At")}
            </TableHead>
            <TableHead className="whitespace-nowrap">
              {t("auditHistory.columns.auditor", "Auditor")}
            </TableHead>
            <TableHead className="text-center whitespace-nowrap">
              {t("auditHistory.columns.result", "Result")}
            </TableHead>
            <TableHead className="text-center whitespace-nowrap">
              {t("auditHistory.columns.expectedQuantity", "Expected Qty")}
            </TableHead>
            <TableHead className="text-center whitespace-nowrap">
              {t("auditHistory.columns.actualQuantity", "Actual Qty")}
            </TableHead>
            <TableHead className="text-center whitespace-nowrap">
              {t("auditHistory.columns.missing", "Missing")}
            </TableHead>
            <TableHead className="text-center whitespace-nowrap">
              {t("auditHistory.columns.extra", "Extra")}
            </TableHead>
            <TableHead className="whitespace-nowrap">
              {t("auditHistory.columns.notes", "Notes")}
            </TableHead>
            <TableHead className="text-right whitespace-nowrap">
              {t("auditHistory.columns.actions", "Actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium whitespace-nowrap">
                {item.id.split("-")[0].toUpperCase()}
              </TableCell>
              <TableCell className="whitespace-nowrap">{formatDate(item.created_at)}</TableCell>
              <TableCell className="whitespace-nowrap">{formatDate(item.updated_at)}</TableCell>
              <TableCell className="whitespace-nowrap">
                {item.editor
                  ? `${item.editor.first_name} ${item.editor.last_name}`
                  : "-"}
              </TableCell>
              <TableCell className="text-center">
                <ResultBadge
                  className="whitespace-nowrap"
                  customText={t(`result.${item.result.toLowerCase()}`)}
                  result={item.result}
                />
              </TableCell>
              <TableCell className="text-center">
                {item.expected_quantity}
              </TableCell>
              <TableCell className="text-center">
                <DiscrepancyStatusBadge
                  customText={String(item.actual_quantity)}
                  status="MATCHED"
                />
              </TableCell>
              <TableCell className="text-center">
                <DiscrepancyStatusBadge
                  customText={String(item.missing_quantity)}
                  status="MISSING"
                />
              </TableCell>
              <TableCell className="text-center">
                <DiscrepancyStatusBadge
                  customText={String(item.extra_quantity)}
                  status="UNEXPECTED"
                />
              </TableCell>
              <TableCell className="max-w-xs truncate" title={item.note || "-"}>
                {item.note || "-"}
              </TableCell>
              <TableCell className="text-right">
                <ButtonDetail
                  href={`/dashboard/stock-audit/${storeId}/${item.id}`}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AuditHistoryTable;
