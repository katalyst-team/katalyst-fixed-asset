"use client";

import { useMemo } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DeviceMetric } from "@/types/device-monitoring";

interface MetricsChartProps {
  metrics: DeviceMetric[];
  isLoading: boolean;
}

export const MetricsChart = ({ metrics, isLoading }: MetricsChartProps) => {
  const chartData = useMemo(() => {
    return metrics
      .map((metric) => ({
        errors: metric.error_count,
        latency: metric.latency_ms,
        rssi: metric.rssi,
        scans: metric.scan_count,
        time: new Date(metric.timestamp).toLocaleTimeString(),
      }))
      .reverse();
  }, [metrics]);

  if (isLoading) {
    return (
      <div className="h-64 animate-pulse rounded-lg bg-gray-200" />
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        No metrics data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700">RSSI (dBm)</h3>
        <ResponsiveContainer height={200} width="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="time" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line
              connectNulls={false}
              dataKey="rssi"
              dot={false}
              stroke="#3b82f6"
              strokeWidth={2}
              type="monotone"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700">
          Latency (ms)
        </h3>
        <ResponsiveContainer height={200} width="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="time" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line
              connectNulls={false}
              dataKey="latency"
              dot={false}
              stroke="#10b981"
              strokeWidth={2}
              type="monotone"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700">Scans</h3>
        <ResponsiveContainer height={200} width="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="time" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line
              connectNulls={false}
              dataKey="scans"
              dot={false}
              stroke="#8b5cf6"
              strokeWidth={2}
              type="monotone"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700">Errors</h3>
        <ResponsiveContainer height={200} width="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="time" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line
              connectNulls={false}
              dataKey="errors"
              dot={false}
              stroke="#ef4444"
              strokeWidth={2}
              type="monotone"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};