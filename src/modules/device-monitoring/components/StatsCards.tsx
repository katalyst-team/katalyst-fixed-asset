"use client";

import { useTranslation } from "next-i18next";

import type { DeviceMonitoringStats } from "@/types/device-monitoring";

interface StatsCardsProps {
  stats: DeviceMonitoringStats | null;
  isLoading: boolean;
}

export const StatsCards = ({ stats, isLoading }: StatsCardsProps) => {
  const { t } = useTranslation("device-monitoring");

  const statsData = [
    {
      color: "bg-blue-500",
      label: t("stats.totalDevices"),
      value: stats?.total_devices ?? 0,
    },
    {
      color: "bg-green-500",
      label: t("stats.onlineDevices"),
      value: stats?.online_devices ?? 0,
    },
    {
      color: "bg-red-500",
      label: t("stats.offlineDevices"),
      value: stats?.offline_devices ?? 0,
    },
    {
      color: "bg-purple-500",
      label: t("stats.gateDevices"),
      value: stats?.gate_devices ?? 0,
    },
    {
      color: "bg-indigo-500",
      label: t("stats.fixedReaderDevices"),
      value: stats?.fixed_reader_devices ?? 0,
    },
    {
      color: "bg-orange-500",
      label: t("stats.activeAlerts"),
      value: stats?.active_alerts ?? 0,
    },
    {
      color: "bg-pink-500",
      label: t("stats.totalErrorsToday"),
      value: stats?.total_errors_today ?? 0,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
        {statsData.map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-lg bg-gray-200"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
      {statsData.map((stat, index) => (
        <div
          key={index}
          className="flex flex-col items-center rounded-lg bg-white p-4 shadow-sm"
        >
          <div className={`mb-2 h-2 w-8 rounded-full ${stat.color}`} />
          <div className="text-2xl font-bold text-gray-900">
            {stat.value.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};