import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { OverviewSettingsPage } from "@/modules/dashboard/overview-settings";
import { createPageSEO } from "@/utils/seo";

export default function OverviewSettingsDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Configure overview dashboard settings including stock thresholds and analytics parameters.",
    path: "/dashboard/overview-settings",
    title: "Overview Settings",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <OverviewSettingsPage />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", [
        "overview-settings",
        "common",
      ])),
    },
  };
};
