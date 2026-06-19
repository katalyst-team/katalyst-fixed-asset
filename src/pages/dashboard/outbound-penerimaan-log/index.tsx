import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { OutboundPenerimaanLogPage } from "@/modules/dashboard/outbound-penerimaan-log";
import { createPageSEO } from "@/utils/seo";

export default function OutboundPenerimaanLogDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Review outbound movement logs for Penerimaan Log with detailed item data and attribute visibility.",
    path: "/dashboard/outbound-penerimaan-log",
    title: "Outbound Penerimaan Log",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <OutboundPenerimaanLogPage />
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
