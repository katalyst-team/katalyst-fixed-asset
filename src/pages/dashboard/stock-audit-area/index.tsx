import type { GetStaticProps, NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import StockAuditArea from "@/modules/dashboard/stock-audit-area/StockAuditArea";
import { createPageSEO } from "@/utils/seo";

const StockAuditAreaPage: NextPage = () => {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Schedule cycle counts for store areas, compare RFID reads, and resolve variances before they impact inventory.",
    path: "/dashboard/stock-audit-area",
    title: "Stock Audit Area",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <StockAuditArea />
      </DashboardLayout>
    </>
  );
};

export default StockAuditAreaPage;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", [
        "common",
        "stock-audit-area",
      ])),
    },
  };
};

