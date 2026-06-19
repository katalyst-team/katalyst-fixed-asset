import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { VerificationStBasah } from "@/modules/dashboard/verification-st-basah";
import { createPageSEO } from "@/utils/seo";

export default function VerificationStBasahDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description: "Manage verification approvals for ST Basah inbound stock",
    path: "/dashboard/verification-st-basah",
    title: "Verification ST Basah",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <VerificationStBasah />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", [
      "common",
      "verification",
      "verification-st-basah",
    ])),
  },
});
