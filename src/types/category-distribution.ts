export interface CategoryDistributionItemType {
  category_id: string;
  category_name: string;
  item_count: number;
  percentage: number;
}

export interface GetCategoryDistributionParams {
  organizationId: string;
  storeId?: string;
}

export interface GetCategoryDistributionResponse {
  distribution: CategoryDistributionItemType[];
}
