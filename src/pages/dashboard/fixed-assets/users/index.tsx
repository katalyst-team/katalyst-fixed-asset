import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { FaUsersPage } from "@/modules/dashboard/fixed-assets/FaUsersPage";
import { createPageSEO } from "@/utils/seo";

export default function FaUsersRoute() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Manage users, roles, and access permissions. MFA enforcement and full audit log.",
    path: "/dashboard/fixed-assets/users",
    title: "User Management",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <FaUsersPage />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", [
        "fixed-assets",
        "common",
      ])),
    },
  };
};
