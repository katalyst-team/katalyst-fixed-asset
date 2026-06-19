import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import DetailInventoryArea from "@/modules/dashboard/inventory-area/detail-inventory-area/DetailInventoryArea";
import { createPageSEO } from "@/utils/seo";

const DetailInventoryAreaPage: NextPage = () => {
  const { t } = useTranslation("inventory-area");
  const router = useRouter();
  const { sectionId, stock_movement_type_id, storeId, query: queryParam } = router.query;

  const stockMovementTypeIds =
    typeof stock_movement_type_id === "string" && stock_movement_type_id
      ? [stock_movement_type_id]
      : undefined;

  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "Inventory Area", path: "/dashboard/inventory-area" },
    ],
    description: "View SKU inventory detail within a specific section area.",
    path: "/dashboard/inventory-area/[storeId]/[sectionId]",
    title: "Inventory Area Detail",
  });

  return (
    <>
      <SEO {...seo} noindex />
      <DashboardLayout>
        {storeId && sectionId ? (
          <DetailInventoryArea
            initialFilters={{
              limit: 20,
              ...(queryParam && { query: String(queryParam) }),
            }}
            sectionId={sectionId as string}
            stockMovementTypeIds={stockMovementTypeIds}
            storeId={storeId as string}
          />
        ) : (
          <div className="flex justify-center items-center h-96">
            <p>{t("loading")}</p>
          </div>
        )}
      </DashboardLayout>
    </>
  );
};

export default DetailInventoryAreaPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { locale } = context;

  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", [
        "common",
        "inventory-area",
      ])),
    },
  };
};
