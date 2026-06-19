import { Download } from "lucide-react";
import React from "react";

import ButtonDetail from "@/components/shared/ButtonDetail";
import EmptyState from "@/components/shared/EmptyState";
import Loading from "@/components/shared/Loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUser } from "@/context/user-context";
import { useGetStockAuditTotalDetailQuery } from "@/hooks/api/stock-audit-total";
import { formatDisplayTimestamp } from "@/utils/dateTime";
import { exportMultiSheetExcel } from "@/utils/exportUtils";
import {
  formatPercent,
  formatStockAuditTotalSource,
} from "@/utils/stockAuditTotal";

interface DetailStockAuditTotalProps {
  sessionId: string;
}

const SummaryCard: React.FC<{ label: string; value: string | number }> = ({
  label,
  value,
}) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-semibold">{value}</p>
    </CardContent>
  </Card>
);

const DetailStockAuditTotal: React.FC<DetailStockAuditTotalProps> = ({
  sessionId,
}) => {
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const { data, isLoading } = useGetStockAuditTotalDetailQuery({
    organizationId,
    sessionId,
  });

  const detail = data?.data;

  const handleExport = async () => {
    if (!detail) return;

    await exportMultiSheetExcel({
      filename: `stock_audit_total_${sessionId.slice(0, 8)}_${new Date().toISOString().split("T")[0]}`,
      sheets: [
        {
          columns: [
            { key: "field", label: "Field" },
            { key: "value", label: "Value" },
          ],
          data: [
            {
              field: "Store Name",
              value: detail.meta.store_name ?? "-",
            },
            {
              field: "Source",
              value:
                detail.meta.source_name ||
                formatStockAuditTotalSource(detail.meta.source),
            },
            {
              field: "Failure Reason",
              value: detail.meta.failure_reason ?? "-",
            },
            {
              field: "Started At",
              value: formatDisplayTimestamp(detail.meta.started_at),
            },
            {
              field: "Completed At",
              value: formatDisplayTimestamp(detail.meta.completed_at),
            },
            { field: "Total Expected", value: detail.summary.total_expected },
            { field: "Total Actual", value: detail.summary.total_actual },
            { field: "Total Missing", value: detail.summary.total_missing },
            { field: "Total Extra", value: detail.summary.total_extra },
            { field: "Total Matched", value: detail.summary.total_matched },
            { field: "Accuracy %", value: formatPercent(detail.summary.accuracy_percent) },
          ],
          sheetName: "Summary",
        },
        {
          columns: [
            { key: "sku_id", label: "SKU ID" },
            { key: "sku_code", label: "SKU Code" },
            { key: "sku_name", label: "SKU Name" },
            { key: "expected_qty", label: "Expected Qty" },
            { key: "actual_qty", label: "Actual Qty" },
            { key: "missing_qty", label: "Missing Qty" },
            { key: "extra_qty", label: "Extra Qty" },
            { key: "matched_qty", label: "Matched Qty" },
          ],
          data: detail.breakdown_by_sku,
          sheetName: "Breakdown by SKU",
        },
        {
          columns: [
            { key: "session_id", label: "Session ID" },
            { key: "sku_id", label: "SKU ID" },
            { key: "sku_code", label: "SKU Code" },
            { key: "sku_name", label: "SKU Name" },
            { key: "rfid", label: "RFID" },
            { key: "epc", label: "EPC" },
            { key: "rfid_name", label: "RFID Name" },
            { key: "section_id", label: "Section ID" },
            { key: "section_name", label: "Section Name" },
            { key: "expected_qty", label: "Expected Qty" },
            { key: "actual_qty", label: "Actual Qty" },
            { key: "missing_qty", label: "Missing Qty" },
            { key: "extra_qty", label: "Extra Qty" },
            { key: "matched_qty", label: "Matched Qty" },
          ],
          data: detail.items,
          sheetName: "Items",
        },
        {
          columns: [
            { key: "type", label: "Type" },
            { key: "rfid", label: "RFID" },
            { key: "epc", label: "EPC" },
            { key: "sku_id", label: "SKU ID" },
            { key: "sku_code", label: "SKU Code" },
            { key: "sku_name", label: "SKU Name" },
            { key: "section_id", label: "Section ID" },
            { key: "section_name", label: "Section Name" },
            { key: "expected_qty", label: "Expected Qty" },
            { key: "actual_qty", label: "Actual Qty" },
            { key: "delta_qty", label: "Delta Qty" },
            { key: "updated_at", label: "Updated At" },
          ],
          data: detail.discrepancy_items,
          sheetName: "Discrepancy Items",
        },
      ],
    });
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!detail) {
    return (
      <EmptyState
        description="Session detail is not available or no longer exists."
        title="Session Not Found"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Stock Audit Total Detail</h1>
          <p className="text-sm text-muted-foreground">
            {detail.meta.source_name ||
              formatStockAuditTotalSource(detail.meta.source)}
          </p>
        </div>
        <Button className="gap-2" size="sm" variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export Excel
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <SummaryCard label="Expected" value={detail.summary.total_expected} />
        <SummaryCard label="Actual" value={detail.summary.total_actual} />
        <SummaryCard label="Missing" value={detail.summary.total_missing} />
        <SummaryCard label="Extra" value={detail.summary.total_extra} />
        <SummaryCard label="Matched" value={detail.summary.total_matched} />
        <SummaryCard label="Accuracy" value={formatPercent(detail.summary.accuracy_percent)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Session Metadata</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm md:grid-cols-2">
          <p>
            <span className="font-medium">Store Name:</span>{" "}
            {detail.meta.store_name ?? "-"}
          </p>
          <p>
            <span className="font-medium">Source:</span>{" "}
            {detail.meta.source_name ||
              formatStockAuditTotalSource(detail.meta.source)}
          </p>
          <p>
            <span className="font-medium">Failure Reason:</span>{" "}
            {detail.meta.failure_reason ?? "-"}
          </p>
          <p><span className="font-medium">Started At:</span> {formatDisplayTimestamp(detail.meta.started_at)}</p>
          <p><span className="font-medium">Completed At:</span> {formatDisplayTimestamp(detail.meta.completed_at)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Breakdown by SKU</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU Code</TableHead>
                <TableHead>SKU Name</TableHead>
                <TableHead className="text-right">Expected</TableHead>
                <TableHead className="text-right">Actual</TableHead>
                <TableHead className="text-right">Missing</TableHead>
                <TableHead className="text-right">Extra</TableHead>
                <TableHead className="text-right">Matched</TableHead>
                <TableHead className="text-center">Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detail.breakdown_by_sku.map((item) => (
                <TableRow key={item.sku_id}>
                  <TableCell>{item.sku_code}</TableCell>
                  <TableCell>{item.sku_name}</TableCell>
                  <TableCell className="text-right">{item.expected_qty}</TableCell>
                  <TableCell className="text-right">{item.actual_qty}</TableCell>
                  <TableCell className="text-right">{item.missing_qty}</TableCell>
                  <TableCell className="text-right">{item.extra_qty}</TableCell>
                  <TableCell className="text-right">{item.matched_qty}</TableCell>
                  <TableCell className="text-center">
                    <ButtonDetail href={`/dashboard/sku/${item.sku_id}`} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU Code</TableHead>
                <TableHead>SKU Name</TableHead>
                <TableHead>RFID</TableHead>
                <TableHead>EPC</TableHead>
                <TableHead>RFID Name</TableHead>
                <TableHead>Section</TableHead>
                <TableHead className="text-right">Expected</TableHead>
                <TableHead className="text-right">Actual</TableHead>
                <TableHead className="text-right">Missing</TableHead>
                <TableHead className="text-right">Extra</TableHead>
                <TableHead className="text-right">Matched</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detail.items.map((item) => (
                <TableRow key={`${item.sku_id}-${item.rfid}`}>
                  <TableCell>{item.sku_code}</TableCell>
                  <TableCell>{item.sku_name}</TableCell>
                  <TableCell>{item.rfid}</TableCell>
                  <TableCell>{item.epc}</TableCell>
                  <TableCell>{item.rfid_name ?? "-"}</TableCell>
                  <TableCell>{item.section_name ?? "-"}</TableCell>
                  <TableCell className="text-right">{item.expected_qty}</TableCell>
                  <TableCell className="text-right">{item.actual_qty}</TableCell>
                  <TableCell className="text-right">{item.missing_qty}</TableCell>
                  <TableCell className="text-right">{item.extra_qty}</TableCell>
                  <TableCell className="text-right">{item.matched_qty}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Discrepancy Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>RFID</TableHead>
                <TableHead>EPC</TableHead>
                <TableHead>SKU Code</TableHead>
                <TableHead>SKU Name</TableHead>
                <TableHead>Section</TableHead>
                <TableHead className="text-right">Expected</TableHead>
                <TableHead className="text-right">Actual</TableHead>
                <TableHead className="text-right">Delta</TableHead>
                <TableHead>Updated At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detail.discrepancy_items.map((item, index) => (
                <TableRow key={`${item.rfid}-${index}`}>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>{item.rfid}</TableCell>
                  <TableCell>{item.epc}</TableCell>
                  <TableCell>{item.sku_code}</TableCell>
                  <TableCell>{item.sku_name}</TableCell>
                  <TableCell>{item.section_name ?? "-"}</TableCell>
                  <TableCell className="text-right">{item.expected_qty}</TableCell>
                  <TableCell className="text-right">{item.actual_qty}</TableCell>
                  <TableCell className="text-right">{item.delta_qty}</TableCell>
                  <TableCell>{formatDisplayTimestamp(item.updated_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DetailStockAuditTotal;
