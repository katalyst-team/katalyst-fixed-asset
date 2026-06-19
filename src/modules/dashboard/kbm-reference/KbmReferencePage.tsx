"use client";

import Loading from "@/components/shared/Loading";
import { useUser } from "@/context/user-context";
import useGetReferenceGroupBySlugQuery from "@/hooks/api/reference/useGetReferenceGroupBySlugQuery";
import { ReferenceItemListPage } from "@/modules/dashboard/reference";

interface KbmReferencePageProps {
  hideSlugField?: boolean;
  slug: string;
}

const KbmReferencePage = ({ hideSlugField = false, slug }: KbmReferencePageProps) => {
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const { data, isLoading } = useGetReferenceGroupBySlugQuery({ organizationId, slug });
  const groupId = data?.data?.id;

  if (isLoading || !groupId) return <Loading />;

  return <ReferenceItemListPage hideBack hideSlugColumn groupId={groupId} hideSlugField={hideSlugField} />;
};

export default KbmReferencePage;
