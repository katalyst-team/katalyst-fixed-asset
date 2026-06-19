import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { StBasahLogPage } from "@/modules/dashboard/st-basah-log";
import { createPageSEO } from "@/utils/seo";

export default function StBasahLogDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description: "ST Basah - View assigned items with WAITING_INBOUND status.",
    path: "/dashboard/st-basah-log",
    title: "ST Basah",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <StBasahLogPage />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", ["common", "st-basah-log"])),
    },
  };
};
