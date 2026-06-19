import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { KbmKayuBulatListPage, KbmKayuBulatListProvider } from "@/modules/dashboard/kbm-kayu-bulat";
import { createPageSEO } from "@/utils/seo";

export default function KbmKayuBulatDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description: "Manajemen KBM Kayu Bulat",
    path: "/dashboard/kbm-kayu-bulat",
    title: "KBM Kayu Bulat",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <KbmKayuBulatListProvider>
          <KbmKayuBulatListPage />
        </KbmKayuBulatListProvider>
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "id", ["common", "category", "kbm-kayu-bulat"])),
  },
});