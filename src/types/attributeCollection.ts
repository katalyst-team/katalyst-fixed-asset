export interface AttributeCollectionItemType {
  id: string;
  name: string;
  description: string;
  attribute_items: AttributeCollectionItemDetailType[] | null;
}

export interface AttributeCollectionItemDetailType {
  is_required: boolean;
  attribute: {
    id: string;
    name: string;
    description: string;
    type: string;
    is_variant: boolean;
    presets: string[] | null;
  };
}

// Request interfaces
export interface CreateAttributeCollectionRequest {
  name: string;
  description?: string;
  attribute_items: {
    attribute_id: string;
    is_required: boolean;
  }[];
}

export interface UpdateAttributeCollectionRequest {
  name?: string;
  description?: string;
  attribute_items?: {
    attribute_id: string;
    is_required: boolean;
  }[];
}

// Response interfaces
export interface AttributeCollectionResponse {
  id: string;
}

// API returns the collection object directly instead of wrapped in attribute_collection
export type AttributeCollectionDetailResponse = AttributeCollectionItemType;


export interface AttributeCollectionListResponse {
  attribute_collections: AttributeCollectionItemType[] | null;
}
