import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import DisposableEpcV2 from "@/modules/dashboard/ledger/ledger-v2/DisposableEpcV2";
import { LedgerProviderV2 } from "@/modules/dashboard/ledger/ledger-v2/useLedgerV2";
import { createPageSEO } from "@/utils/seo";

export default function DisposableEpcDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Manage disposable EPC tags, control the print queue, and keep RFID labels ready for operations.",
    path: "/dashboard/disposable-epc",
    title: "Disposable EPC Manager",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <LedgerProviderV2>
          <DisposableEpcV2 />
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
