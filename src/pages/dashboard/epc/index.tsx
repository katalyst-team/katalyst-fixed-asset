import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { EpcPage } from "@/modules/dashboard/epc";
import { createPageSEO } from "@/utils/seo";

export default function EpcDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Track RFID tags, see their latest scans, and manage both reusable and disposable EPC codes.",
    path: "/dashboard/epc",
    title: "EPC Management",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <EpcPage />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", ["epc", "common"])),
    },
  };
};
