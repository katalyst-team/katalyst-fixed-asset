import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import UserMenuEditPage from "@/modules/dashboard/user-menu/UserMenuEditPage";
import { createPageSEO } from "@/utils/seo";

interface EditPageProps {
  accountOrganizationId: string;
}

export default function UserMenuEdit({ accountOrganizationId }: EditPageProps) {
  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "User Menu", path: "/dashboard/user-menu" },
    ],
    description: "Edit user menu permissions",
    path: "/dashboard/user-menu/edit",
    title: "Edit User Menu Permissions",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <UserMenuEditPage accountOrganizationId={accountOrganizationId} />
      </DashboardLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  locale,
  query,
}) => {
  const accountOrganizationId = (query.accountOrganizationId as string) ?? "";

  return {
    props: {
      accountOrganizationId,
      ...(await serverSideTranslations(locale ?? "en", [
        "common",
        "user-menu",
      ])),
    },
  };
};
