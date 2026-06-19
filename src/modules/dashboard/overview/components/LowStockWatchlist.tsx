import { AlertTriangle, RefreshCw, ShoppingCart } from "lucide-react";
import { useTranslation } from "next-i18next";
import * as React from "react";

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
import { useUser } from "@/context/user-context";
import useGetLowStockAlertsQuery from "@/hooks/api/alert/useLowStockAlertsQuery";

type Severity = "critical" | "warning" | "all";

const SEVERITY_OPTIONS = [
  { label: "overview.lowStockWatchlist.severity.all", value: "all" as const },
  { label: "overview.lowStockWatchlist.severity.critical", value: "critical" as const },
  { label: "overview.lowStockWatchlist.severity.warning", value: "warning" as const },
];

export function LowStockWatchlist() {
  const { t } = useTranslation("overview");
  const { tokenPayload, selectedTeam } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const storeId = selectedTeam === "0" ? undefined : selectedTeam;
  const [severity, setSeverity] = React.useState<Severity>("all");

  const { data: lowStockAlertsData, isLoading, refetch } = useGetLowStockAlertsQuery({
    limit: 10,
    organization_id: organizationId,
    severity,
    store_id: storeId,
  });

  const lowStockAlerts = React.useMemo(
    () => lowStockAlertsData?.data?.data?.alerts ?? [],
    [lowStockAlertsData?.data?.data?.alerts],
  );

  const summary = React.useMemo(
    () => ({
      critical: lowStockAlertsData?.data?.data?.critical_alerts ?? 0,
      total: lowStockAlertsData?.data?.data?.total_alerts ?? 0,
      warning: lowStockAlertsData?.data?.data?.warning_alerts ?? 0,
    }),
    [lowStockAlertsData?.data?.data],
  );

  const getSeverityBadge = (sev: "critical" | "warning") => {
    if (sev === "critical") {
      return {
        bg: "hsl(var(--danger-soft))",
        color: "hsl(var(--danger))",
        label: "overview.lowStockWatchlist.severity.critical",
      };
    }
    return {
      bg: "hsl(var(--warn-soft))",
      color: "hsl(var(--warn))",
      label: "overview.lowStockWatchlist.severity.warning",
    };
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("id-ID").format(value);
  };

  const handleRestock = (_skuId: string, _skuName: string) => {
    void _skuId;
    void _skuName;
    // TODO: implement restock action
  };

  const daysSinceRestock = (date: string) => {
    try {
      const now = new Date();
      const restockDate = new Date(date);
      const diffTime = Math.abs(now.getTime() - restockDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return 0;
    }
  };

  return (
    <Card className="ks-card">
      <div className="ks-card-head">
        <div className="ks-card-title">
          <div style={{ alignItems: "center", display: "flex", gap: "8px" }}>
            <AlertTriangle size={18} />
            {t("lowStockWatchlist.title", "Low Stock Watchlist")}
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Select value={severity} onValueChange={(value: Severity) => setSeverity(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEVERITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {t(option.label, option.value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="icon" variant="ghost" onClick={() => refetch()}>
            <RefreshCw size={16} />
          </Button>
        </div>
      </div>
      <div className="ks-card-body">
        <div
          style={{
            background: "hsl(var(--surface-2))",
            borderRadius: "8px",
            display: "flex",
            gap: "16px",
            marginBottom: "16px",
            padding: "12px",
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ color: "hsl(var(--text-2))", fontSize: "12px", marginBottom: "4px" }}>
              {t("lowStockWatchlist.totalAlerts", "Total Alerts")}
            </div>
            <div style={{ color: "hsl(var(--text))", fontSize: "20px", fontWeight: 700 }}>
              {formatNumber(summary.total)}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "hsl(var(--text-2))", fontSize: "12px", marginBottom: "4px" }}>
              {t("lowStockWatchlist.criticalAlerts", "Critical")}
            </div>
            <div style={{ color: "hsl(var(--danger))", fontSize: "20px", fontWeight: 700 }}>
              {formatNumber(summary.critical)}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "hsl(var(--text-2))", fontSize: "12px", marginBottom: "4px" }}>
              {t("lowStockWatchlist.warningAlerts", "Warning")}
            </div>
            <div style={{ color: "hsl(var(--warn))", fontSize: "20px", fontWeight: 700 }}>
              {formatNumber(summary.warning)}
            </div>
          </div>
        </div>
        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {[...Array(5)].map((_, i) => (
              <div key={i}>
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        ) : lowStockAlerts.length === 0 ? (
          <div
            style={{
              color: "hsl(var(--text-3))",
              fontSize: "13px",
              padding: "30px 0",
              textAlign: "center",
            }}
          >
            {t("lowStockWatchlist.empty", "No low stock alerts")}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead style={{ width: "25%" }}>
                    {t("lowStockWatchlist.table.product", "Product")}
                  </TableHead>
                  <TableHead style={{ width: "15%" }}>
                    {t("lowStockWatchlist.table.store", "Store")}
                  </TableHead>
                  <TableHead style={{ width: "15%" }}>
                    {t("lowStockWatchlist.table.currentStock", "Current Stock")}
                  </TableHead>
                  <TableHead style={{ width: "15%" }}>
                    {t("lowStockWatchlist.table.minMax", "Min / Max")}
                  </TableHead>
                  <TableHead style={{ width: "15%" }}>
                    {t("lowStockWatchlist.table.daysSinceRestock", "Days Since Restock")}
                  </TableHead>
                  <TableHead style={{ width: "15%" }}>
                    {t("lowStockWatchlist.table.actions", "Actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockAlerts.map((alert) => {
                  const severityBadge = getSeverityBadge(alert.severity);
                  const daysSince = daysSinceRestock(alert.last_restocked_date);

                  return (
                    <TableRow key={alert.alert_id}>
                      <TableCell>
                        <div style={{ marginBottom: "4px" }}>
                          <span style={{ color: "hsl(var(--text))", fontWeight: 600 }}>
                            {alert.product_name}
                          </span>
                        </div>
                        <div style={{ alignItems: "center", display: "flex", gap: "6px" }}>
                          <span
                            style={{
                              background: severityBadge.bg,
                              borderRadius: "4px",
                              color: severityBadge.color,
                              fontSize: "10px",
                              fontWeight: 700,
                              padding: "2px 6px",
                              textTransform: "uppercase",
                            }}
                          >
                            {t(severityBadge.label, alert.severity)}
                          </span>
                          <span style={{ color: "hsl(var(--text-2))", fontSize: "12px" }}>
                            {alert.sku_code}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div style={{ color: "hsl(var(--text-2))", fontSize: "13px" }}>
                          {alert.store_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div style={{ color: "hsl(var(--text))", fontSize: "14px", fontWeight: 600 }}>
                          {formatNumber(alert.current_quantity)}
                        </div>
                        <div
                          style={{
                            color: "hsl(var(--danger))",
                            fontSize: "12px",
                          }}
                        >
                          {t("lowStockWatchlist.deficit", "Deficit: {{count}}", {
                            count: alert.stock_deficit,
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div style={{ color: "hsl(var(--text-2))", fontSize: "13px" }}>
                          {t("lowStockWatchlist.minMaxValue", "{{min}} / {{max}}", {
                            max: alert.max_stock,
                            min: alert.min_stock,
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div style={{ color: "hsl(var(--text))", fontSize: "14px", fontWeight: 600 }}>
                          {formatNumber(daysSince)} {t("lowStockWatchlist.days", "days")}
                        </div>
                        {alert.estimated_days_until_stockout !== null && (
                          <div
                            style={{
                              color:
                                alert.estimated_days_until_stockout <= 7
                                  ? "hsl(var(--danger))"
                                  : "hsl(var(--warn))",
                              fontSize: "12px",
                            }}
                          >
                            {t(
                              "lowStockWatchlist.estimatedStockout",
                              "~{{days}} days until stockout",
                              {
                                days: alert.estimated_days_until_stockout ?? 0,
                              },
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          style={{
                            alignItems: "center",
                            display: "flex",
                            gap: "6px",
                          }}
                          variant="outline"
                          onClick={() => handleRestock(alert.sku_id, alert.sku_name)}
                        >
                          <ShoppingCart size={14} />
                          {t("lowStockWatchlist.restockNow", "Restock Now")}
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
