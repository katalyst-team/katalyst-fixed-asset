export interface TopMoverItem {
  sku_id: string;
  sku_name: string;
  sku_code: string;
  product_name: string;
  product_image: string;
  category_id: string;
  category_name: string;
  current_quantity: number;
  previous_quantity: number;
  quantity_change: number;
  quantity_change_percentage: number;
  current_revenue: number;
  previous_revenue: number;
  revenue_change: number;
  revenue_change_percentage: number;
  trend: "up" | "down" | "neutral";
  movement_type: "inbound" | "outbound" | "net";
}

export interface TopMoversData {
  period: string;
  top_movers: TopMoverItem[];
}

export interface TopMoversParams {
  organization_id: string;
  store_id?: string;
  period?: "day" | "week" | "month";
  limit?: number;
  category_id?: string;
  sort_by?: "quantity" | "revenue" | "percentage_change";
  sort_order?: "asc" | "desc";
}
