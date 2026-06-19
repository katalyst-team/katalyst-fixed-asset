import type { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { DetailInboundOutboundProvider } from "@/modules/dashboard/detail-inbound-outbound/useDetailInboundOutbound";
import { DetailLedgerV2 } from "@/modules/dashboard/ledger/ledger-v2/detal-ledger-v2";
import { createPageSEO } from "@/utils/seo";

export default function DetailLedgerV2Page() {
  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "Inventory Analytics", path: "/dashboard/ledger-v2" },
    ],
    description:
      "Open any analytics report to see predictive insights, trend details, and BI context.",
    path: "/dashboard/ledger-v2/[ledger_id]",
    title: "Analytics Report Detail",
  });

  return (
    <>
      <SEO {...seo} noindex />
      <DashboardLayout>
        <DetailInboundOutboundProvider>
          <DetailLedgerV2 />
        </DetailInboundOutboundProvider>
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
        "detail-inbound-outbound",
        "ledger",
      ])),
    },
  };
};
