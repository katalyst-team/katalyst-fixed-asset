import type { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import DetailInboundOutbound from "@/modules/dashboard/detail-inbound-outbound/DetailInboundOutbound";
import { DetailInboundOutboundProvider } from "@/modules/dashboard/detail-inbound-outbound/useDetailInboundOutbound";
import { createPageSEO } from "@/utils/seo";

export default function DetailInbound() {
  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "Inbound", path: "/dashboard/inbound" },
    ],
    description:
      "Inspect scans, receiving notes, and approvals for a specific inbound ledger entry.",
    path: "/dashboard/inbound/[ledger_id]",
    title: "Inbound Detail",
  });

  return (
    <>
      <SEO {...seo} noindex />
      <DashboardLayout>
        <DetailInboundOutboundProvider>
          <DetailInboundOutbound />
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
        "verification",
      ])),
    },
  };
};
