import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { FaLayout } from "@/modules/dashboard/fixed-assets/FaLayout";
import { FaPredictivePage } from "@/modules/dashboard/fixed-assets/FaPredictivePage";
import { createPageSEO } from "@/utils/seo";

export default function FaPredictiveRoute() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Fixed Assets", path: "/dashboard/fixed-assets/" }],
    description:
      "AI-powered failure prediction and remaining useful life (RUL) estimates for predictive maintenance.",
    path: "/dashboard/fixed-assets/predictive",
    title: "Predictive Analytics",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <FaLayout>
          <FaPredictivePage />
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
