import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import ReusableEpcV2 from "@/modules/dashboard/ledger/ledger-v2/ReusableEpcV2";
import { LedgerProviderV2 } from "@/modules/dashboard/ledger/ledger-v2/useLedgerV2";
import { createPageSEO } from "@/utils/seo";

export default function ReusableEpcDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Track reusable EPC tags waiting for inbound, monitor their status, and keep every label in circulation.",
    path: "/dashboard/reusable-epc",
    title: "Reusable EPC Manager",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <LedgerProviderV2>
          <ReusableEpcV2 />
        </LedgerProviderV2>
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
