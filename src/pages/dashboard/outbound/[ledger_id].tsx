import type { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import {
  DetailInboundOutboundPage,
  DetailInboundOutboundProvider,
} from "@/modules/dashboard/detail-inbound-outbound";
import { createPageSEO } from "@/utils/seo";

export default function DetailOutbound() {
  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "Outbound", path: "/dashboard/outbound" },
    ],
    description:
      "Audit pick, pack, and ship events for a single outbound ledger entry.",
    path: "/dashboard/outbound/[ledger_id]",
    title: "Outbound Detail",
  });

  return (
    <>
      <SEO {...seo} noindex />
      <DashboardLayout>
        <DetailInboundOutboundProvider>
          <DetailInboundOutboundPage />
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
