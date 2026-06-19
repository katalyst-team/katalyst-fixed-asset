import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import {
  type KbmGradeConfig,
  KbmGradeConfigProvider,
  KbmGradePage,
} from "@/modules/dashboard/kbm-grade";
import { createPageSEO } from "@/utils/seo";

export default function KbmBarangDashboard() {
  const config: KbmGradeConfig = {
    basePath: "/dashboard/kbm-barang",
    gradeType: "BARANG",
    title: "KBM Barang",
    translationNamespace: "kbm-barang",
  };

  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description: "Manage master data for KBM Barang.",
    path: "/dashboard/kbm-barang",
    title: "KBM Barang",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <KbmGradeConfigProvider value={config}>
          <KbmGradePage />
        </KbmGradeConfigProvider>
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", [
        "common",
        "kbm-barang",
      ])),
    },
  };
};
