import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { FaRTLSPage } from "@/modules/dashboard/fixed-assets/FaRTLSPage";
import { createPageSEO } from "@/utils/seo";

export default function FaRTLSRoute() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Live position of every asset with UHF phase + BLE anchor fusion and sub-meter accuracy.",
    path: "/dashboard/fixed-assets/rtls",
    title: "Real-Time Asset Location",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <FaRTLSPage />
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
