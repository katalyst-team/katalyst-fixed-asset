"use client";

import {
  Box,
  Calendar,
  ChevronRight,
  Download,
  Package,
  RefreshCw,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslation } from "next-i18next";

import { Skeleton } from "@/components/ui/skeleton";

import { AlertStrip } from "./components/AlertStrip";
import { deltaPercent, KpiCard } from "./components/KpiCard";
import { OverviewFilters } from "./OverviewFilters";
import { OverviewProvider, useOverview } from "./useOverview";

const InventoryTrendChart = dynamic(
  () =>
    import("./InventoryTrendChart").then((mod) => ({
      default: mod.InventoryTrendChart,
    })),
  {
    loading: () => <Skeleton className="h-[260px] w-full" />,
    ssr: false,
  },
);

const StockMovementTrendChart = dynamic(
  () =>
    import("./StockMovementTrendChart").then((mod) => ({
      default: mod.StockMovementTrendChart,
    })),
  {
    loading: () => <Skeleton className="h-[260px] w-full" />,
    ssr: false,
  },
);

const OverviewContent = () => {
  const { t } = useTranslation(["overview", "common"]);
  const {
    filters,
    inventoryAccuracy,
    inventoryTrendData,
    overviewData,
    stockMovementTrendData,
    updateFilter,
  } = useOverview();

  const metrics = overviewData.data?.data?.metrics;
  const totalItems = metrics?.total_items ?? 0;
  const totalSku = metrics?.total_sku ?? 0;
  const totalInbound = metrics?.total_inbound ?? 0;
  const totalOutbound = metrics?.total_outbound ?? 0;

  const trendRecord = inventoryTrendData.data?.data?.data ?? {};
  const trendPoints = Object.values(trendRecord).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  const itemsSpark = trendPoints.map((d) => d.total).slice(-14);

  const movementRecord = stockMovementTrendData.data?.data?.data ?? {};
  const movementPoints = Object.values(movementRecord).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  const inboundSpark = movementPoints.map((d) => d.inbound).slice(-14);
  const outboundSpark = movementPoints.map((d) => d.outbound).slice(-14);
  const accuracySpark = movementPoints.length
    ? movementPoints.map(() => inventoryAccuracy)
    : [inventoryAccuracy];

  const itemsDelta = deltaPercent(itemsSpark);
  const inboundDelta = deltaPercent(inboundSpark);
  const outboundDelta = deltaPercent(outboundSpark);

  // Date range tabs
  const intervalToTab: Record<string, string> = {
    "1M": "30d",
    "3M": "90d",
    "7D": "7d",
    YTD: "YTD",
  };
  const tabToInterval: Record<string, string> = {
    "30d": "1M",
    "7d": "7D",
    "90d": "3M",
    YTD: "1M",
  };
  const activeTab = intervalToTab[filters.interval ?? "1M"] ?? "30d";
  const refreshedAgo = overviewData.dataUpdatedAt
    ? Math.max(0, Math.floor((Date.now() - overviewData.dataUpdatedAt) / 60000))
    : 0;
  const refreshedText =
    refreshedAgo === 0 ? "just now" : `${refreshedAgo} minute${refreshedAgo === 1 ? "" : "s"} ago`;

  // Compute simple stock health
  // const inStock = Math.max(0, totalItems);
  // const lowStock = Math.floor(totalSku * 0.05);
  // const critical = Math.floor(totalSku * 0.02);

  const handleRefresh = () => {
    overviewData.refetch();
    inventoryTrendData.refetch();
    stockMovementTrendData.refetch();
  };

  return (
    <div>
      {/* Page header */}
      <div className="ks-page-head">
        <div>
          <h1 className="ks-page-title">{t("overview:title", "Overview")}</h1>
          <p className="ks-page-desc">
            {t(
              "overview:description",
              "Real-time inventory health across all stores",
            )}{" "}
            · Data refreshed {refreshedText}
          </p>
        </div>
        <div className="ks-page-actions">
          <div className="ks-seg">
            {(["7d", "30d", "90d", "YTD"] as const).map((tab) => (
              <button
                key={tab}
                className={tab === activeTab ? "on" : ""}
                type="button"
                onClick={() => updateFilter("interval", tabToInterval[tab] as never)}
              >
                {tab}
              </button>
            ))}
          </div>
          <button className="ks-btn" type="button">
            <Calendar size={14} />
            <span>{t("overview:actions.customDate", "Custom date")}</span>
          </button>
          <button
            className="ks-btn ks-btn-ghost ks-btn-icon"
            title="Refresh"
            type="button"
            onClick={handleRefresh}
          >
            <RefreshCw size={14} />
          </button>
          <button className="ks-btn" type="button">
            <Download size={14} />
            <span>{t("overview:actions.export", "Export")}</span>
          </button>
        </div>
      </div>

      {/* AI insight banner */}
      <div className="ks-ai-banner hidden">
        <div className="ks-ai-banner-icon">
          <Sparkles size={16} />
        </div>
        <div style={{ flex: 1 }}>
          <div className="ks-ai-banner-title">
            {t("overview:ai.title", "Inventory snapshot")}
          </div>
          <div className="ks-ai-banner-body">
            {t(
              "overview:ai.body",
              "Track items, SKUs, and movement velocity in real time. Use the filters below to drill into specific stores or SKUs.",
            )}
          </div>
        </div>
        <button className="ks-btn ks-btn-sm" type="button">
          {t("overview:ai.viewPlan", "View plan")}
          <ChevronRight size={12} />
        </button>
      </div>

      {/* Filter bar — real Store / SKU / Interval dropdowns */}
      <div className="ks-filterbar" style={{ marginBottom: 16 }}>
        <OverviewFilters />
      </div>

      {/* KPI strip — 5 metrics with sparklines + delta */}
      <div className="ks-kpi-strip">
        <KpiCard
          data={itemsSpark}
          delta={itemsDelta?.delta}
          deltaTone={itemsDelta?.tone}
          icon={Box}
          label={t("overview:metrics.inventoryCount.title", "Total items")}
          tone="brand"
          value={totalItems.toLocaleString()}
        />
        <KpiCard
          data={itemsSpark}
          icon={Package}
          label={t("overview:metrics.totalSku.title", "Total SKU")}
          tone="brand"
          value={totalSku.toLocaleString()}
        />
        <KpiCard
          data={inboundSpark}
          delta={inboundDelta?.delta}
          deltaTone={inboundDelta?.tone}
          icon={TrendingUp}
          label={t("overview:metrics.inboundTotal.title", "Inbound")}
          tone="success"
          value={totalInbound.toLocaleString()}
        />
        <KpiCard
          data={outboundSpark}
          delta={outboundDelta?.delta}
          deltaTone={outboundDelta?.tone}
          icon={TrendingDown}
          label={t("overview:metrics.outboundTotal.title", "Outbound")}
          tone="warn"
          value={totalOutbound.toLocaleString()}
        />
        <KpiCard
          data={accuracySpark}
          icon={Target}
          label={t("overview:metrics.inventoryAccuracy.title", "Inventory accuracy")}
          tone="danger"
          value={`${inventoryAccuracy.toFixed(1)}%`}
        />
      </div>

      {/* Alert strip */}
      <AlertStrip />

      {/* Charts row */}
      <div className="ks-grid-2" style={{ marginBottom: 16 }}>
        <div className="ks-card">
          <div className="ks-card-head">
            <div>
              <div className="ks-card-title">
                {t("overview:charts.inventoryTrend.title", "Inventory trend")}
              </div>
              <div className="ks-card-desc">
                {t(
                  "overview:charts.inventoryTrend.description",
                  "Total units on hand across all stores",
                )}
              </div>
            </div>
            {itemsDelta && (
              <span className={`ks-badge ${itemsDelta.tone === "success" ? "success" : "danger"}`}>
                {itemsDelta.tone === "success" ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {itemsDelta.delta}
              </span>
            )}
          </div>
          <div className="ks-card-body">
            <InventoryTrendChart />
          </div>
        </div>
        <div className="ks-card">
          <div className="ks-card-head">
            <div>
              <div className="ks-card-title">
                {t("overview:charts.stockMovement.title", "Stock movement trend")}
              </div>
              <div className="ks-card-desc">
                {t(
                  "overview:charts.stockMovement.description",
                  "Inbound vs outbound",
                )}
              </div>
            </div>
            <div className="ks-chart-legend">
              <span className="ks-legend-item">
                <span
                  className="ks-legend-swatch"
                  style={{ background: "hsl(var(--brand))" }}
                />
                {t("overview:tooltips.inbound", "In")}
              </span>
              <span className="ks-legend-item">
                <span
                  className="ks-legend-swatch"
                  style={{ background: "hsl(var(--accent))" }}
                />
                {t("overview:tooltips.outbound", "Out")}
              </span>
            </div>
          </div>
          <div className="ks-card-body">
            <StockMovementTrendChart />
          </div>
        </div>
      </div>

      {/* Bottom row: Recent Transactions + Alerts + Category Distribution */}
      {/* <div className="ks-grid-3" style={{ marginBottom: 16 }}>
        <RecentTransactions />
        <Alerts />
        <CategoryDistribution />
      </div> */}

      {/* New Phase 3 components: Stock Health + Top Movers + Low Stock Watchlist */}
      {/* <div className="ks-grid-3" style={{ marginBottom: 16 }}>
        <StockHealth />
        <TopMovers />
        <LowStockWatchlist />
      </div> */}
    </div>
  );
};

const Overview = () => {
  return (
    <OverviewProvider>
      <OverviewContent />
    </OverviewProvider>
  );
};

export default Overview;
