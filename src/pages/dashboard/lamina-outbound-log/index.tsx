import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { LaminaOutboundLogPage } from "@/modules/dashboard/lamina-outbound-log";
import { createPageSEO } from "@/utils/seo";

export default function LaminaOutboundLogDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Review Lamina outbound movement logs with detailed item data and attribute visibility.",
    path: "/dashboard/lamina-outbound-log",
    title: "Lamina Outbound Log",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <LaminaOutboundLogPage />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", ["common", "outbound"])),
    },
  };
};
