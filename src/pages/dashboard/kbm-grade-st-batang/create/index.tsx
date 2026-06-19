import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import {
  type KbmGradeConfig,
  KbmGradeConfigProvider,
  KbmGradeFormPage,
} from "@/modules/dashboard/kbm-grade";
import { createPageSEO } from "@/utils/seo";

export default function CreateKbmGradeStBatang() {
  const config: KbmGradeConfig = {
    basePath: "/dashboard/kbm-grade-st-batang",
    gradeType: "BATANG",
    title: "KBM Grade ST Batang",
    translationNamespace: "kbm-grade-st-batang",
  };

  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "KBM Grade ST Batang", path: "/dashboard/kbm-grade-st-batang" },
    ],
    description:
      "Create a new KBM Grade ST Batang with automatic volume calculations.",
    path: "/dashboard/kbm-grade-st-batang/create",
    title: "Create KBM Grade ST Batang",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <KbmGradeConfigProvider value={config}>
          <KbmGradeFormPage />
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
        "kbm-grade-st-batang",
      ])),
    },
  };
};
