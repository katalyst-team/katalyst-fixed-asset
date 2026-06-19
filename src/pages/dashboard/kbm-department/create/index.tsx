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

export default function CreateKbmDepartment() {
  const config: KbmGradeConfig = {
    basePath: "/dashboard/kbm-department",
    gradeType: "DEPARTMENT",
    title: "KBM Department",
    translationNamespace: "kbm-department",
  };

  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "KBM Department", path: "/dashboard/kbm-department" },
    ],
    description: "Create a new KBM Department.",
    path: "/dashboard/kbm-department/create",
    title: "Create KBM Department",
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
        "kbm-department",
      ])),
    },
  };
};
