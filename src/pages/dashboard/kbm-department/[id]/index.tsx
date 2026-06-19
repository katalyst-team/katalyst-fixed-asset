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

export default function DetailKbmDepartment() {
  const { query } = useRouter();
  const kbmDepartmentId = query.id as string;

  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "KBM Department", path: "/dashboard/kbm-department" },
    ],
    description:
      "See KBM Department details, RFID history, and availability in one view.",
    path: "/dashboard/kbm-department/[id]",
    title: "KBM Department Detail",
  });

  return (
    <>
      <SEO
        {...seo}
        noindex
      />
      <DashboardLayout>
        <DetailInventoryProvider skuId={kbmDepartmentId ?? ""}>
          <DetailInventory skuId={kbmDepartmentId ?? ""} />
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
        "kbm-department",
        "detail-inventory",
        "inventory",
      ])),
    },
  };
};
