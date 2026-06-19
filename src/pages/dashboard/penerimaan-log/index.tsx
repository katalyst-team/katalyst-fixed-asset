import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { PenerimaanLogPage } from "@/modules/dashboard/penerimaan-log";
import { createPageSEO } from "@/utils/seo";

export default function PenerimaanLogDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description: "Penerimaan Log - View assigned items with WAITING_INBOUND status.",
    path: "/dashboard/penerimaan-log",
    title: "Penerimaan Log",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <PenerimaanLogPage />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", ["common", "penerimaan-log"])),
    },
  };
};
