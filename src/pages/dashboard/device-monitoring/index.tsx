import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { DeviceMonitoringPage } from "@/modules/dashboard/device-monitoring";
import { createPageSEO } from "@/utils/seo";

export default function DeviceMonitoringRoute() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description: "Monitor RFID devices status and performance in real-time.",
    path: "/dashboard/device-monitoring",
    title: "Device Monitoring",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <DeviceMonitoringPage />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", [
        "device-monitoring",
        "common",
      ])),
    },
  };
};
