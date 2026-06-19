import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import { LaminaGradePage } from "@/modules/dashboard/lamina-grade";

export default function LaminaGradeDashboard() {
  return (
    <DashboardLayout>
      <LaminaGradePage />
    </DashboardLayout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "category"])),
  },
});
