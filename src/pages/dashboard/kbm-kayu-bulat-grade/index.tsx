import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import { KayuBulatGradePage } from "@/modules/dashboard/kayu-bulat-grade";

export default function KbmKayuBulatGradeDashboard() {
  return (
    <DashboardLayout>
      <KayuBulatGradePage />
    </DashboardLayout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "category"])),
  },
});