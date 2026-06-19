import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { FaSecurityPage } from "@/modules/dashboard/fixed-assets/FaSecurityPage";
import { createPageSEO } from "@/utils/seo";

export default function FaSecurityRoute() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Loss prevention — RFID gates, geofence breaches, ML anomaly detection, CCTV auto-tagging.",
    path: "/dashboard/fixed-assets/security",
    title: "Loss Prevention · Security",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <FaSecurityPage />
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
