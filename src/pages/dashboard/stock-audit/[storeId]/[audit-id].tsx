import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import DetailStockAudit from "@/modules/dashboard/stock-audit/detail-stock-audit/DetailStockAudit";
import { createPageSEO } from "@/utils/seo";

const StockAuditDetailPage: NextPage = () => {
  const { t } = useTranslation("stock-audit");
  const router = useRouter();
  const { "audit-id": auditId, storeId } = router.query;

  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "Stock Audit", path: "/dashboard/stock-audit" },
    ],
    description:
      "Review audit counts, RFID verification results, and discrepancy notes for any store audit.",
    path: "/dashboard/stock-audit/[storeId]/[audit-id]",
    title: "Stock Audit Detail",
  });

  return (
    <>
      <SEO {...seo} noindex />
      <DashboardLayout>
        {auditId && storeId ? (
          <DetailStockAudit auditId={auditId as string} storeId={storeId as string} />
        ) : (
          <div className="flex justify-center items-center h-96">
            <p>{t("loading")}</p>
          </div>
        )}
      </DashboardLayout>
    </>
  );
};

export default StockAuditDetailPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { locale } = context;

  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", [
        "common",
        "stock-audit",
        "verification",
      ])),
    },
  };
};
