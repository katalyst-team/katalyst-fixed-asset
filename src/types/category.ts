import { AttributeCollectionItemDetails } from "@/modules/dashboard/sku/components/AttributeCollectionSelector";
import { AttributeItemType } from "@/types/attribute";

export interface CategoryStoreType {
  id: string;
  name: string;
}

/** Shape of one entry in `attribute_defaults` (request body) */
export interface AttributeDefaultRequest {
  attribute_id: string;
  values: string[];
}

/** Shape of one entry in `attribute_defaults` (GET response) */
export interface AttributeDefaultResponse {
  attribute: {
    attribute: AttributeItemType;
    is_required: boolean;
  };
  values: string[];
  reference_items?: Array<{ id: string; name: string; code?: string }>;
}

export interface CategoryUserType {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface CategoryItemType {
  attribute_defaults?: AttributeDefaultResponse[] | null;
  attribute_items: AttributeCollectionItemDetails[] | null;
  attributes: string[] | null;
  code?: string | null;
  created_by?: CategoryUserType | null;
  default_subcategory?: { code: string; id: string; name: string } | null;
  default_subcategory_id?: string | null;
  has_subcategories?: boolean;
  id: string;
  subcategories_count?: number;
  name: string;
  parent_id?: string | null;
  stores?: CategoryStoreType[] | null;
  subcategories?: CategoryItemType[] | null;
  updated_by?: CategoryUserType | null;
}

export interface CategoryFilterOptions {
  categoryName?: string;
  subCategory?: string;
  categoryParent?: string;
  subcategoryName?: string;
  attribute_items?: AttributeCollectionItemDetails[];
  store_id?: string;
}

export interface Category {
  label: string;
  value: string;
}
