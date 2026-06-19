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

export default function KbmDepartmentDashboard() {
  const config: KbmGradeConfig = {
    basePath: "/dashboard/kbm-department",
    gradeType: "DEPARTMENT",
    title: "KBM Department",
    translationNamespace: "kbm-department",
  };

  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Manage master data for KBM Department including automatic volume calculations.",
    path: "/dashboard/kbm-department",
    title: "KBM Department",
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
        "kbm-department",
      ])),
    },
  };
};
