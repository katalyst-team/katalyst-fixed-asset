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

export default function DetailKbmBarang() {
  const { query } = useRouter();
  const kbmBarangId = query.id as string;

  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "KBM Barang", path: "/dashboard/kbm-barang" },
    ],
    description:
      "See KBM Barang details, RFID history, and availability in one view.",
    path: "/dashboard/kbm-barang/[id]",
    title: "KBM Barang Detail",
  });

  return (
    <>
      <SEO
        {...seo}
        noindex
      />
      <DashboardLayout>
        <DetailInventoryProvider skuId={kbmBarangId ?? ""}>
          <DetailInventory skuId={kbmBarangId ?? ""} />
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
        "kbm-barang",
        "detail-inventory",
        "inventory",
      ])),
    },
  };
};
