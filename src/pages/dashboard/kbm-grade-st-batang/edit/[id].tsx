import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import Loading from "@/components/shared/Loading";
import {
  type KbmGradeConfig,
  KbmGradeConfigProvider,
  KbmGradeFormPage,
} from "@/modules/dashboard/kbm-grade";
import {
  EditKbmGradeProvider,
  useEditKbmGrade,
} from "@/modules/dashboard/kbm-grade/edit-kbm-grade";
import { createPageSEO } from "@/utils/seo";

function EditKbmGradeStBatangContent() {
  const { gradeData, isError, isLoading } = useEditKbmGrade();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading />
      </div>
    );
  }

  if (isError || !gradeData) {
    return (
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold">Grade not found</h1>
        <p className="text-muted-foreground mt-2">
          The grade you are looking for does not exist or has been deleted.
        </p>
      </div>
    );
  }

  return <KbmGradeFormPage gradeData={gradeData} />;
}

export default function EditKbmGradeStBatangPage() {
  const { query } = useRouter();
  const gradeId = query.id as string;
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
      "Update KBM Grade ST Batang data including dimensions and volume calculations.",
    path: "/dashboard/kbm-grade-st-batang/edit/[id]",
    title: "Edit KBM Grade ST Batang",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <KbmGradeConfigProvider value={config}>
          <EditKbmGradeProvider gradeId={gradeId ?? ""}>
            <EditKbmGradeStBatangContent />
          </EditKbmGradeProvider>
        </KbmGradeConfigProvider>
      </DashboardLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", [
        "common",
        "kbm-grade-st-batang",
      ])),
    },
  };
};
