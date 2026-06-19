import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { LaminaLogPage } from "@/modules/dashboard/lamina-log";
import { createPageSEO } from "@/utils/seo";

export default function LaminaLogDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description: "Lamina Log - View assigned items with WAITING_INBOUND status.",
    path: "/dashboard/lamina-log",
    title: "Lamina Log",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <LaminaLogPage />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", ["common", "lamina-log"])),
    },
  };
};
