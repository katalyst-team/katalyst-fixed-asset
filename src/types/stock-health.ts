export interface StockHealthBreakdown {
  count: number;
  percentage: number;
}

export interface StockHealthData {
  total_items: number;
  healthy_items: number;
  low_stock_items: number;
  overstocked_items: number;
  expiring_soon_items: number;
  expired_items: number;
  health_percentage: number;
  breakdown: {
    healthy: StockHealthBreakdown;
    low_stock: StockHealthBreakdown;
    overstocked: StockHealthBreakdown;
    expiring_soon: StockHealthBreakdown;
    expired: StockHealthBreakdown;
  };
}

export interface StockHealthParams {
  organization_id: string;
  store_id?: string;
  start_date?: string;
  end_date?: string;
}
