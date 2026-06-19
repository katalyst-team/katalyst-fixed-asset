import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { KbmBatangManualPage } from "@/modules/dashboard/kbm-batang-manual";
import { createPageSEO } from "@/utils/seo";

export default function KbmPanjangLogDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "Master Data", path: "/dashboard" },
    ],
    description: "Manage preset values for Panjang Log attribute",
    path: "/dashboard/kbm-panjang-log",
    title: "Panjang Log",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <KbmBatangManualPage
          attributeFetchLimit={100000}
          attributeType="KBM_PANJANG_LOG"
          translationNamespace="kbm-panjang-log"
        />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", [
        "common",
        "kbm-panjang-log",
      ])),
    },
  };
};
