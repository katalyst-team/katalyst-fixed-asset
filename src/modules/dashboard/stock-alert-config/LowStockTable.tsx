"use client";

import { AlertTriangle, ShoppingCart } from "lucide-react";
import { useTranslation } from "next-i18next";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useStockAlertConfig } from "./useStockAlertConfig";

export function LowStockTable() {
  const { t } = useTranslation("stock-alert-config");
  const { lowStockQuery, filters, updateFilter } = useStockAlertConfig();
  const isLoading = lowStockQuery.isLoading;
  const alerts = lowStockQuery.data?.data?.data?.alerts ?? [];
  const summary = {
    critical: lowStockQuery.data?.data?.data?.critical_alerts ?? 0,
    total: lowStockQuery.data?.data?.data?.total_alerts ?? 0,
    warning: lowStockQuery.data?.data?.data?.warning_alerts ?? 0,
  };

  const formatNumber = (v: number) => new Intl.NumberFormat("id-ID").format(v);

  const daysSince = (date: string) => {
    try {
      const diff = Math.abs(Date.now() - new Date(date).getTime());
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  };

  return (
    <Card className="ks-card" style={{ gridColumn: "span 2" }}>
      <div className="ks-card-head">
        <div className="ks-card-title">
          <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
            <AlertTriangle size={18} />
            {t("lowStockWatchlist.title")}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Select
            value={filters.severity ?? "all"}
            onValueChange={(v) => updateFilter("severity", v as "critical" | "warning" | "all")}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("lowStockWatchlist.severity.all")}</SelectItem>
              <SelectItem value="critical">{t("lowStockWatchlist.severity.critical")}</SelectItem>
              <SelectItem value="warning">{t("lowStockWatchlist.severity.warning")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="ks-card-body">
        <div
          style={{
            background: "hsl(var(--surface-2))",
            borderRadius: 8,
            display: "flex",
            gap: 16,
            marginBottom: 16,
            padding: 12,
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ color: "hsl(var(--text-2))", fontSize: 12, marginBottom: 4 }}>{t("lowStockWatchlist.totalAlerts")}</div>
            <div style={{ color: "hsl(var(--text))", fontSize: 20, fontWeight: 700 }}>{formatNumber(summary.total)}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "hsl(var(--text-2))", fontSize: 12, marginBottom: 4 }}>{t("lowStockWatchlist.criticalAlerts")}</div>
            <div style={{ color: "hsl(var(--danger))", fontSize: 20, fontWeight: 700 }}>{formatNumber(summary.critical)}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "hsl(var(--text-2))", fontSize: 12, marginBottom: 4 }}>{t("lowStockWatchlist.warningAlerts")}</div>
            <div style={{ color: "hsl(var(--warn))", fontSize: 20, fontWeight: 700 }}>{formatNumber(summary.warning)}</div>
          </div>
        </div>

        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div style={{ color: "hsl(var(--text-3))", fontSize: 13, padding: "30px 0", textAlign: "center" }}>
            {t("lowStockWatchlist.empty")}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead style={{ width: "25%" }}>{t("lowStockWatchlist.table.product")}</TableHead>
                  <TableHead style={{ width: "15%" }}>{t("lowStockWatchlist.table.store")}</TableHead>
                  <TableHead style={{ width: "15%" }}>{t("lowStockWatchlist.table.currentStock")}</TableHead>
                  <TableHead style={{ width: "15%" }}>{t("lowStockWatchlist.table.minMax")}</TableHead>
                  <TableHead style={{ width: "15%" }}>{t("lowStockWatchlist.table.daysSinceRestock")}</TableHead>
                  <TableHead style={{ width: "15%" }}>{t("lowStockWatchlist.table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => {
                  const badgeBg = alert.severity === "critical" ? "hsl(var(--danger-soft))" : "hsl(var(--warn-soft))";
                  const badgeColor = alert.severity === "critical" ? "hsl(var(--danger))" : "hsl(var(--warn))";
                  const badgeLabel =
                    alert.severity === "critical"
                      ? t("lowStockWatchlist.severity.critical")
                      : t("lowStockWatchlist.severity.warning");
                  const days = daysSince(alert.last_restocked_date);

                  return (
                    <TableRow key={alert.alert_id}>
                      <TableCell>
                        <div style={{ marginBottom: 4 }}>
                          <span style={{ color: "hsl(var(--text))", fontWeight: 600 }}>{alert.product_name}</span>
                        </div>
                        <div style={{ alignItems: "center", display: "flex", gap: 6 }}>
                          <span style={{ background: badgeBg, borderRadius: 4, color: badgeColor, fontSize: 10, fontWeight: 700, padding: "2px 6px", textTransform: "uppercase" }}>
                            {badgeLabel}
                          </span>
                          <span style={{ color: "hsl(var(--text-2))", fontSize: 12 }}>{alert.sku_code}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div style={{ color: "hsl(var(--text-2))", fontSize: 13 }}>{alert.store_name}</div>
                      </TableCell>
                      <TableCell>
                        <div style={{ color: "hsl(var(--text))", fontSize: 14, fontWeight: 600 }}>{formatNumber(alert.current_quantity)}</div>
                        <div style={{ color: "hsl(var(--danger))", fontSize: 12 }}>
                          {t("lowStockWatchlist.deficit", { count: alert.stock_deficit })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div style={{ color: "hsl(var(--text-2))", fontSize: 13 }}>
                          {t("lowStockWatchlist.minMaxValue", { max: alert.max_stock, min: alert.min_stock })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div style={{ color: "hsl(var(--text))", fontSize: 14, fontWeight: 600 }}>
                          {formatNumber(days)} {t("lowStockWatchlist.days")}
                        </div>
                        {alert.estimated_days_until_stockout != null && (
                          <div
                            style={{
                              color: alert.estimated_days_until_stockout <= 7 ? "hsl(var(--danger))" : "hsl(var(--warn))",
                              fontSize: 12,
                            }}
                          >
                            {t("lowStockWatchlist.estimatedStockout", { days: alert.estimated_days_until_stockout })}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" style={{ alignItems: "center", display: "flex", gap: 6 }} variant="outline">
                          <ShoppingCart size={14} />
                          {t("lowStockWatchlist.restockNow")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </Card>
  );
}
