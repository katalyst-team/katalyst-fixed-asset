export interface LowStockAlert {
  alert_id: string;
  sku_id: string;
  sku_name: string;
  sku_code: string;
  product_name: string;
  product_image: string;
  category_id: string;
  category_name: string;
  store_id: string;
  store_name: string;
  current_quantity: number;
  min_stock: number;
  max_stock: number;
  stock_deficit: number;
  severity: "critical" | "warning";
  last_restocked_date: string;
  days_since_restock: number;
  estimated_days_until_stockout: number | null;
  recommended_reorder_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface LowStockAlertsData {
  total_alerts: number;
  critical_alerts: number;
  warning_alerts: number;
  alerts: LowStockAlert[];
}

export interface LowStockAlertsParams {
  organization_id: string;
  store_id?: string;
  category_id?: string;
  severity?: "critical" | "warning" | "all";
  limit?: number;
}
