export interface Role {
  id: string;
  name: OrganizationRoleName;
  display_name: string;
  description: string;
}

export interface RoleGetAllResponse {
  data: {
    roles: Role[] | null;
  };
}
export enum OrganizationRoleName {
  APP_SUPERADMIN = "APP_SUPERADMIN",
  APP_ADMIN = "APP_ADMIN",
  ORGANIZATION_OWNER = "ORGANIZATION_OWNER",
  ORGANIZATION_ADMIN = "ORGANIZATION_ADMIN",
  ORGANIZATION_MEMBER = "ORGANIZATION_MEMBER",
}

export enum OrganizationRoleStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
}
