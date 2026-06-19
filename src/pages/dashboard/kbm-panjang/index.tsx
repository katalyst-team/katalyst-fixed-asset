import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { KbmBatangManualPage } from "@/modules/dashboard/kbm-batang-manual";
import { createPageSEO } from "@/utils/seo";

export default function KbmPanjangDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "Master Data", path: "/dashboard" },
    ],
    description: "Manage preset values for KBM Panjang attribute",
    path: "/dashboard/kbm-panjang",
    title: "KBM Panjang",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <KbmBatangManualPage
          attributeFetchLimit={100000}
          attributeType="KBM_PANJANG"
          translationNamespace="kbm-panjang"
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
        "kbm-panjang",
      ])),
    },
  };
};
