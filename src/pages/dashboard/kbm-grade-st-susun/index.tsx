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

export default function KbmGradeDashboard() {
  const config: KbmGradeConfig = {
    basePath: "/dashboard/kbm-grade-st-susun",
    gradeType: "SUSUN",
    title: "KBM Grade ST Susun",
    translationNamespace: "kbm-grade-st-susun",
  };

  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Manage master data for KBM Grade ST Susun including automatic volume calculations.",
    path: "/dashboard/kbm-grade-st-susun",
    title: "KBM Grade ST Susun",
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
        "kbm-grade-st-susun",
      ])),
    },
  };
};
