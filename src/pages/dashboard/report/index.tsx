import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { ReportPage, ReportProvider } from "@/modules/dashboard/report";
import { createPageSEO } from "@/utils/seo";

export default function ReportDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "View comprehensive stock movement reports with detailed filtering options.",
    path: "/dashboard/report",
    title: "Reports",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <ReportProvider itemsPerPage={20}>
          <ReportPage />
        </ReportProvider>
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", ["common"])),
    },
  };
};
