import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import LedgerV2 from "@/modules/dashboard/ledger/ledger-v2/LedgerV2";
import { LedgerProviderV2 } from "@/modules/dashboard/ledger/ledger-v2/useLedgerV2";
import { createPageSEO } from "@/utils/seo";

export default function LedgerV2Dashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Explore advanced inventory analytics, from predictive insights to custom dashboards.",
    path: "/dashboard/ledger-v2",
    title: "Inventory Analytics",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <LedgerProviderV2>
          <LedgerV2 />
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
