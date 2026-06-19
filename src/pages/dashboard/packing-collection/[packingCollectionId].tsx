import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { PackingCollectionDetailWrapper } from "@/modules/dashboard/packing-collection";
import { createPageSEO } from "@/utils/seo";

export default function PackingCollectionDetailPage({ packingCollectionId }: { packingCollectionId: string }) {
  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "Packing Collection", path: "/dashboard/packing-collection" },
    ],
    description:
      "Review container contents, instructions, and scan history for a specific packing collection.",
    path: "/dashboard/packing-collection/[packingCollectionId]",
    title: "Packing Collection Detail",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <PackingCollectionDetailWrapper packingCollectionId={packingCollectionId} />
      </DashboardLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { packingCollectionId } = context.params as { packingCollectionId: string };

  return {
    props: {
      ...(await serverSideTranslations(context.locale || "en", [
        "common",
        "packing-collection",
      ])),
      packingCollectionId,
    },
  };
};
