import { useQuery } from "@tanstack/react-query";

import {
  GetOrganizationFeatureFlagsResponse,
  getOrganizationFeatureFlagsService,
} from "@/services/feature-flag/getOrganizationFeatureFlagsService";

export const KEY_USE_GET_ORGANIZATION_FEATURE_FLAGS = (
  organizationId: string,
) => ["organizationFeatureFlags", organizationId];

interface UseOrganizationFeatureFlagsParams {
  enabled?: boolean;
  organizationId: string;
}

const useOrganizationFeatureFlags = ({
  enabled = true,
  organizationId,
}: UseOrganizationFeatureFlagsParams) => {
  return useQuery<GetOrganizationFeatureFlagsResponse, Error>({
    enabled: Boolean(organizationId) && enabled,
    queryFn: () => getOrganizationFeatureFlagsService({ organizationId }),
    queryKey: KEY_USE_GET_ORGANIZATION_FEATURE_FLAGS(organizationId),
    staleTime: 60_000,
  });
};

export const useIsAiChatEnabled = (organizationId: string) => {
  const query = useOrganizationFeatureFlags({ organizationId });

  const aiChatFlag = query.data?.data?.find((flag) => flag.key === "ai_chat");

  return {
    aiChatEnabled: aiChatFlag?.is_enabled ?? false,
    isLoading: organizationId ? query.isLoading : false,
  };
};

export default useOrganizationFeatureFlags;
