export interface TransactionItemType {
  id: string;
  type: "Inbound" | "Outbound";
  item_name: string;
  sku_id: string;
  quantity: number;
  timestamp: string;
  store_id: string;
  user_id: string;
}

export interface GetRecentTransactionsParams {
  organizationId: string;
  limit?: number;
  storeId?: string;
}

export interface GetRecentTransactionsResponse {
  transactions: TransactionItemType[];
}
