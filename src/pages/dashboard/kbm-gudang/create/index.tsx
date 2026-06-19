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

export default function CreateKbmGudang() {
  const config: KbmGradeConfig = {
    basePath: "/dashboard/kbm-gudang",
    gradeType: "GUDANG",
    title: "KBM Gudang",
    translationNamespace: "kbm-gudang",
  };

  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "KBM Gudang", path: "/dashboard/kbm-gudang" },
    ],
    description: "Create a new KBM Gudang.",
    path: "/dashboard/kbm-gudang/create",
    title: "Create KBM Gudang",
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
        "kbm-gudang",
      ])),
    },
  };
};
