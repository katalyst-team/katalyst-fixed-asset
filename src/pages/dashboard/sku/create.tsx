import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { SkuFormPage } from "@/modules/dashboard/sku/SkuFormPage";
import { createPageSEO } from "@/utils/seo";

export default function CreateSkuPage() {
  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "SKU", path: "/dashboard/sku" },
    ],
    description:
      "Add a new SKU with the right attributes, pricing, and media for your catalog.",
    path: "/dashboard/sku/create",
    title: "Create SKU",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <SkuFormPage />
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
