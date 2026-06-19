import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { InventoryWrapper } from "@/modules/dashboard/inventory";
import { createPageSEO } from "@/utils/seo";

export default function InventoryDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Get real-time stock levels, alerts, and analytics across every store and SKU.",
    path: "/dashboard/inventory",
    title: "Inventory Dashboard",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <InventoryWrapper />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", [
        "common",
        "inventory",
      ])),
    },
  };
};
