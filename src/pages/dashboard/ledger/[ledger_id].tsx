import type { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { DetailLedgerPage } from "@/modules/dashboard/ledger/detail-ledger";
import { DetailLedgerProvider } from "@/modules/dashboard/ledger/detail-ledger/useDetailLedger";
import { createPageSEO } from "@/utils/seo";

export default function DetailLedger() {
  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "Ledger", path: "/dashboard/ledger" },
    ],
    description:
      "Review ledger entries, costs, and the audit trail for a single inventory transaction.",
    path: "/dashboard/ledger/[ledger_id]",
    title: "Ledger Detail",
  });

  return (
    <>
      <SEO {...seo} noindex />
      <DashboardLayout>
        <DetailLedgerProvider>
          <DetailLedgerPage />
        </DetailLedgerProvider>
      </DashboardLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { locale } = context;

  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", ["common", "ledger"])),
    },
  };
};
