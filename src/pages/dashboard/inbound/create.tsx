import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import CreateInbound from "@/modules/dashboard/inbound/create/CreateInbound";
import { createPageSEO } from "@/utils/seo";

export default function CreateInboundPage() {
  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "Inbound", path: "/dashboard/inbound" },
    ],
    description:
      "Capture new inbound movements with RFID scans, supplier data, and automatic inventory updates.",
    path: "/dashboard/inbound/create",
    title: "Create Inbound",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <CreateInbound />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", ["common", "inbound"])),
    },
  };
};
