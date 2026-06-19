import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import GeneralLayout from "@/components/layouts/GeneralLayout";
import SEO from "@/components/SEO/SEO";
import { SignUpPage } from "@/modules/auth/SignUp";
import { createPageSEO } from "@/utils/seo";

export default function SignUp() {
  const seo = createPageSEO({
    description:
      "Create your Katalyst Inventory account and unlock RFID-powered tracking, automated workflows, and real-time stock visibility.",
    path: "/sign-up",
    title: "Create Account",
  });

  return (
    <>
      <SEO {...seo} />
      <GeneralLayout>
        <SignUpPage />
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
