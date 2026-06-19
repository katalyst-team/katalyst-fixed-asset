import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import CreateOutbound from "@/modules/dashboard/outbound/create/CreateOutbound";
import { createPageSEO } from "@/utils/seo";

export default function CreateOutboundPage() {
  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "Outbound", path: "/dashboard/outbound" },
    ],
    description:
      "Build outbound jobs with RFID scans, carrier info, and real-time deduction of stock.",
    path: "/dashboard/outbound/create",
    title: "Create Outbound",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <CreateOutbound />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", [
        "common",
        "outbound",
        "inbound",
      ])),
    },
  };
};
