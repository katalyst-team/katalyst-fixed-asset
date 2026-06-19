import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { FaDashboardPage } from "@/modules/dashboard/fixed-assets/FaDashboardPage";
import { createPageSEO } from "@/utils/seo";

export default function FaDashboardRoute() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Real-time asset status across all sites. Track utilization, alerts, audit progress, and financial health.",
    path: "/dashboard/fixed-assets",
    title: "Fixed Assets Dashboard",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <FaDashboardPage />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", [
        "fixed-assets",
        "common",
      ])),
    },
  };
};
