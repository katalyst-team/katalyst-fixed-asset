import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import Loading from "@/components/shared/Loading";
import {
  type KbmGradeConfig,
  KbmGradeConfigProvider,
} from "@/modules/dashboard/kbm-grade";
import { KbmItemFormPage } from "@/modules/dashboard/kbm-item";
import {
  EditKbmItemProvider,
  useEditKbmItem,
} from "@/modules/dashboard/kbm-item/edit-kbm-item";
import { createPageSEO } from "@/utils/seo";

function EditKbmDepartmentContent() {
  const { isError, isLoading, itemData } = useEditKbmItem();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading />
      </div>
    );
  }

  if (isError || !itemData) {
    return (
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold">Department not found</h1>
        <p className="text-muted-foreground mt-2">
          The department you are looking for does not exist or has been deleted.
        </p>
      </div>
    );
  }

  return <KbmItemFormPage itemData={itemData} />;
}

export default function EditKbmDepartmentPage() {
  const { query } = useRouter();
  const itemId = query.id as string;
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
    description: "Update KBM Department data.",
    path: "/dashboard/kbm-department/edit/[id]",
    title: "Edit KBM Department",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <KbmGradeConfigProvider value={config}>
          <EditKbmItemProvider itemId={itemId ?? ""}>
            <EditKbmDepartmentContent />
          </EditKbmItemProvider>
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
        "kbm-department",
      ])),
    },
  };
};
