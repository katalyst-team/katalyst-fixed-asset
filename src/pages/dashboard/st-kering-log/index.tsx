import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { StKeringLogPage } from "@/modules/dashboard/st-kering-log";
import { createPageSEO } from "@/utils/seo";

export default function StKeringLogDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description: "ST Kering Log - View assigned items with WAITING_INBOUND status.",
    path: "/dashboard/st-kering-log",
    title: "ST Kering Log",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <StKeringLogPage />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", ["common", "st-kering-log"])),
    },
  };
};
