import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import StockMovementTypes from "@/modules/dashboard/stock-movement-types";
import { createPageSEO } from "@/utils/seo";

export default function StockMovementTypesDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Define inbound, outbound, and ledger movement types so every transaction is categorized correctly.",
    path: "/dashboard/stock-movement-types",
    title: "Stock Movement Types",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <StockMovementTypes />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", [
        "common",
        "stock-movement-types",
      ])),
    },
  };
};
