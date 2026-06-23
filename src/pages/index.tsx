import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import GeneralLayout from "@/components/layouts/GeneralLayout";
import SEO from "@/components/SEO/SEO";
import { SignInPage } from "@/modules/auth/SignIn";
import { createPageSEO } from "@/utils/seo";

export default function Home() {
  const seo = createPageSEO({
    description:
      "Sign in to monitor RFID activity, keep assets accurate, and manage every warehouse workflow from one secure dashboard.",
    path: "/",
    title: "Fixed Asset Sign In",
  });

  return (
    <>
      <SEO {...seo} />
      <GeneralLayout>
        <SignInPage />
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
