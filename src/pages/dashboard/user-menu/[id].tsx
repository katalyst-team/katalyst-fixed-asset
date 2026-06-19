import type { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import UserMenuEditPage from "@/modules/dashboard/user-menu/UserMenuEditPage";
import { createPageSEO } from "@/utils/seo";

interface Props {
  accountOrganizationId: string;
}

export default function UserMenuEditRoute({ accountOrganizationId }: Props) {
  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "User Menu", path: "/dashboard/user-menu" },
    ],
    description: "Edit user menu access permissions.",
    path: "/dashboard/user-menu/[id]",
    title: "Edit Menu Access",
  });

  return (
    <>
      <SEO noindex {...seo} />
      <DashboardLayout>
        <UserMenuEditPage accountOrganizationId={accountOrganizationId} />
      </DashboardLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };
  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? "en", [
        "common",
        "user-menu",
      ])),
      accountOrganizationId: id,
    },
  };
};
