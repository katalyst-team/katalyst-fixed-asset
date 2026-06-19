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

export default function CreateKbmGrade() {
  const config: KbmGradeConfig = {
    basePath: "/dashboard/kbm-grade-st-susun",
    gradeType: "SUSUN",
    title: "KBM Grade ST Susun",
    translationNamespace: "kbm-grade-st-susun",
  };

  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "KBM Grade ST Susun", path: "/dashboard/kbm-grade-st-susun" },
    ],
    description:
      "Create a new KBM Grade ST Susun with automatic volume calculations.",
    path: "/dashboard/kbm-grade-st-susun/create",
    title: "Create KBM Grade ST Susun",
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
        "kbm-grade-st-susun",
      ])),
    },
  };
};
