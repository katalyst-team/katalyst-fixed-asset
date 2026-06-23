import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { FaCheckOutPage } from "@/modules/dashboard/fixed-assets/FaCheckOutPage";
import { FaLayout } from "@/modules/dashboard/fixed-assets/FaLayout";
import { createPageSEO } from "@/utils/seo";

export default function FaCheckOutRoute() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description: "Asset loans — check out, track, and return assets to custodians.",
    path: "/dashboard/fixed-assets/check-out",
    title: "Check-Out · Asset Loans",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <FaLayout>
          <FaCheckOutPage />
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
