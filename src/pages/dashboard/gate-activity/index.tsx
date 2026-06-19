import type { GetStaticProps, NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { GateActivityPage } from "@/modules/dashboard/gate-activity";
import { createPageSEO } from "@/utils/seo";

const GateActivityRoute: NextPage = () => {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description: "Analyze throughput, violations, and anomalies per gate.",
    path: "/dashboard/gate-activity",
    title: "Gate Activity Report",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <GateActivityPage />
      </DashboardLayout>
    </>
  );
};

export default GateActivityRoute;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", [
        "gate-activity",
        "common",
        "gate-log",
      ])),
    },
  };
};
