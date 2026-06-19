import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { VerificationStKering } from "@/modules/dashboard/verification-st-kering";
import { createPageSEO } from "@/utils/seo";

export default function VerificationStKeringDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description: "Manage verification approvals for ST Kering inbound stock",
    path: "/dashboard/verification-st-kering",
    title: "Verification ST Kering",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <VerificationStKering />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", [
      "common",
      "verification",
      "verification-st-kering",
    ])),
  },
});
