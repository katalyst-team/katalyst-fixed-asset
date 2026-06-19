"use client";

import {
  AlertTriangle,
  BarChart3,
  Bell,
  CheckCircle2,
  Clock,
  Download,
  Info,
  Package,
  RefreshCw,
  ShieldAlert,
  Wifi,
} from "lucide-react";
import { useTranslation } from "next-i18next";
import * as React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import { LowStockTable } from "./LowStockTable";
import { StockAlertConfigProvider, useStockAlertConfig } from "./useStockAlertConfig";

const CHART_COLORS: Record<string, string> = {
  expired: "hsl(0 84% 60%)",
  expiring_soon: "hsl(340 82% 52%)",
  healthy: "hsl(142 71% 45%)",
  low_stock: "hsl(28 90% 55%)",
  overstocked: "hsl(250 84% 60%)",
};

const LABEL_MAP: Record<string, string> = {
  expired: "stockAlertConfig.stockHealth.expired",
  expiring_soon: "stockAlertConfig.stockHealth.expiringSoon",
  healthy: "stockAlertConfig.stockHealth.healthy",
  low_stock: "stockAlertConfig.stockHealth.lowStock",
  overstocked: "stockAlertConfig.stockHealth.overstocked",
};

interface SummaryCardProps {
  icon: React.ElementType;
  label: string;
  loading: boolean;
  tone: "brand" | "success" | "warn" | "danger" | "info";
  value: number;
}

function SummaryCard({ icon: Icon, label, loading, tone, value }: SummaryCardProps) {
  const toneMap: Record<string, { bg: string; color: string }> = {
    brand: { bg: "hsl(var(--brand-soft))", color: "hsl(var(--brand))" },
    danger: { bg: "hsl(var(--danger-soft))", color: "hsl(var(--danger))" },
    info: { bg: "hsl(var(--info-soft))", color: "hsl(var(--info))" },
    success: { bg: "hsl(var(--success-soft))", color: "hsl(var(--success))" },
    warn: { bg: "hsl(var(--warn-soft))", color: "hsl(var(--warn))" },
  };
  const s = toneMap[tone] ?? toneMap.brand;

  return (
    <div className="ks-card" style={{ flex: 1, minWidth: 0 }}>
      <div style={{ alignItems: "center", display: "flex", gap: 12, padding: "16px 20px" }}>
        <div
          style={{
            alignItems: "center",
            background: s.bg,
            borderRadius: 10,
            color: s.color,
            display: "flex",
            height: 40,
            justifyContent: "center",
            width: 40,
          }}
        >
          <Icon size={20} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: "hsl(var(--text-2))", fontSize: 12, fontWeight: 500 }}>
            {label}
          </div>
          {loading ? (
            <Skeleton className="h-7 w-16 mt-1" />
          ) : (
            <div style={{ color: s.color, fontSize: 24, fontWeight: 700 }}>
              {value.toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StoreFilter() {
  const { filters, updateFilter, stores, hasMultipleStores } = useStockAlertConfig();
  const { t } = useTranslation("stock-alert-config");

  React.useEffect(() => {
    if (!hasMultipleStores && stores.length === 1 && !filters.store_ids) {
      updateFilter("store_ids", stores[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMultipleStores, stores.length]);

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium">{t("filters.store.label")}</label>
      <Select
        value={filters.store_ids || "all"}
        onValueChange={(v) => updateFilter("store_ids", v === "all" ? undefined : v)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder={t("filters.store.placeholder")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filters.store.allStores")}</SelectItem>
          {stores.map((store) => (
            <SelectItem key={store.id} value={store.id}>
              {store.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function StockHealthChart() {
  const { t } = useTranslation("stock-alert-config");
  const { stockHealthQuery } = useStockAlertConfig();
  const stockHealth = stockHealthQuery.data?.data?.data ?? null;
  const isLoading = stockHealthQuery.isLoading;

  const chartData = React.useMemo(() => {
    if (!stockHealth) return [];
    const { breakdown } = stockHealth;
    return [
      { color: CHART_COLORS.healthy, name: LABEL_MAP.healthy, percentage: breakdown.healthy.percentage, value: breakdown.healthy.count },
      { color: CHART_COLORS.low_stock, name: LABEL_MAP.low_stock, percentage: breakdown.low_stock.percentage, value: breakdown.low_stock.count },
      { color: CHART_COLORS.overstocked, name: LABEL_MAP.overstocked, percentage: breakdown.overstocked.percentage, value: breakdown.overstocked.count },
      { color: CHART_COLORS.expiring_soon, name: LABEL_MAP.expiring_soon, percentage: breakdown.expiring_soon.percentage, value: breakdown.expiring_soon.count },
      { color: CHART_COLORS.expired, name: LABEL_MAP.expired, percentage: breakdown.expired.percentage, value: breakdown.expired.count },
    ].filter((item) => item.value > 0);
  }, [stockHealth]);

  const healthScore = stockHealth?.health_percentage ?? 0;

  return (
    <Card className="ks-card">
      <div className="ks-card-head">
        <div className="ks-card-title">
          <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
            <ShieldAlert size={18} />
            {t("stockHealth.title")}
          </div>
        </div>
      </div>
      <div className="ks-card-body">
        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Skeleton className="h-[260px] w-full" />
          </div>
        ) : chartData.length === 0 ? (
          <div style={{ alignItems: "center", color: "hsl(var(--text-3))", display: "flex", fontSize: 13, justifyContent: "center", minHeight: 260, padding: "30px 0", textAlign: "center" }}>
            {t("stockHealth.empty")}
          </div>
        ) : (
          <>
            <div style={{ alignItems: "center", display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <div
                style={{
                  alignItems: "center",
                  background: healthScore >= 80 ? "hsl(142 71% 45% / 10%)" : healthScore >= 50 ? "hsl(28 90% 55% / 10%)" : "hsl(0 84% 60% / 10%)",
                  borderRadius: 8,
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  padding: "8px 16px",
                }}
              >
                <div style={{ color: "hsl(var(--text-2))", fontSize: 12, fontWeight: 500 }}>
                  {t("stockHealth.healthScore")}
                </div>
                <div
                  style={{
                    color: healthScore >= 80 ? "hsl(142 71% 45%)" : healthScore >= 50 ? "hsl(28 90% 55%)" : "hsl(0 84% 60%)",
                    fontSize: 24,
                    fontWeight: 700,
                  }}
                >
                  {healthScore.toFixed(0)}%
                </div>
              </div>
            </div>
            <ResponsiveContainer height={220} width="100%">
              <PieChart>
                <Pie cx="50%" cy="50%" data={chartData} dataKey="value" innerRadius={50} label={false} labelLine={false} outerRadius={90} paddingAngle={2}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload as { name: string; percentage: number; value: number };
                      return (
                        <div style={{ background: "hsl(var(--surface))", border: "1px solid hsl(var(--border))", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: 12 }}>
                          <div style={{ color: "hsl(var(--text))", fontWeight: 600, marginBottom: 4 }}>{t(d.name, d.name)}</div>
                          <div style={{ color: "hsl(var(--text-2))", fontSize: 12 }}>{d.value} items ({d.percentage.toFixed(1)}%)</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginTop: 16 }}>
              {chartData.map((item) => (
                <div key={item.name} style={{ alignItems: "center", display: "flex", gap: 6 }}>
                  <div style={{ background: item.color, borderRadius: 3, height: 12, width: 12 }} />
                  <span style={{ color: "hsl(var(--text-2))", fontSize: 12, fontWeight: 500 }}>
                    {t(item.name, item.name)} ({item.percentage.toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

function AlertList() {
  const { t } = useTranslation("stock-alert-config");
  const { criticalStockQuery, agingStockQuery, epcMismatchesQuery, pendingAuditsQuery } = useStockAlertConfig();

  const isLoading =
    criticalStockQuery.isLoading ||
    agingStockQuery.isLoading ||
    epcMismatchesQuery.isLoading ||
    pendingAuditsQuery.isLoading;

  const alerts = React.useMemo(() => {
    const result: Array<{
      body: string;
      icon: React.ElementType;
      id: string;
      title: string;
      tone: "danger" | "warn" | "info";
    }> = [];

    if ((criticalStockQuery.data?.data?.count ?? 0) > 0) {
      result.push({
        body: t("alerts.criticalBody"),
        icon: AlertTriangle,
        id: "critical-stock",
        title: `${criticalStockQuery.data?.data?.count} ${t("alerts.criticalTitle")}`,
        tone: "danger",
      });
    }
    if ((agingStockQuery.data?.data?.count ?? 0) > 0) {
      result.push({
        body: t("alerts.agingBody"),
        icon: Clock,
        id: "aging-stock",
        title: `${agingStockQuery.data?.data?.count} ${t("alerts.agingTitle")}`,
        tone: "warn",
      });
    }
    if ((epcMismatchesQuery.data?.data?.count ?? 0) > 0) {
      result.push({
        body: t("alerts.epcBody"),
        icon: Wifi,
        id: "epc-mismatches",
        title: `${epcMismatchesQuery.data?.data?.count} ${t("alerts.epcTitle")}`,
        tone: "warn",
      });
    }
    if ((pendingAuditsQuery.data?.data?.count ?? 0) > 0) {
      result.push({
        body: t("alerts.auditsBody"),
        icon: Info,
        id: "pending-audits",
        title: `${pendingAuditsQuery.data?.data?.count} ${t("alerts.auditsTitle")}`,
        tone: "info",
      });
    }
    return result;
  }, [criticalStockQuery.data, agingStockQuery.data, epcMismatchesQuery.data, pendingAuditsQuery.data, t]);

  const toneStyles: Record<string, { bg: string; border: string; color: string }> = {
    danger: { bg: "hsl(var(--danger-soft))", border: "hsl(var(--destructive) / 0.2)", color: "hsl(var(--destructive))" },
    info: { bg: "hsl(var(--info-soft))", border: "hsl(var(--info) / 0.2)", color: "hsl(var(--info))" },
    warn: { bg: "hsl(var(--warn-soft))", border: "hsl(var(--warn) / 0.2)", color: "hsl(var(--warn))" },
  };

  return (
    <Card className="ks-card">
      <div className="ks-card-head">
        <div className="ks-card-title">
          <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
            <Bell size={18} />
            {t("alerts.title")}
          </div>
        </div>
        {alerts.length > 0 && !isLoading && (
          <span className="ks-badge danger">{alerts.length}</span>
        )}
      </div>
      <div className="ks-card-body">
        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ display: "flex", gap: 8 }}>
                <Skeleton className="h-5 w-5 rounded-md" />
                <div style={{ flex: 1 }}>
                  <Skeleton className="h-4 w-3/4 mb-1" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div style={{ alignItems: "center", color: "hsl(var(--text-3))", display: "flex", fontSize: 13, justifyContent: "center", padding: "30px 0", textAlign: "center" }}>
            <CheckCircle2 size={16} style={{ marginRight: 8 }} />
            {t("alerts.empty")}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {alerts.map((alert) => {
              const s = toneStyles[alert.tone] ?? toneStyles.warn;
              const Icon = alert.icon;
              return (
                <div
                  key={alert.id}
                  style={{
                    alignItems: "flex-start",
                    background: s.bg,
                    border: `1px solid ${s.border}`,
                    borderRadius: 8,
                    display: "flex",
                    gap: 8,
                    padding: 12,
                  }}
                >
                  <Icon size={18} style={{ color: s.color, flexShrink: 0, marginTop: 2 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: s.color, fontSize: "0.875rem", fontWeight: 600 }}>{alert.title}</div>
                    <div style={{ color: s.color, fontSize: "0.75rem", marginTop: 2, opacity: 0.8 }}>{alert.body}</div>
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

function StockAlertConfigContent() {
  const { t } = useTranslation(["stock-alert-config", "common"]);
  const {
    criticalStockQuery,
    agingStockQuery,
    stockHealthQuery,
    lowStockQuery,
    isLoading,
  } = useStockAlertConfig();

  const criticalCount = criticalStockQuery.data?.data?.count ?? 0;
  const agingCount = agingStockQuery.data?.data?.count ?? 0;
  const lowStockTotal = lowStockQuery.data?.data?.data?.total_alerts ?? 0;
  const healthScore = stockHealthQuery.data?.data?.data?.health_percentage ?? 0;

  const handleRefresh = () => {
    criticalStockQuery.refetch();
    agingStockQuery.refetch();
    lowStockQuery.refetch();
    stockHealthQuery.refetch();
  };

  return (
    <div>
      <div className="ks-page-head">
        <div>
          <h1 className="ks-page-title">{t("stockAlertConfig:title")}</h1>
          <p className="ks-page-desc">{t("stockAlertConfig:description")}</p>
        </div>
        <div className="ks-page-actions">
          <StoreFilter />
          <button
            className="ks-btn ks-btn-ghost ks-btn-icon"
            title={t("stockAlertConfig:refresh")}
            type="button"
            onClick={handleRefresh}
          >
            <RefreshCw size={14} />
          </button>
          <button className="ks-btn" type="button">
            <Download size={14} />
            <span>{t("stockAlertConfig:refresh")}</span>
          </button>
        </div>
      </div>

      <div className="ks-kpi-strip" style={{ marginBottom: 16 }}>
        <SummaryCard icon={AlertTriangle} label={t("stockAlertConfig:summary.critical")} loading={isLoading} tone="danger" value={criticalCount} />
        <SummaryCard icon={Clock} label={t("stockAlertConfig:summary.warning")} loading={isLoading} tone="warn" value={agingCount} />
        <SummaryCard icon={BarChart3} label={t("stockAlertConfig:summary.lowStock")} loading={isLoading} tone="info" value={lowStockTotal} />
        <SummaryCard icon={Package} label={t("stockAlertConfig:summary.healthy")} loading={isLoading} tone="success" value={healthScore} />
      </div>

      <div className="ks-grid-2" style={{ marginBottom: 16 }}>
        <StockHealthChart />
        <AlertList />
      </div>

      <div className="ks-grid-2" style={{ marginBottom: 16 }}>
        <LowStockTable />
      </div>
    </div>
  );
}

const StockAlertConfigPage = () => {
  return (
    <StockAlertConfigProvider>
      <StockAlertConfigContent />
    </StockAlertConfigProvider>
  );
};

export default StockAlertConfigPage;
