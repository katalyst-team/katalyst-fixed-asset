import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import {
  type KbmGradeConfig,
  KbmGradeConfigProvider,
} from "@/modules/dashboard/kbm-grade";
import { KbmItemFormPage } from "@/modules/dashboard/kbm-item";
import { createPageSEO } from "@/utils/seo";

export default function CreateKbmMitraBisnis() {
  const config: KbmGradeConfig = {
    basePath: "/dashboard/kbm-mitra-bisnis",
    gradeType: "MITRA_BISNIS",
    title: "KBM Mitra Bisnis",
    translationNamespace: "kbm-mitra-bisnis",
  };

  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "KBM Mitra Bisnis", path: "/dashboard/kbm-mitra-bisnis" },
    ],
    description: "Create a new KBM Mitra Bisnis.",
    path: "/dashboard/kbm-mitra-bisnis/create",
    title: "Create KBM Mitra Bisnis",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <KbmGradeConfigProvider value={config}>
          <KbmItemFormPage />
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
        "kbm-mitra-bisnis",
      ])),
    },
  };
};
