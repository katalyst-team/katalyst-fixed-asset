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

export default function DetailKbmGradeStSusun() {
  const { query } = useRouter();
  const kbmGradeId = query.id as string;

  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "KBM Grade ST Susun", path: "/dashboard/kbm-grade-st-susun" },
    ],
    description:
      "See KBM Grade ST Susun details, RFID history, and availability in one view.",
    path: "/dashboard/kbm-grade-st-susun/[id]",
    title: "KBM Grade ST Susun Detail",
  });

  return (
    <>
      <SEO
        {...seo}
        noindex
      />
      <DashboardLayout>
        <DetailInventoryProvider skuId={kbmGradeId ?? ""}>
          <DetailInventory skuId={kbmGradeId ?? ""} />
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
        "kbm-grade-st-susun",
        "detail-inventory",
        "inventory",
      ])),
    },
  };
};
