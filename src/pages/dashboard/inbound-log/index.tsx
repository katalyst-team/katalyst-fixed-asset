import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { InboundLogPage } from "@/modules/dashboard/inbound-log";
import { createPageSEO } from "@/utils/seo";

export default function InboundLogDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Review inbound movement logs with detailed item data and attribute visibility.",
    path: "/dashboard/inbound-log",
    title: "Inbound Log",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <InboundLogPage />
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
