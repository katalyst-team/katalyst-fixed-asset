import { useMutation, UseMutationResult } from "@tanstack/react-query";

import { executeOdooProxyService } from "@/services/odoo-module";
import {
  OdooProxyExecutePayload,
  OdooProxyExecuteResponse,
} from "@/types/odoo-module";

interface ExecuteOdooProxyVariables {
  organizationId: string;
  payload: OdooProxyExecutePayload;
}

export const useExecuteOdooProxyMutation = (): UseMutationResult<
  OdooProxyExecuteResponse,
  Error,
  ExecuteOdooProxyVariables,
  unknown
> => {
  return useMutation({
    mutationFn: ({ organizationId, payload }: ExecuteOdooProxyVariables) =>
      executeOdooProxyService({ organizationId, payload }),
    mutationKey: ["execute-odoo-proxy"],
  });
};
