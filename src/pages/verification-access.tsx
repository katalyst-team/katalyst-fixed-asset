import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import GeneralLayout from "@/components/layouts/GeneralLayout";
import SEO from "@/components/SEO/SEO";
import { VerificationAccessPage } from "@/modules/auth/VerificationAccess";
import { createPageSEO } from "@/utils/seo";

export default function VerificationAccess() {
  const seo = createPageSEO({
    description:
      "Verify your Katalyst account to enable secure access to every inventory workflow and RFID reporting screen.",
    path: "/verification-access",
    title: "Account Verification",
  });

  return (
    <>
      <SEO {...seo} noindex />
      <GeneralLayout>
        <VerificationAccessPage />
      </GeneralLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", ["common", "auth"])),
    },
  };
};
