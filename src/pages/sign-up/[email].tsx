import type { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import GeneralLayout from "@/components/layouts/GeneralLayout";
import SEO from "@/components/SEO/SEO";
import { VerificationEmailPage } from "@/modules/auth/VericationEmail";
import { createPageSEO } from "@/utils/seo";

export default function SignUp() {
  const seo = createPageSEO({
    description:
      "Confirm your email to finish creating a Katalyst Inventory account and start using RFID-powered workflows.",
    path: "/sign-up/[email]",
    title: "Email Verification",
  });

  return (
    <>
      <SEO {...seo} noindex />
      <GeneralLayout>
        <VerificationEmailPage />
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
