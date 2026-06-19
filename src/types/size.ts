export interface SizeItemType {
  id: string;
  name: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface SizeFilterOptions {
  name?: string;
}
