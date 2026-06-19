import type { GetStaticProps, NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import StockAudit from "@/modules/dashboard/stock-audit/StockAudit";
import { createPageSEO } from "@/utils/seo";

const StockAuditPage: NextPage = () => {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Schedule cycle counts, compare RFID reads, and resolve variances before they impact inventory.",
    path: "/dashboard/stock-audit",
    title: "Stock Audit",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <StockAudit />
      </DashboardLayout>
    </>
  );
};

export default StockAuditPage;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", [
        "common",
        "stock-audit",
      ])),
    },
  };
};
