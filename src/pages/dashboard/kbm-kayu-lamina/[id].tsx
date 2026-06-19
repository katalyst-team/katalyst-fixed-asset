import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { SubCategoryPage } from "@/modules/dashboard/kbm-kayu-lamina";
import { createPageSEO } from "@/utils/seo";

export default function SubCategoryDashboard() {
  const router = useRouter();
  const { id } = router.query;
  const categoryId = typeof id === "string" ? id : "";

  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "KBM Kayu Lamina", path: "/dashboard/kbm-kayu-lamina" },
    ],
    description: "Manajemen Sub KBM Kayu Lamina",
    path: `/dashboard/kbm-kayu-lamina/${categoryId}`,
    title: "Sub KBM Kayu Lamina",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <SubCategoryPage categoryId={categoryId} />
      </DashboardLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "id", ["common", "category", "kbm-kayu-lamina"])),
  },
});
