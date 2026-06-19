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

export default function DetailInventoryWithStore() {
  const { query } = useRouter();
  const skuId = query.sku_id as string;
  const storeId = query.store_id as string;

  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "Inventory", path: "/dashboard/inventory" },
    ],
    description:
      "Drill into a SKU’s availability, RFID reads, and movement history inside a specific store.",
    path: "/dashboard/inventory/store/[store_id]/[sku_id]",
    title: "Store SKU Detail",
  });

  return (
    <>
      <SEO {...seo} noindex />
      <DashboardLayout>
        <DetailInventoryProvider skuId={skuId ?? ""}>
          <DetailInventory skuId={skuId ?? ""} storeId={storeId ?? ""} />
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
