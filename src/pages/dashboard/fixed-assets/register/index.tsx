import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { FaRegisterPage } from "@/modules/dashboard/fixed-assets/FaRegisterPage";
import { createPageSEO } from "@/utils/seo";

export default function FaRegisterRoute() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Single source of truth for all registered assets. Search by name, EPC, S/N, custodian, or location.",
    path: "/dashboard/fixed-assets/register",
    title: "Asset Register",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <FaRegisterPage />
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
