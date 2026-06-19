export interface ReferenceGroupType {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReferenceItemType {
  id: string;
  group_id: string;
  name: string;
  code: string | null;
  slug: string | null;
  sort_order: number;
  parent_item_id: string | null;
  store?: { id: string; name: string } | null;
  store_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface ReferenceGroupListResponse {
  groups: ReferenceGroupType[] | null;
}

export interface ReferenceItemListResponse {
  items: ReferenceItemType[] | null;
}

export interface CreateReferenceGroupRequest {
  description?: string;
  name: string;
  slug?: string;
}

export interface UpdateReferenceGroupRequest {
  description?: string;
  name?: string;
  slug?: string;
}

export interface CreateReferenceItemRequest {
  code?: string;
  metadata?: Record<string, unknown>;
  name: string;
  parent_item_id?: string | null;
  slug?: string;
  sort_order?: number;
}

export interface UpdateReferenceItemRequest {
  code?: string;
  metadata?: Record<string, unknown>;
  name?: string;
  parent_item_id?: string | null;
  slug?: string;
  sort_order?: number;
}

export interface ReferenceItemRelationType {
  from_item_id: string;
  id: string;
  relation_type: string;
  to_item: {
    code: string | null;
    id: string;
    name: string;
  } | null;
  to_item_id: string;
}

export interface ReferenceItemRelationListResponse {
  relations: ReferenceItemRelationType[] | null;
}

export interface CreateReferenceItemRelationRequest {
  relation_type: string;
  to_item_id: string;
}
