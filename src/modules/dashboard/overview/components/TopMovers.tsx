import { ArrowDown, ArrowUp, Minus, TrendingUp } from "lucide-react";
import { useTranslation } from "next-i18next";
import * as React from "react";

import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/context/user-context";
import useGetTopMoversQuery from "@/hooks/api/dashboard/useTopMoversQuery";

type Period = "day" | "week" | "month";
type SortBy = "quantity" | "revenue" | "percentage_change";

const PERIOD_OPTIONS = [
  { label: "overview.topMovers.period.day", value: "day" as const },
  { label: "overview.topMovers.period.week", value: "week" as const },
  { label: "overview.topMovers.period.month", value: "month" as const },
];

const SORT_OPTIONS = [
  { label: "overview.topMovers.sort.quantity", value: "quantity" as const },
  { label: "overview.topMovers.sort.revenue", value: "revenue" as const },
  { label: "overview.topMovers.sort.percentageChange", value: "percentage_change" as const },
];

export function TopMovers() {
  const { t } = useTranslation("overview");
  const { tokenPayload, selectedTeam } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const storeId = selectedTeam === "0" ? undefined : selectedTeam;
  const [period, setPeriod] = React.useState<Period>("week");
  const [sortBy, setSortBy] = React.useState<SortBy>("quantity");

  const { data: topMoversData, isLoading } = useGetTopMoversQuery({
    limit: 5,
    organization_id: organizationId,
    period,
    sort_by: sortBy,
    sort_order: "desc",
    store_id: storeId,
  });

  const topMovers = React.useMemo(
    () => topMoversData?.data?.data?.top_movers ?? [],
    [topMoversData?.data?.data?.top_movers],
  );

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return ArrowUp;
      case "down":
        return ArrowDown;
      default:
        return Minus;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "hsl(var(--success))";
      case "down":
        return "hsl(var(--danger))";
      default:
        return "hsl(var(--text-2))";
    }
  };

  const getMovementTypeBadge = (type: string) => {
    switch (type) {
      case "inbound":
        return {
          bg: "hsl(var(--success-soft))",
          color: "hsl(var(--success))",
          label: "overview.topMovers.movement.inbound",
        };
      case "outbound":
        return {
          bg: "hsl(var(--warn-soft))",
          color: "hsl(var(--warn))",
          label: "overview.topMovers.movement.outbound",
        };
      default:
        return {
          bg: "hsl(var(--info-soft))",
          color: "hsl(var(--info))",
          label: "overview.topMovers.movement.net",
        };
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      currency: "IDR",
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
      style: "currency",
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("id-ID").format(value);
  };

  return (
    <Card className="ks-card">
      <div className="ks-card-head">
        <div className="ks-card-title">
          <div style={{ alignItems: "center", display: "flex", gap: "8px" }}>
            <TrendingUp size={18} />
            {t("topMovers.title", "Top Movers")}
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Select value={period} onValueChange={(value: Period) => setPeriod(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {t(option.label, option.value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {t(option.label, option.value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="ks-card-body">
        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ display: "flex", gap: "var(--space-3)" }}>
                <Skeleton className="h-12 w-12 rounded-md" />
                <div style={{ flex: 1, gap: "var(--space-1)" }}>
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <div style={{ textAlign: "right" }}>
                  <Skeleton className="h-4 w-20 mb-1 ml-auto" />
                  <Skeleton className="h-3 w-16 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : topMovers.length === 0 ? (
          <div
            style={{
              color: "hsl(var(--text-3))",
              fontSize: "13px",
              padding: "30px 0",
              textAlign: "center",
            }}
          >
            {t("topMovers.empty", "No top movers data available")}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {topMovers.map((item, index) => {
              const TrendIcon = getTrendIcon(item.trend);
              const trendColor = getTrendColor(item.trend);
              const movementBadge = getMovementTypeBadge(item.movement_type);
              const changeValue =
                sortBy === "revenue" ? item.revenue_change : item.quantity_change;
              const changePercentage =
                sortBy === "revenue"
                  ? item.revenue_change_percentage
                  : item.quantity_change_percentage;

              return (
                <div
                  key={item.sku_id}
                  style={{
                    alignItems: "center",
                    background: "hsl(var(--surface-2))",
                    border: "1px solid hsl(var(--border-subtle))",
                    borderRadius: "8px",
                    display: "flex",
                    gap: "var(--space-3)",
                    padding: "12px",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      alignItems: "center",
                      background: "hsl(var(--surface-3))",
                      borderRadius: "8px",
                      color: "hsl(var(--text-2))",
                      display: "flex",
                      fontSize: "14px",
                      fontWeight: 700,
                      height: "48px",
                      justifyContent: "center",
                      minWidth: "48px",
                      width: "48px",
                    }}
                  >
                    #{index + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        alignItems: "center",
                        display: "flex",
                        gap: "8px",
                        marginBottom: "4px",
                      }}
                    >
                      <span
                        style={{
                          color: "hsl(var(--text))",
                          fontSize: "14px",
                          fontWeight: 600,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.product_name}
                      </span>
                      <span
                        style={{
                          background: movementBadge.bg,
                          borderRadius: "4px",
                          color: movementBadge.color,
                          fontSize: "11px",
                          fontWeight: 600,
                          padding: "2px 6px",
                          textTransform: "uppercase",
                        }}
                      >
                        {t(movementBadge.label, item.movement_type)}
                      </span>
                    </div>
                    <div
                      style={{
                        color: "hsl(var(--text-2))",
                        fontSize: "12px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.sku_code} • {item.category_name}
                    </div>
                  </div>
                  <div style={{ minWidth: 0, textAlign: "right" }}>
                    <div
                      style={{
                        alignItems: "center",
                        color: trendColor,
                        display: "flex",
                        fontSize: "14px",
                        fontWeight: 600,
                        gap: "4px",
                        justifyContent: "flex-end",
                        marginBottom: "2px",
                      }}
                    >
                      <TrendIcon size={14} />
                      {changePercentage >= 0 ? "+" : ""}
                      {changePercentage.toFixed(1)}%
                    </div>
                    <div
                      style={{
                        color: "hsl(var(--text-2))",
                        fontSize: "12px",
                      }}
                    >
                      {sortBy === "revenue"
                        ? formatCurrency(changeValue)
                        : `${changeValue >= 0 ? "+" : ""}${formatNumber(changeValue)}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
