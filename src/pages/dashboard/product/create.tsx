import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { ProductFormPage } from "@/modules/dashboard/product/ProductFormPage";
import { createPageSEO } from "@/utils/seo";

export default function CreateProductPage() {
  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "Products", path: "/dashboard/product" },
    ],
    description:
      "Add a new serialized product with complete attributes, media, and tracking metadata.",
    path: "/dashboard/product/create",
    title: "Create Product",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <ProductFormPage />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", [
        "common",
        "product",
        "sku",
      ])),
    },
  };
};
