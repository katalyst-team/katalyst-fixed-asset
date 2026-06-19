/* eslint-disable simple-import-sort/imports */
import type { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import {
  DetailInventory,
  DetailInventoryProvider,
} from "@/modules/dashboard/detailInventory";
import { createPageSEO } from "@/utils/seo";

export default function DetailProduct() {
  const { query } = useRouter();
  const productId = query.product_id as string;

  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "Products", path: "/dashboard/product" },
    ],
    description:
      "See serialized product details, RFID history, and availability in one view.",
    path: "/dashboard/product/[product_id]",
    title: "Product Detail",
  });

  return (
    <>
      <SEO
        {...seo}
        noindex
      />
      <DashboardLayout>
        <DetailInventoryProvider skuId={productId ?? ""}>
          <DetailInventory skuId={productId ?? ""} />
        </DetailInventoryProvider>
      </DashboardLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { locale } = context;

  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", [
        "common",
        "detail-inventory",
        "inventory",
      ])),
    },
  };
};
