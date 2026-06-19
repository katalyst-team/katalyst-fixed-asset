import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { FaAuditPage } from "@/modules/dashboard/fixed-assets/FaAuditPage";
import { createPageSEO } from "@/utils/seo";

export default function FaAuditRoute() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "RFID-enabled physical audit with zone reconciliation, variance analysis, and GL adjustments.",
    path: "/dashboard/fixed-assets/audit",
    title: "Stock Audit",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <FaAuditPage />
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
