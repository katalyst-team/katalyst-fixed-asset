import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { SkuPage } from "@/modules/dashboard/sku";
import { createPageSEO } from "@/utils/seo";

export default function SKUDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Search SKUs, manage variants, and keep pricing plus attributes aligned across channels.",
    path: "/dashboard/sku",
    title: "SKU Management",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <SkuPage />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", ["common", "sku"])),
    },
  };
};
