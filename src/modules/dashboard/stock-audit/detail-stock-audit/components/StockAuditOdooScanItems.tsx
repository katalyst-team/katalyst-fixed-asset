import { useTranslation } from "next-i18next";
import React from "react";

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
import { OdooScanItem } from "@/types/stock-audit";

interface StockAuditOdooScanItemsProps {
  items: OdooScanItem[];
}

const StockAuditOdooScanItems: React.FC<StockAuditOdooScanItemsProps> = ({
  items,
}) => {
  const { t } = useTranslation("stock-audit");

  const registeredCount = items.filter((i) => i.registered).length;
  const unregisteredCount = items.length - registeredCount;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">
          {t("detail.odooScanItems", "Odoo Scan Items")}
        </h2>
        <div className="flex gap-2">
          <Badge className="text-green-600 border-green-600" variant="outline">
            {t("detail.registered", "Registered")}: {registeredCount}
          </Badge>
          <Badge className="text-red-500 border-red-500" variant="outline">
            {t("detail.unregistered", "Unregistered")}: {unregisteredCount}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("detail.totalScanned", "Total Scanned")}: {items.length}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>EPC</TableHead>
                <TableHead>{t("table.header.rfidName", "RFID Name")}</TableHead>
                <TableHead>{t("table.header.sku", "SKU")}</TableHead>
                <TableHead>{t("table.header.skuCode", "SKU Code")}</TableHead>
                <TableHead>{t("table.header.section", "Section")}</TableHead>
                <TableHead>{t("detail.registered", "Registered")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.epc}>
                  <TableCell className="font-mono text-xs">
                    {item.epc}
                  </TableCell>
                  <TableCell>{item.rfid_name ?? "-"}</TableCell>
                  <TableCell>{item.sku_name ?? "-"}</TableCell>
                  <TableCell>{item.sku_code ?? "-"}</TableCell>
                  <TableCell>{item.section_name ?? "-"}</TableCell>
                  <TableCell>
                    {item.registered ? (
                      <Badge className="bg-green-600 hover:bg-green-700">
                        {t("detail.yes", "Yes")}
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        {t("detail.no", "No")}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockAuditOdooScanItems;
