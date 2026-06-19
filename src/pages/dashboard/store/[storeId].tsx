import type { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import StoreArea from "@/modules/dashboard/store/StoreArea";
import { createPageSEO } from "@/utils/seo";

export default function StoreDetail() {
  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "Stores", path: "/dashboard/store" },
    ],
    description:
      "Review store layouts, zones, and configuration data to keep every location aligned with central inventory policies.",
    path: "/dashboard/store/[storeId]",
    title: "Store Detail",
  });

  return (
    <>
      <SEO {...seo} noindex />
      <DashboardLayout>
        <StoreArea />
      </DashboardLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { locale } = context;

  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", ["common", "store"])),
    },
  };
};
