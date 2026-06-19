import { format } from "date-fns";
import { Eye } from "lucide-react";
import { useTranslation } from "next-i18next";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { GateLog } from "@/types/gate-log";

interface GateLogTableProps {
  data: GateLog[];
  onViewDetail: (logId: string) => void;
}

const GateLogTable: React.FC<GateLogTableProps> = ({ data, onViewDetail }) => {
  const { t } = useTranslation("gate-log");

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "yyyy-MM-dd HH:mm:ss");
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">{t("table.header.no")}</TableHead>
            <TableHead>{t("table.header.timestamp")}</TableHead>
            <TableHead>{t("table.header.gate")}</TableHead>
            <TableHead>{t("table.header.store")}</TableHead>
            <TableHead>{t("table.header.section")}</TableHead>
            <TableHead>{t("table.header.epc")}</TableHead>
            <TableHead>{t("table.header.internalCode")}</TableHead>
            <TableHead className="text-right">{t("table.header.rssi")}</TableHead>
            <TableHead className="text-center">{t("table.header.antenna")}</TableHead>
            <TableHead>{t("table.header.deviceId")}</TableHead>
            <TableHead className="text-center">{t("table.header.gpioTrigger")}</TableHead>
            <TableHead className="text-center">{t("table.header.itemCount")}</TableHead>
            <TableHead className="w-24">{t("table.header.action")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((log, index) => (
            <TableRow key={log.id}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell className="text-sm">
                {formatTimestamp(log.ts)}
              </TableCell>
              <TableCell>{log.gate?.name || "-"}</TableCell>
              <TableCell>{log.store?.name || "-"}</TableCell>
              <TableCell>{log.section?.name || log.items?.[0]?.section?.name || "-"}</TableCell>
              <TableCell className="font-mono text-xs">
                {log.rfid?.epc || log.items?.[0]?.epc || "-"}
              </TableCell>
              <TableCell className="font-mono text-xs">
                {log.rfid?.internal_code || log.items?.[0]?.sku?.internal_code || "-"}
              </TableCell>
              <TableCell className="text-right">{log.rssi}</TableCell>
              <TableCell className="text-center">{log.ant}</TableCell>
              <TableCell className="font-mono text-xs">{log.device_id || "-"}</TableCell>
              <TableCell className="text-center">
                <Badge variant={log.gpio_trigger ? "default" : "secondary"}>
                  {log.gpio_trigger ? t("detail.yes") : t("detail.no")}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="secondary">{log.items?.length || 0}</Badge>
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onViewDetail(log.id)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default GateLogTable;
