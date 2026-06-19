import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { Verification } from "@/modules/dashboard/verification";
import { createPageSEO } from "@/utils/seo";

export default function VerificationDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description: "Manage verification approvals for inbound stock and stock audits",
    path: "/dashboard/verification",
    title: "Verification",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <Verification />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", [
      "common",
      "verification",
    ])),
  },
});
