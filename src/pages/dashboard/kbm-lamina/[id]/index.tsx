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

export default function DetailKbmLamina() {
  const { query } = useRouter();
  const kbmLaminaId = query.id as string;

  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "KBM Lamina", path: "/dashboard/kbm-lamina" },
    ],
    description:
      "See KBM Lamina details, RFID history, and availability in one view.",
    path: "/dashboard/kbm-lamina/[id]",
    title: "KBM Lamina Detail",
  });

  return (
    <>
      <SEO
        {...seo}
        noindex
      />
      <DashboardLayout>
        <DetailInventoryProvider skuId={kbmLaminaId ?? ""}>
          <DetailInventory skuId={kbmLaminaId ?? ""} />
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
        "kbm-lamina",
        "detail-inventory",
        "inventory",
      ])),
    },
  };
};
