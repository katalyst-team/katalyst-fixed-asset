import { useTranslation } from "next-i18next";

import EmptyState from "@/components/shared/EmptyState";

const NotFound = () => {
  const { t } = useTranslation("common");

  return (
    <EmptyState
      description={t("notFound.description", "You don't have permission to access this page.")}
      title={t("notFound.title", "404 - Page Not Found")}
    />
  );
};

export default NotFound;
