import type { GetStaticProps, NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import GateLog from "@/modules/dashboard/gate-log/GateLog";
import { createPageSEO } from "@/utils/seo";

const GateLogPage: NextPage = () => {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Monitor gate sessions, signal quality, and tagged items as they enter or exit your facility.",
    path: "/dashboard/gate-log",
    title: "Gate Logs",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <GateLog />
      </DashboardLayout>
    </>
  );
};

export default GateLogPage;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", [
        "common",
        "gate-log",
      ])),
    },
  };
};
