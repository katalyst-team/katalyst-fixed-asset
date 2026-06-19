import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import PrintRfid from "@/modules/dashboard/print-rfid/PrintRfid";
import { createPageSEO } from "@/utils/seo";

export default function PrintRfidDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Print RFID labels and create RFID tags directly. Configure QZ Tray, customize label templates, and generate sequential RFID tags.",
    path: "/dashboard/print-rfid",
    title: "Print RFID",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <PrintRfid />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", [
        "common",
        "print-rfid",
      ])),
    },
  };
};
