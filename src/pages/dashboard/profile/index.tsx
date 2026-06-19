import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { ProfilePage } from "@/modules/dashboard/profile";
import { createPageSEO } from "@/utils/seo";

export default function ProfileDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description: "View and manage your account profile information.",
    path: "/dashboard/profile",
    title: "Profile",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <ProfilePage />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", ["common", "profile"])),
    },
  };
};
