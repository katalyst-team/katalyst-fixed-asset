import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import DetailStockAuditTotal from "@/modules/dashboard/stock-audit-total/detail/DetailStockAuditTotal";
import { createPageSEO } from "@/utils/seo";

const StockAuditTotalDetailPage: NextPage = () => {
  const router = useRouter();
  const { sessionId } = router.query;

  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "Stock Audit Total", path: "/dashboard/stock-audit-total" },
    ],
    description:
      "Inspect summary, SKU breakdown, and discrepancy rows from a stock audit total session.",
    path: "/dashboard/stock-audit-total/[sessionId]",
    title: "Stock Audit Total Detail",
  });

  return (
    <>
      <SEO {...seo} noindex />
      <DashboardLayout>
        {sessionId ? (
          <DetailStockAuditTotal sessionId={sessionId as string} />
        ) : null}
      </DashboardLayout>
    </>
  );
};

export default StockAuditTotalDetailPage;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", ["common"])),
    },
  };
};
