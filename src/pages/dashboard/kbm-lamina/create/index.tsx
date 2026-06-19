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

export default function CreateKbmLamina() {
  const config: KbmGradeConfig = {
    basePath: "/dashboard/kbm-lamina",
    gradeType: "LAMINA",
    title: "KBM Lamina",
    translationNamespace: "kbm-lamina",
  };

  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "KBM Lamina", path: "/dashboard/kbm-lamina" },
    ],
    description: "Create a new KBM Lamina.",
    path: "/dashboard/kbm-lamina/create",
    title: "Create KBM Lamina",
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
        "kbm-lamina",
      ])),
    },
  };
};
