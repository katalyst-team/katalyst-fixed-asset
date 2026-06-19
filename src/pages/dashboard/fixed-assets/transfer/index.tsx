import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { FaTransferPage } from "@/modules/dashboard/fixed-assets/FaTransferPage";
import { createPageSEO } from "@/utils/seo";

export default function FaTransferRoute() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Move assets between locations and custodians. RFID gates auto-confirm receipt.",
    path: "/dashboard/fixed-assets/transfer",
    title: "Asset Transfers",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <FaTransferPage />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", [
        "fixed-assets",
        "common",
      ])),
    },
  };
};
