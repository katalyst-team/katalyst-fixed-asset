import type { GetStaticProps, NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import StockAuditTotal from "@/modules/dashboard/stock-audit-total";
import { createPageSEO } from "@/utils/seo";

const StockAuditTotalPage: NextPage = () => {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Review consolidated stock opname sessions from Odoo and inspect discrepancy totals per session.",
    path: "/dashboard/stock-audit-total",
    title: "Stock Audit Total",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <StockAuditTotal />
      </DashboardLayout>
    </>
  );
};

export default StockAuditTotalPage;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", ["common"])),
    },
  };
};
