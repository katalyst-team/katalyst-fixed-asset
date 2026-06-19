"use client";

import Loading from "@/components/shared/Loading";
import { useUser } from "@/context/user-context";
import useGetReferenceGroupBySlugQuery from "@/hooks/api/reference/useGetReferenceGroupBySlugQuery";
import { ReferenceItemListPage } from "@/modules/dashboard/reference";

interface TrimmingLogPageProps {
  hideSlugField?: boolean;
  slug: string;
}

const TrimmingLogPage = ({ hideSlugField = false, slug }: TrimmingLogPageProps) => {
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const { data, isLoading } = useGetReferenceGroupBySlugQuery({ organizationId, slug });
  const groupId = data?.data?.id;

  if (isLoading || !groupId) return <Loading />;

  return <ReferenceItemListPage hideBack hideSlugColumn groupId={groupId} hideSlugField={hideSlugField} />;
};

export default TrimmingLogPage;