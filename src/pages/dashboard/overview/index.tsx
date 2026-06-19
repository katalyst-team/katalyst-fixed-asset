import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { OverviewPage } from "@/modules/dashboard/overview";
import { createPageSEO } from "@/utils/seo";

export default function OverviewDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Stay on top of stock health with real-time totals, movement trends, and KPI widgets.",
    path: "/dashboard/overview",
    title: "Inventory Overview",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <OverviewPage />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", ["overview", "common"])),
    },
  };
};
