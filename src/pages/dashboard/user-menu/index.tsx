import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { UserMenuPage } from "@/modules/dashboard/user-menu";
import { createPageSEO } from "@/utils/seo";

export default function UserMenuDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Configure per-user menu access. Enable or disable menu items for each employee.",
    path: "/dashboard/user-menu",
    title: "User Menu Management",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <UserMenuPage />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", [
        "common",
        "user-menu",
        "employee",
      ])),
    },
  };
};
