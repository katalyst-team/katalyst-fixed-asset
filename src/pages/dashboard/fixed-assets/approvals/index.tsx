import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { FaApprovalsPage } from "@/modules/dashboard/fixed-assets/FaApprovalsPage";
import { FaLayout } from "@/modules/dashboard/fixed-assets/FaLayout";
import { createPageSEO } from "@/utils/seo";

export default function FaApprovalsRoute() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Fixed Assets", path: "/dashboard/fixed-assets/" }],
    description:
      "Multi-step approval workflows for disposals, transfers, acquisitions, and major asset changes.",
    path: "/dashboard/fixed-assets/approvals",
    title: "Approval Center",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <FaLayout>
          <FaApprovalsPage />
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
