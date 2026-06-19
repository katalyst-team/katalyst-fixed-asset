import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { KbmKayuStKeringListPage, KbmKayuStKeringListProvider } from "@/modules/dashboard/kbm-kayu-st-kering";
import { createPageSEO } from "@/utils/seo";

export default function KbmKayuStKeringDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description: "Manajemen KBM Kayu ST Kering",
    path: "/dashboard/kbm-kayu-st-kering",
    title: "KBM Kayu ST Kering",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <KbmKayuStKeringListProvider>
          <KbmKayuStKeringListPage />
        </KbmKayuStKeringListProvider>
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "id", ["common", "category", "kbm-kayu-st-kering"])),
  },
});
