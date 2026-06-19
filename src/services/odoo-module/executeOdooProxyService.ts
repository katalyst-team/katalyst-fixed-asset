import fetcher from "@/services";
import {
  OdooHttpMethod,
  OdooProxyAction,
  OdooProxyExecutePayload,
  OdooProxyExecuteResponse,
} from "@/types/odoo-module";

interface ExecuteOdooProxyServiceParams {
  organizationId: string;
  payload: OdooProxyExecutePayload;
}

const actionConfig: Record<OdooProxyAction, { method: OdooHttpMethod; path: string }> = {
  assign_packs: { method: "POST", path: "/odoo/packs/assign" },
  deactivate_packs: { method: "POST", path: "/odoo/packs/deactivate" },
  get_location_detail: { method: "GET", path: "/odoo/locations/:id" },
  get_product_detail: { method: "GET", path: "/odoo/products/:id" },
  list_locations: { method: "GET", path: "/odoo/locations" },
  list_products: { method: "GET", path: "/odoo/products" },
  list_rfids: { method: "GET", path: "/odoo/rfids" },
  list_transfers: { method: "GET", path: "/odoo/transfers" },
  register_rfid: { method: "POST", path: "/odoo/rfids" },
  review_unpack: { method: "POST", path: "/odoo/packs/review-unpack" },
  stock_audit: { method: "POST", path: "/odoo/stock/audit" },
  stock_opname: { method: "POST", path: "/odoo/stock/opname" },
};

export const executeOdooProxyService = ({
  organizationId,
  payload,
}: ExecuteOdooProxyServiceParams): Promise<OdooProxyExecuteResponse> => {
  const config = actionConfig[payload.action];

  let endpointPath = config.path;
  if (endpointPath.includes(":id")) {
    endpointPath = endpointPath.replace(":id", payload.resourceId || "");
  }

  const queryParams = new URLSearchParams();
  Object.entries(payload.params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      queryParams.append(key, String(value));
    }
  });

  const query = queryParams.toString();

  return fetcher({
    data: config.method === "POST" ? payload.body : undefined,
    method: config.method,
    url: `/v1/organizations/${organizationId}${endpointPath}${query ? `?${query}` : ""}`,
  });
};
