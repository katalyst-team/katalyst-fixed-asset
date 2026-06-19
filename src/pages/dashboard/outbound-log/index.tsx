import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { OutboundLogPage } from "@/modules/dashboard/outbound-log";
import { createPageSEO } from "@/utils/seo";

export default function OutboundLogDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Review outbound movement logs with detailed item data and attribute visibility.",
    path: "/dashboard/outbound-log",
    title: "Outbound Log",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <OutboundLogPage />
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
