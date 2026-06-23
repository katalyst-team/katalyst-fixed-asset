import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { FaLayout } from "@/modules/dashboard/fixed-assets/FaLayout";
import { FaSettingsPage } from "@/modules/dashboard/fixed-assets/FaSettingsPage";
import { createPageSEO } from "@/utils/seo";

export default function FaSettingsRoute() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "System configuration — workspace, notifications, maintenance reminders, ERP integrations, and security.",
    path: "/dashboard/fixed-assets/settings",
    title: "Settings",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <FaLayout>
          <FaSettingsPage />
        </FaLayout>
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
