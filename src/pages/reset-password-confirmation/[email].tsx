import type { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import GeneralLayout from "@/components/layouts/GeneralLayout";
import SEO from "@/components/SEO/SEO";
import { ResetPasswordOTPPage } from "@/modules/auth/ResetPasswordOTP";
import { createPageSEO } from "@/utils/seo";

export default function ResetPasswordConfirmation() {
  const seo = createPageSEO({
    description:
      "Enter the verification code sent to your inbox to finish resetting your Katalyst Inventory password.",
    path: "/reset-password-confirmation/[email]",
    title: "Password Reset Confirmation",
  });

  return (
    <>
      <SEO {...seo} noindex />
      <GeneralLayout>
        <ResetPasswordOTPPage />
      </GeneralLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { locale } = context;

  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", ["common", "auth"])),
    },
  };
};
