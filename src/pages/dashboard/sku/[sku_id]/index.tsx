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

export default function DetailSKU() {
  const { query } = useRouter();
  const skuId = query.sku_id as string;

  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "SKU", path: "/dashboard/sku" },
    ],
    description:
      "Dive into SKU-level inventory, pricing, and RFID reads in one detailed view.",
    path: "/dashboard/sku/[sku_id]",
    title: "SKU Detail",
  });

  return (
    <>
      <SEO {...seo} noindex />
      <DashboardLayout>
        <DetailInventoryProvider skuId={skuId ?? ""}>
          <DetailInventory skuId={skuId ?? ""} />
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
