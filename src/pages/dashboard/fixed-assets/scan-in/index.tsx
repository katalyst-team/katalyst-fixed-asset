import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { FaLayout } from "@/modules/dashboard/fixed-assets/FaLayout";
import { FaScanInPage } from "@/modules/dashboard/fixed-assets/FaScanInPage";
import { createPageSEO } from "@/utils/seo";

export default function FaScanInRoute() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Receive new POs, bulk RFID tag, assign custodians, and deploy assets.",
    path: "/dashboard/fixed-assets/scan-in",
    title: "Scan-In · Asset Receiving",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <FaLayout>
          <FaScanInPage />
        </FaLayout>
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", [
        "fixed-assets",
        "common",
      ])),
    },
  };
};
