import type { GetStaticProps, NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { DeviceManagementPage } from "@/modules/dashboard/device-management";
import { createPageSEO } from "@/utils/seo";

const DeviceManagementRoute: NextPage = () => {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description: "Manage RFID readers and hardware devices across stores.",
    path: "/dashboard/device-management",
    title: "Device Management",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <DeviceManagementPage />
      </DashboardLayout>
    </>
  );
};

export default DeviceManagementRoute;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", [
        "device-management",
        "common",
        "gate-log",
      ])),
    },
  };
};
