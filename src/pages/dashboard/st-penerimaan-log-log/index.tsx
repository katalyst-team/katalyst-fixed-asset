import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { StPenerimaanLogLogPage } from "@/modules/dashboard/st-penerimaan-log-log";
import { createPageSEO } from "@/utils/seo";

export default function StPenerimaanLogLogDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description: "ST Penerimaan Log - View assigned items with WAITING_INBOUND status.",
    path: "/dashboard/st-penerimaan-log-log",
    title: "ST Penerimaan Log",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <StPenerimaanLogLogPage />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", ["common", "st-penerimaan-log-log"])),
    },
  };
};
