import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { VerificationPenerimaanLog } from "@/modules/dashboard/verification-penerimaan-log";
import { createPageSEO } from "@/utils/seo";

export default function VerificationPenerimaanLogDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description: "Manage verification approvals for Penerimaan Log inbound stock",
    path: "/dashboard/verification-penerimaan-log",
    title: "Verification Penerimaan Log",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <VerificationPenerimaanLog />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", [
      "common",
      "verification",
      "verification-penerimaan-log",
    ])),
  },
});
