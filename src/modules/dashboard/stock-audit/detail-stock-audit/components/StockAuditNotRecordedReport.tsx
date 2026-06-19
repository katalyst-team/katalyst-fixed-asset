import { useTranslation } from "next-i18next";
import React from "react";

import DiscrepancyStatusBadge from "@/components/shared/DiscrepancyStatusBadge";
import TableExportButton from "@/components/shared/TableExportButton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DiscrepancyItemsResponse } from "@/types/stock-audit";

import { normalizeDiscrepancyStatus } from "../utils";
import {
  generateNotRecordedReport,
} from "../utils/reportDataProcessor";

interface StockAuditNotRecordedReportProps {
  discrepancyItems: DiscrepancyItemsResponse;
  auditId: string;
}

const StockAuditNotRecordedReport: React.FC<StockAuditNotRecordedReportProps> = ({
  discrepancyItems,
  auditId,
}) => {
  const { t } = useTranslation("stock-audit");
  const notRecordedItems = generateNotRecordedReport(discrepancyItems);

  // Export data for not recorded items
  const exportData = notRecordedItems.map((item) => ({
    epc: item.epc,
  }));

  const exportColumns = [
    { key: "epc", label: t("table.header.epc", "EPC") },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-heading">
          {t("detail.notRegisteredReport", "Not Registered Items")}
        </h2>
        {notRecordedItems.length > 0 && (
          <TableExportButton
            columns={exportColumns}
            data={exportData}
            filename={`stock_audit_not_registered_${auditId.slice(0, 8)}_${new Date().toISOString().split("T")[0]}`}
          />
        )}
      </div>

      {notRecordedItems.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <DiscrepancyStatusBadge
                className="mb-4"
                status="NOT_RECORDED"
              />
              <p className="text-muted-foreground">
                {t("detail.noNotRegisteredItems", "No not-registered items found")}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="w-full lg:w-1/2">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px] text-center">
                    {t("table.header.epc", "EPC")}
                  </TableHead>
                  <TableHead className="w-[150px] text-center">
                    {t("detail.match", "Match")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notRecordedItems.map((item) => {
                  const normalizedStatus = normalizeDiscrepancyStatus(
                    item.discrepancy_status
                  );
                  const statusLabelKey =
                    normalizedStatus === "MATCHED"
                      ? "matched"
                      : normalizedStatus.toLowerCase();

                  return (
                    <TableRow
                      key={`${item.discrepancy_id}-${item.discrepancy_status}-${item.item_id}`}
                    >
                      <TableCell className="text-center font-mono text-sm">
                        {item.epc}
                      </TableCell>
                      <TableCell className="text-center">
                        <DiscrepancyStatusBadge
                          customText={t(`status.${statusLabelKey}`)}
                          status={normalizedStatus}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StockAuditNotRecordedReport;
