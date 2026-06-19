import { useMutation, UseMutationResult } from "@tanstack/react-query";

import { useUser } from "@/context/user-context";
import {
  PostLedgerProductSyncParams,
  PostLedgerProductSyncResponse,
  postLedgerProductSyncService,
} from "@/services/ledger-product/postLedgerProductSyncService";

export type UseSyncLedgerProductMutationResponse = UseMutationResult<
  PostLedgerProductSyncResponse,
  Error,
  Omit<PostLedgerProductSyncParams, "organizationId">,
  unknown
>;

const useSyncLedgerProductMutation = (): UseSyncLedgerProductMutationResponse => {
  const { tokenPayload } = useUser();

  return useMutation({
    mutationFn: (params: Omit<PostLedgerProductSyncParams, "organizationId">) =>
      postLedgerProductSyncService({
        ...params,
        organizationId: tokenPayload?.organization_id ?? "",
      }),
    mutationKey: ["sync-ledger-product"],
  });
};

export default useSyncLedgerProductMutation;
