import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { PackingCollectionPage } from "@/modules/dashboard/packing-collection";
import { createPageSEO } from "@/utils/seo";

export default function PackingCollectionDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Bundle SKUs into collections, set quantities, and keep every packing set synchronized with inventory.",
    path: "/dashboard/packing-collection",
    title: "Packing Collection",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <PackingCollectionPage />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", ["packing-collection", "common"])),
    },
  };
};
