import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { EmployeePage } from "@/modules/dashboard/employee";
import { createPageSEO } from "@/utils/seo";

export default function EmployeeDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Invite teammates, assign roles, and control who can access each inventory workflow.",
    path: "/dashboard/employee",
    title: "Employee Management",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <EmployeePage />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", ["common", "employee"])),
    },
  };
};
