import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { KbmKayuLaminaListPage, KbmKayuLaminaListProvider } from "@/modules/dashboard/kbm-kayu-lamina";
import { createPageSEO } from "@/utils/seo";

export default function KbmKayuLaminaDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description: "Manajemen KBM Kayu Lamina",
    path: "/dashboard/kbm-kayu-lamina",
    title: "KBM Kayu Lamina",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <KbmKayuLaminaListProvider>
          <KbmKayuLaminaListPage />
        </KbmKayuLaminaListProvider>
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "id", ["common", "category", "kbm-kayu-lamina"])),
  },
});
