import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { StockAlertConfigPage } from "@/modules/dashboard/stock-alert-config";
import { createPageSEO } from "@/utils/seo";

export default function StockAlertConfigDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Monitor and configure your inventory stock alert status in real-time.",
    path: "/dashboard/stock-alert-config",
    title: "Stock Alert Configuration",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <StockAlertConfigPage />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", [
        "stock-alert-config",
        "common",
      ])),
    },
  };
};
