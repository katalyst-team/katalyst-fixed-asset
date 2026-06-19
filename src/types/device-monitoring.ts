export type DeviceType = 'GATE' | 'FIXED_READER';
export type DeviceStatus = 'ONLINE' | 'OFFLINE';
export type AlertSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export interface DeviceMonitoringSectionInfo {
  id: string;
  name: string;
}

export interface DeviceMonitoringGateInfo {
  id: string;
  name: string;
  section: DeviceMonitoringSectionInfo | null;
  store_id: string;
}

export interface DeviceMonitoring {
  id: string;
  organization_id: string;
  device_type: DeviceType;
  device_id: string;
  device_name: string;
  description: string | null;
  location: string | null;
  is_active: boolean;
  ip_address: string;
  status: DeviceStatus;
  last_seen_at: string | null;
  last_rssi: number | null;
  avg_rssi: number;
  scan_count: number;
  error_count: number;
  alert_threshold: number;
  metadata: Record<string, unknown> | null;
  connection_count: number;
  is_online: boolean;
  should_alert: boolean;
  gate: DeviceMonitoringGateInfo | null;
  created_at: string;
  updated_at: string;
}

export interface DeviceMonitoringListResponse {
  data: {
    items: DeviceMonitoring[];
  };
  metadata: {
    success: boolean;
    code: string;
    message: string;
    server_time: number;
    correlation_id: string;
  };
  pagination: {
    count: number;
    next_cursor: string | null;
    prev_cursor: string | null;
    total_count: number;
  };
}

export interface DeviceMonitoringDetailResponse {
  data: DeviceMonitoring;
  metadata: {
    success: boolean;
    code: string;
    message: string;
    server_time: number;
    correlation_id: string;
  };
}

export interface DeviceMonitoringStats {
  total_devices: number;
  online_devices: number;
  offline_devices: number;
  gate_devices: number;
  fixed_reader_devices: number;
  active_alerts: number;
  total_scans_today: number;
  total_errors_today: number;
}

export interface DeviceMonitoringStatsResponse {
  data: DeviceMonitoringStats;
  metadata: {
    success: boolean;
    code: string;
    message: string;
    server_time: number;
    correlation_id: string;
  };
}

export interface DeviceAlert {
  id: string;
  organization_id: string;
  device_monitoring_id: number;
  alert_severity: AlertSeverity;
  alert_type: string;
  message: string;
  metadata: Record<string, unknown> | null;
  is_resolved: boolean;
  resolved_at: string | null;
  created_at: string;
}

export interface DeviceAlertListResponse {
  data: {
    items: DeviceAlert[];
  };
  metadata: {
    success: boolean;
    code: string;
    message: string;
    server_time: number;
    correlation_id: string;
  };
  pagination: {
    count: number;
    next_cursor: string | null;
    prev_cursor: string | null;
  };
}

export interface DeviceMetric {
  id: string;
  organization_id: string;
  device_monitoring_id: number;
  timestamp: string;
  rssi: number | null;
  scan_count: number;
  error_count: number;
  latency_ms: number | null;
}

export interface DeviceMetricListResponse {
  data: {
    items: DeviceMetric[];
  };
  metadata: {
    success: boolean;
    code: string;
    message: string;
    server_time: number;
    correlation_id: string;
  };
  pagination: {
    count: number;
    next_cursor: string | null;
    prev_cursor: string | null;
  };
}

export interface DeviceMonitoringFilters {
  device_type?: DeviceType;
  status?: DeviceStatus;
  search?: string;
  limit?: number;
  cursor?: string;
}

export interface DeviceAlertFilters {
  device_monitoring_id?: string;
  severity?: AlertSeverity;
  is_resolved?: boolean;
  limit?: number;
  cursor?: string;
}

export interface DeviceMetricFilters {
  device_monitoring_id: string;
  from_timestamp?: string;
  to_timestamp?: string;
  limit?: number;
  cursor?: string;
}

export interface UpdateDeviceMonitoringPayload {
  alert_threshold?: number;
  description?: string;
  device_name?: string;
  is_active?: boolean;
  location?: string;
}

export interface CreateDeviceMonitoringPayload {
  alert_threshold?: number;
  description?: string;
  device_id: string;
  device_name: string;
  device_type: DeviceType;
  location?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateDeviceMonitoringResponse {
  data: { id: string };
  metadata: {
    code: string;
    correlation_id: string;
    message: string;
    server_time: number;
    success: boolean;
  };
}

export interface DeleteDeviceMonitoringResponse {
  metadata: {
    code: string;
    correlation_id: string;
    message: string;
    server_time: number;
    success: boolean;
  };
}
