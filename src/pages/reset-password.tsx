import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import GeneralLayout from "@/components/layouts/GeneralLayout";
import SEO from "@/components/SEO/SEO";
import { ResetPasswordPage } from "@/modules/auth/ResetPassword";
import { createPageSEO } from "@/utils/seo";

export default function ResetPassword() {
  const seo = createPageSEO({
    description:
      "Reset your Katalyst Inventory password and regain access to every warehouse workflow in a few secure steps.",
    path: "/reset-password",
    title: "Reset Password",
  });

  return (
    <>
      <SEO {...seo} noindex />
      <GeneralLayout>
        <ResetPasswordPage />
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
