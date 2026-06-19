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

export default function DetailKbmMitraBisnis() {
  const { query } = useRouter();
  const kbmMitraBisnisId = query.id as string;

  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "KBM Mitra Bisnis", path: "/dashboard/kbm-mitra-bisnis" },
    ],
    description:
      "See KBM Mitra Bisnis details, RFID history, and availability in one view.",
    path: "/dashboard/kbm-mitra-bisnis/[id]",
    title: "KBM Mitra Bisnis Detail",
  });

  return (
    <>
      <SEO
        {...seo}
        noindex
      />
      <DashboardLayout>
        <DetailInventoryProvider skuId={kbmMitraBisnisId ?? ""}>
          <DetailInventory skuId={kbmMitraBisnisId ?? ""} />
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
        "kbm-mitra-bisnis",
        "detail-inventory",
        "inventory",
      ])),
    },
  };
};
