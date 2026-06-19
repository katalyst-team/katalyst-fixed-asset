import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import AddRemoveRfidPage from "@/modules/dashboard/add-remove-rfid";
import { createPageSEO } from "@/utils/seo";

export default function AddRemoveRfidDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description: "Add or remove RFID tags from items in your inventory.",
    path: "/dashboard/add-remove-rfid",
    title: "Add/Remove RFID",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <AddRemoveRfidPage />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", [
        "common",
        "add-remove-rfid",
      ])),
    },
  };
};
