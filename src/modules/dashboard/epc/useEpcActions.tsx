"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { useUser } from "@/context/user-context";
import useCreateRfidDataMutation from "@/hooks/api/rfid/useCreateRfidDataMutation";
import useDeleteRfidDataMutation from "@/hooks/api/rfid/useDeleteRfidDataMutation";
import useUpdateRfidDataMutation from "@/hooks/api/rfid/useUpdateRfidDataMutation";
import {
  CreateRfidPayload,
  DeleteRfidPayload,
  UpdateRfidPayload,
} from "@/types/rfid";

interface UseEpcActionsReturn {
  createEpc: (payload: CreateRfidPayload) => Promise<void>;
  updateEpc: (payload: UpdateRfidPayload) => Promise<void>;
  deleteEpc: (payload: DeleteRfidPayload) => Promise<void>;
}

const EPC_QUERY_KEY = (organizationId: string) => ["rfidData", organizationId];

export const useEpcActions = (): UseEpcActionsReturn => {
  const { tokenPayload, selectedTeam } = useUser();
  const organizationId = tokenPayload?.organization_id || "";
  const queryClient = useQueryClient();

  const { mutateAsync: createEpcData } = useCreateRfidDataMutation({
    organizationId,
  });
  const { mutateAsync: updateEpcData } = useUpdateRfidDataMutation({
    organizationId,
  });
  const { mutateAsync: deleteEpcData } = useDeleteRfidDataMutation({
    organizationId,
  });

  const invalidateEpcList = useCallback(() => {
    if (!organizationId) return;
    queryClient.invalidateQueries({ queryKey: EPC_QUERY_KEY(organizationId) });
  }, [organizationId, queryClient]);

  const createEpc = useCallback(
    async (payload: CreateRfidPayload) => {
      const payloadWithStore = {
        rfids: payload.rfids.map((rfid) => ({
          ...rfid,
          store_id:
            rfid.store_id && rfid.store_id !== "0"
              ? rfid.store_id
              : selectedTeam !== "0"
                ? selectedTeam
                : undefined,
        })),
      };
      await createEpcData(payloadWithStore);
      invalidateEpcList();
    },
    [createEpcData, invalidateEpcList, selectedTeam]
  );

  const updateEpc = useCallback(
    async (payload: UpdateRfidPayload) => {
      const payloadWithStore = {
        rfids: payload.rfids.map((rfid) => ({
          ...rfid,
          store_id:
            rfid.store_id && rfid.store_id !== "0"
              ? rfid.store_id
              : selectedTeam !== "0"
                ? selectedTeam
                : undefined,
        })),
      };
      await updateEpcData(payloadWithStore);
      invalidateEpcList();
    },
    [invalidateEpcList, selectedTeam, updateEpcData]
  );

  const deleteEpc = useCallback(
    async (payload: DeleteRfidPayload) => {
      await deleteEpcData(payload);
      invalidateEpcList();
    },
    [deleteEpcData, invalidateEpcList]
  );

  return {
    createEpc,
    deleteEpc,
    updateEpc,
  };
};
