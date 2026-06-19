import type { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import {
  ItemHistoryPage,
  ItemHistoryProvider,
} from "@/modules/dashboard/itemHistory";
import { createPageSEO } from "@/utils/seo";

export default function ItemHistoryRoute() {
  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "Store", path: "/dashboard/store" },
      { name: "Item History", path: "/dashboard/store/items" },
    ],
    description:
      "View item status history, including all status changes and operator actions.",
    path: "/dashboard/store/[storeId]/items/[itemId]",
    title: "Item History",
  });

  return (
    <>
      <SEO {...seo} noindex />
      <DashboardLayout>
        <ItemHistoryProvider>
          <ItemHistoryPage />
        </ItemHistoryProvider>
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
        "sku",
        "detail-inventory",
        "inventory",
        "item-history",
      ])),
    },
  };
};
