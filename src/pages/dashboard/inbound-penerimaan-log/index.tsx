import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { InboundPenerimaanLogPage } from "@/modules/dashboard/inbound-penerimaan-log";
import { createPageSEO } from "@/utils/seo";

export default function InboundPenerimaanLogDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Review inbound movement logs for Penerimaan Log with detailed item data and attribute visibility.",
    path: "/dashboard/inbound-penerimaan-log",
    title: "Inbound Penerimaan Log",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <InboundPenerimaanLogPage />
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
