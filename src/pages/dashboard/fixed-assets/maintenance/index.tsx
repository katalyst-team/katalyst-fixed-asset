import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { FaLayout } from "@/modules/dashboard/fixed-assets/FaLayout";
import { FaMaintenancePage } from "@/modules/dashboard/fixed-assets/FaMaintenancePage";
import { createPageSEO } from "@/utils/seo";

export default function FaMaintenanceRoute() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "CMMS — work orders, asset health, preventive maintenance, and inspections.",
    path: "/dashboard/fixed-assets/maintenance",
    title: "Maintenance · CMMS",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <FaLayout>
          <FaMaintenancePage />
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
