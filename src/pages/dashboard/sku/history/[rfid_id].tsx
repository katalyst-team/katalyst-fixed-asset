import type { GetServerSideProps } from "next";

// Redirect old SKU history route to new EPC detail route
export default function DetailSKUProductHistory() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { params, locale } = context;
  const rfidId = params?.rfid_id as string;

  return {
    redirect: {
      destination: `/${locale}/dashboard/epc/${rfidId}`,
      permanent: true,
    },
  };
};
