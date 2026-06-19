import type { GetStaticProps, NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { GateManagementPage } from "@/modules/dashboard/gate-management";
import { createPageSEO } from "@/utils/seo";

const GateManagementRoute: NextPage = () => {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description: "Manage RFID gates across stores and sections.",
    path: "/dashboard/gate-management",
    title: "Gate Management",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <GateManagementPage />
      </DashboardLayout>
    </>
  );
};

export default GateManagementRoute;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", [
        "gate-management",
        "common",
      ])),
    },
  };
};
