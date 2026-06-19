// Packing Collection Types

export interface PackingItem {
  quantity: number;
  sku_id: {
    id: string;
    name: string;
    status: "ACTIVE" | "INACTIVE";
  };
}

export interface PackingCollectionItemType {
  id: string;
  name: string;
  description: string;
  store_id?: string;
  packing_items: PackingItem[] | null;
}

export interface PackingCollectionFilterOptions {
  query?: string;
  cursor?: string;
  limit?: number;
  store_id?: string;
}

// Create payload
export interface CreatePackingCollectionPayload {
  name: string;
  description: string;
  store_id?: string;
  packing_items: {
    quantity: number;
    sku_id: string;
  }[];
}

// Update payload  
export interface UpdatePackingCollectionPayload {
  name?: string;
  description?: string;
  packing_items?: {
    quantity: number;
    sku_id: string;
  }[];
}

// Response types
export interface PackingCollectionListResponse {
  data: {
    packing_collections: PackingCollectionItemType[] | null;
  };
  metadata: {
    code: string;
    correlation_id: string;
    message: string;
    server_time: number;
    success: boolean;
  };
  pagination: {
    count: number;
    next_cursor: string | null;
    prev_cursor: string | null;
  };
}

export interface PackingCollectionDetailResponse {
  data: PackingCollectionItemType;
  metadata: {
    code: string;
    correlation_id: string;
    message: string;
    server_time: number;
    success: boolean;
  };
  pagination: {
    count: number;
    next_cursor: string | null;
    prev_cursor: string | null;
  };
}

export interface PackingCollectionCreateResponse {
  data: {
    id: string;
  };
  metadata: {
    code: string;
    correlation_id: string;
    message: string;
    server_time: number;
    success: boolean;
  };
  pagination: {
    count: number;
    next_cursor: string | null;
    prev_cursor: string | null;
  };
}

export interface PackingCollectionDeleteResponse {
  data: {
    id: string;
  };
  metadata: {
    code: string;
    correlation_id: string;
    message: string;
    server_time: number;
    success: boolean;
  };
  pagination: {
    count: number;
    next_cursor: string | null;
    prev_cursor: string | null;
  };
}

// For form state management
export interface PackingCollectionFormData {
  name: string;
  description: string;
  packing_items: {
    id?: string; // temporary ID for form management
    quantity: number;
    sku_id: string;
    sku_name?: string; // for display purposes
  }[];
}
