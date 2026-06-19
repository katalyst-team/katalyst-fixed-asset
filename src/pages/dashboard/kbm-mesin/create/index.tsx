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

export default function CreateKbmMesin() {
  const config: KbmGradeConfig = {
    basePath: "/dashboard/kbm-mesin",
    gradeType: "MESIN",
    title: "KBM Mesin",
    translationNamespace: "kbm-mesin",
  };

  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "KBM Mesin", path: "/dashboard/kbm-mesin" },
    ],
    description: "Create a new KBM Mesin.",
    path: "/dashboard/kbm-mesin/create",
    title: "Create KBM Mesin",
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
        "kbm-mesin",
      ])),
    },
  };
};
