import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import DetailStockAuditArea from "@/modules/dashboard/stock-audit-area/detail-stock-audit-area/DetailStockAuditArea";
import { createPageSEO } from "@/utils/seo";

const DetailStockAuditAreaPage: NextPage = () => {
  const { t } = useTranslation("stock-audit-area");
  const router = useRouter();
  const { sectionId, stock_movement_type_name, storeId } = router.query;

  const stockMovementTypeName =
    typeof stock_movement_type_name === "string" && stock_movement_type_name
      ? stock_movement_type_name
      : undefined;

  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "Stock Audit Area", path: "/dashboard/stock-audit-area" },
    ],
    description:
      "View detailed audit history and metrics for a specific section area.",
    path: "/dashboard/stock-audit-area/[storeId]/[sectionId]",
    title: "Stock Audit Area Detail",
  });

  return (
    <>
      <SEO {...seo} noindex />
      <DashboardLayout>
        {storeId && sectionId ? (
          <DetailStockAuditArea
            sectionId={sectionId as string}
            stockMovementTypeName={stockMovementTypeName}
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

export default DetailStockAuditAreaPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { locale } = context;

  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", [
        "common",
        "stock-audit-area",
      ])),
    },
  };
};
