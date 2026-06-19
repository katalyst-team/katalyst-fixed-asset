import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { LedgerProductPage } from "@/modules/dashboard/ledger-product";
import { createPageSEO } from "@/utils/seo";

export default function LedgerProductDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Search, filter, and analyze every product ledger entry without leaving the dashboard.",
    path: "/dashboard/ledger-product",
    title: "Ledger Product",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <LedgerProductPage />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", ["common", "ledger-product"])),
    },
  };
};
