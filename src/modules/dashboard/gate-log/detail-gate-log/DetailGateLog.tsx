import { format } from "date-fns";
import { useTranslation } from "next-i18next";
import React from "react";

import Loading from "@/components/shared/Loading";
import { Badge } from "@/components/ui/badge";
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
import { useGetGateLogDetailQuery } from "@/hooks/api/gate-log";

interface DetailGateLogProps {
  logId: string;
}

const DetailGateLog: React.FC<DetailGateLogProps> = ({ logId }) => {
  const { t } = useTranslation("gate-log");
  const { tokenPayload } = useUser();

  const { data, isLoading } = useGetGateLogDetailQuery({
    gateLogId: logId,
    organizationId: tokenPayload?.organization_id || "",
  });

  const log = data?.data;

  if (isLoading) {
    return <Loading />;
  }

  if (!log) {
    return (
      <div className="flex items-center justify-center h-96">
        <p>{t("detail.notFound")}</p>
      </div>
    );
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "yyyy-MM-dd HH:mm:ss");
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">{t("detail.title")}</h1>
        <p className="text-sm text-muted-foreground">
          {formatTimestamp(log.ts)}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("detail.summary")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">{t("detail.gate")}</p>
            <p className="font-medium">{log.gate?.name || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t("detail.store")}</p>
            <p className="font-medium">{log.store?.name || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              {t("detail.section")}
            </p>
            <p className="font-medium">{log.section?.name || log.items?.[0]?.section?.name || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              {t("detail.antenna")}
            </p>
            <p className="font-medium">{log.ant}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t("detail.deviceId")}</p>
            <p className="font-mono font-medium">{log.device_id || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t("detail.rssi")}</p>
            <p className="font-medium">{log.rssi} dBm</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              {t("detail.gpioTrigger")}
            </p>
            <p className="font-medium">
              {log.gpio_trigger ? t("detail.yes") : t("detail.no")}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              {t("detail.rfidStatus")}
            </p>
            <Badge
              variant={log.rfid_status === "ACTIVE" ? "default" : "secondary"}
            >
              {log.rfid_status}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              {t("detail.itemsCount")}
            </p>
            <p className="font-medium">{log.items?.length || 0}</p>
          </div>
        </CardContent>
      </Card>

      {log.items && log.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("detail.items")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      {t("itemsTable.header.no")}
                    </TableHead>
                    <TableHead>{t("itemsTable.header.epc")}</TableHead>
                    <TableHead>{t("itemsTable.header.sku")}</TableHead>
                    <TableHead>{t("itemsTable.header.internalCode")}</TableHead>
                    <TableHead>{t("itemsTable.header.skuName")}</TableHead>
                    <TableHead>{t("itemsTable.header.section")}</TableHead>
                    <TableHead>{t("itemsTable.header.status")}</TableHead>
                    <TableHead className="text-right">
                      {t("itemsTable.header.aging")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {log.items.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {item.epc}
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.sku?.sku || "-"}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {item.sku?.internal_code || "-"}
                      </TableCell>
                      <TableCell>{item.sku?.name || "-"}</TableCell>
                      <TableCell>{item.section?.name || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.status?.name}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {item.aging} {t("itemsTable.header.aging")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DetailGateLog;
