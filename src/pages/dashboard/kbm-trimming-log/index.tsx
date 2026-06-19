import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import { TrimmingLogPage } from "@/modules/dashboard/trimming-log";

export default function KbmTrimmingLogDashboard() {
  return (
    <DashboardLayout>
      <TrimmingLogPage hideSlugField slug="kbm-trimming-log" />
    </DashboardLayout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "reference"])),
  },
});