import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { ReferenceItemListPage } from "@/modules/dashboard/reference";
import { createPageSEO } from "@/utils/seo";

export default function ReferenceGroupDetailDashboard() {
  const router = useRouter();
  const groupId = router.query.groupId as string;

  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "Reference", path: "/dashboard/reference" },
    ],
    description: "Manage items in this reference group.",
    path: `/dashboard/reference/${groupId}`,
    title: "Reference Items",
  });

  if (!groupId) return null;

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <ReferenceItemListPage groupId={groupId} />
      </DashboardLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? "en", [
        "common",
        "reference",
      ])),
    },
  };
};
