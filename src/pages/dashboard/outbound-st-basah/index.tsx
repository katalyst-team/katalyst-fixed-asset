import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { OutboundStBasahPage } from "@/modules/dashboard/outbound-st-basah";
import { createPageSEO } from "@/utils/seo";

export default function OutboundStBasahDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Review outbound movement logs for ST Basah with detailed item data and attribute visibility.",
    path: "/dashboard/outbound-st-basah",
    title: "Outbound ST Basah",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <OutboundStBasahPage />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", ["common", "outbound"])),
    },
  };
};
