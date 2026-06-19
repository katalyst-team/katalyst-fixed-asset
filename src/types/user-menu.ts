export type MenuStatus = "ACTIVE" | "INACTIVE";

// Used by GET/POST v2 detail endpoint
export interface UserMenuItemType {
  children: UserMenuItemType[];
  id: string;
  is_overridden: boolean;
  name: string;
  organization_status: MenuStatus;
  parent_id: string;
  user_status: MenuStatus;
}

export interface UserMenuAccountOrganizationType {
  email: string;
  first_name: string;
  id: string;
  last_name: string;
}

export interface GetUserMenuDataResponse {
  account_organization: UserMenuAccountOrganizationType;
  menus: UserMenuItemType[];
}

// Used by GET list endpoint (AccountOrganizationMenuStatus)
export interface UserMenuListItemMenuType {
  children: UserMenuListItemMenuType[];
  id: string;
  is_enabled: boolean;
  name: string;
  parent_id?: string;
}

export interface UserMenuListItemStore {
  id: string;
  name: string;
}

export interface UserMenuListItemType {
  email: string;
  first_name: string;
  id: string;
  last_name: string;
  menus: UserMenuListItemMenuType[];
  phone?: string;
  role_name?: string;
  stores?: UserMenuListItemStore[];
}

export interface GetAllUserMenuDataResponse {
  account_organizations: UserMenuListItemType[];
}

export interface UserMenuFilterOptions {
  cursor?: string;
  limit?: number;
  role_name?: string;
  store_id?: string;
}

export interface UpsertUserMenuParams {
  menu_statuses: {
    menu_id: string;
    status: MenuStatus;
  }[];
}

export interface UpsertUserMenuResponse {
  ids: string[];
}
