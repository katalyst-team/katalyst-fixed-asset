import type { GetStaticProps, NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { GateMonitorPage } from "@/modules/dashboard/gate-monitor";
import { createPageSEO } from "@/utils/seo";

const GateMonitorRoute: NextPage = () => {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description: "Monitor gate status and RFID traffic in real-time.",
    path: "/dashboard/gate-monitor",
    title: "Gate Monitor",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <GateMonitorPage />
      </DashboardLayout>
    </>
  );
};

export default GateMonitorRoute;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", [
        "gate-monitor",
        "common",
      ])),
    },
  };
};
