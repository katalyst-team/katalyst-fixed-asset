import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import AssignRfid from "@/modules/dashboard/assign-rfid/AssignRfid";
import { createPageSEO } from "@/utils/seo";

export default function AssignRfidDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Assign existing RFID tags to inventory items. Select RFIDs and map them to SKUs or packing collections.",
    path: "/dashboard/assign-rfid",
    title: "Assign RFID",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <AssignRfid />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", [
        "common",
        "assign-rfid",
        "ledger",
      ])),
    },
  };
};
