export interface GateOrganization {
  id: string;
  name: string;
}

export interface GateStore {
  id: string;
  name: string;
}

export interface GateSection {
  id: string;
  name: string;
}

export interface GateItem {
  id: string;
  name: string;
  organization: GateOrganization;
  store: GateStore;
  section: GateSection | null;
}

export interface GateListResponse {
  gate: GateItem[];
}

export interface GateListFilter {
  store_id?: string;
  section_id?: string;
  limit?: number;
  cursor?: string;
}

export interface CreateGatePayload {
  name: string;
  store_id: string;
  section_id?: string;
}

export interface UpdateGatePayload {
  name: string;
  store_id: string;
  section_id?: string | null;
}

export interface GateMutationResponse {
  id: string;
}
