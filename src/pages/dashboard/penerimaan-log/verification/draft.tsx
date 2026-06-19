import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import DraftVerification from "@/modules/dashboard/penerimaan-log/verification/DraftVerification";
import { createPageSEO } from "@/utils/seo";

export default function DraftVerificationPage() {
  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "Penerimaan Log", path: "/dashboard/penerimaan-log" },
      { name: "Verifikasi Draft", path: "/dashboard/penerimaan-log/verification/draft" },
    ],
    description: "Verifikasi penerimaan log dengan status DRAFT",
    path: "/dashboard/penerimaan-log/verification/draft",
    title: "Verifikasi Draft - Penerimaan Log",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <DraftVerification />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", ["common", "penerimaan-log"])),
    },
  };
};
