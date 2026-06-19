import React from "react";

import ButtonDetail from "@/components/shared/ButtonDetail";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StockAuditTotalSession } from "@/types/stock-audit-total";
import { formatDisplayTimestamp } from "@/utils/dateTime";
import {
  formatPercent,
  formatStockAuditTotalSource,
} from "@/utils/stockAuditTotal";

interface StockAuditTotalTableProps {
  data: StockAuditTotalSession[];
}

const renderStatusBadge = (status: string) => {
  if (status === "COMPLETED") {
    return <Badge className="bg-green-600">Completed</Badge>;
  }
  if (status === "ON_PROGRESS") {
    return <Badge className="bg-yellow-500">On Progress</Badge>;
  }
  if (status === "FAILED") {
    return <Badge className="bg-red-600">Failed</Badge>;
  }
  return <Badge className="bg-gray-500">{status}</Badge>;
};

const StockAuditTotalTable: React.FC<StockAuditTotalTableProps> = ({ data }) => {
  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Session</TableHead>
            <TableHead className="text-center">Store</TableHead>
            <TableHead className="text-center">Source</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Expected</TableHead>
            <TableHead className="text-center">Actual</TableHead>
            <TableHead className="text-center">Missing</TableHead>
            <TableHead className="text-center">Extra</TableHead>
            <TableHead className="text-center">Matched</TableHead>
            <TableHead className="text-center">Accuracy</TableHead>
            <TableHead className="text-center">Started At</TableHead>
            <TableHead className="text-center">Completed At</TableHead>
            <TableHead className="text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="text-center font-medium">{item.id.slice(0, 8)}</TableCell>
              <TableCell className="text-center">
                {item.store_name ?? item.store_id}
              </TableCell>
              <TableCell className="text-center">{formatStockAuditTotalSource(item.source)}</TableCell>
              <TableCell className="text-center">{renderStatusBadge(item.status)}</TableCell>
              <TableCell className="text-center">
                <Badge className="bg-blue-600">{item.total_expected}</Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge className="bg-cyan-600">{item.total_actual}</Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge className="bg-red-600">{item.total_missing}</Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge className="bg-orange-600">{item.total_extra}</Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge className="bg-green-600">{item.total_matched}</Badge>
              </TableCell>
              <TableCell className="text-center">{formatPercent(item.accuracy_percent)}</TableCell>
              <TableCell className="text-center">{formatDisplayTimestamp(item.started_at)}</TableCell>
              <TableCell className="text-center">{formatDisplayTimestamp(item.completed_at)}</TableCell>
              <TableCell className="text-center">
                <ButtonDetail href={`/dashboard/stock-audit-total/${item.id}`} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default StockAuditTotalTable;
