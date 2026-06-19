import type { GetStaticProps, NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import InventoryArea from "@/modules/dashboard/inventory-area/InventoryArea";
import { createPageSEO } from "@/utils/seo";

const InventoryAreaPage: NextPage = () => {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "View inventory quantity summary per section area across stores.",
    path: "/dashboard/inventory-area",
    title: "Inventory Area",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <InventoryArea />
      </DashboardLayout>
    </>
  );
};

export default InventoryAreaPage;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", [
        "common",
        "inventory-area",
      ])),
    },
  };
};
