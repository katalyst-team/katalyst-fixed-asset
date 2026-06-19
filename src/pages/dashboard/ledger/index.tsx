import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { LedgerPage } from "@/modules/dashboard/ledger";
import { LedgerProvider } from "@/modules/dashboard/ledger/useLedger";
import { createPageSEO } from "@/utils/seo";

export default function LedgerDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Track every inbound, outbound, and adjustment entry with instant totals and audit-ready history.",
    path: "/dashboard/ledger",
    title: "Inventory Ledger",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <LedgerProvider>
          <LedgerPage />
        </LedgerProvider>
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", ["common", "ledger"])),
    },
  };
};
