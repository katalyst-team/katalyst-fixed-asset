import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { LaminaInboundLogPage } from "@/modules/dashboard/lamina-inbound-log";
import { createPageSEO } from "@/utils/seo";

export default function LaminaInboundLogDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Review Lamina inbound movement logs with detailed item data and attribute visibility.",
    path: "/dashboard/lamina-inbound-log",
    title: "Lamina Inbound Log",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <LaminaInboundLogPage />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", ["common", "inbound", "verification"])),
    },
  };
};
