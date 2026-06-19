import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { KbmBatangManualPage } from "@/modules/dashboard/kbm-batang-manual";
import { createPageSEO } from "@/utils/seo";

export default function KbmNoPaletDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "Master Data", path: "/dashboard" },
    ],
    description: "Manage preset values for No Palet attribute",
    path: "/dashboard/kbm-no-palet",
    title: "No Palet",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <KbmBatangManualPage
          attributeFetchLimit={100000}
          attributeType="KBM_NO_PALET"
          translationNamespace="kbm-no-palet"
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
        "kbm-no-palet",
      ])),
    },
  };
};
