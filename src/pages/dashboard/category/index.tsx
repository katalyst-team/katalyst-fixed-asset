import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { CategoryListPage, CategoryListProvider } from "@/modules/dashboard/category";
import { createPageSEO } from "@/utils/seo";

export default function CategoryDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description: "Manajemen Category",
    path: "/dashboard/category",
    title: "Category",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <CategoryListProvider>
          <CategoryListPage />
        </CategoryListProvider>
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "id", ["common", "category"])),
  },
});
