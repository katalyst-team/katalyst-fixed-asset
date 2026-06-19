import { useTranslation } from "next-i18next";

import BadgeStatus, { StatusType } from "@/components/shared/BadgeStatus";
import { Badge } from "@/components/ui/badge";
import { convertToTitleCase } from "@/utils/text";

interface UseBadgeStatusOptions {
  translationNamespace?: string;
  extText?: string;
  fallbackVariant?: "destructive" | "secondary" | "default" | "outline";
  customFallbackLogic?: (
    status: string
  ) => "destructive" | "secondary" | "default" | "outline";
}

export const useBadgeStatus = (
  status: string,
  options: UseBadgeStatusOptions = {}
) => {
  const {
    translationNamespace = "common",
    extText,
    fallbackVariant = "outline",
    customFallbackLogic,
  } = options;

  const { t } = useTranslation(translationNamespace);

  // Supported BadgeStatus types
  const supportedStatuses: StatusType[] = [
    "WAITING_PRINT",
    "WAITING_INBOUND",
    "SUCCESS_INBOUND",
    "FAILED_INBOUND",
    "SUCCESS_OUTBOUND",
    "FAILED_OUTBOUND",
  ];

  const isStatusSupported = supportedStatuses.includes(status as StatusType);

  // Default fallback variant logic
  const getDefaultFallbackVariant = (
    status: string
  ): "destructive" | "secondary" | "default" | "outline" => {
    const statusKey = status.toLowerCase().replace(/[_\s]+/g, "");

    switch (statusKey) {
      case "failed":
      case "inboundfailed":
      case "outboundfailed":
      case "failedinbound":
      case "failedoutbound":
        return "destructive";
      case "success":
      case "inboundsuccess":
      case "outboundsuccess":
      case "successinbound":
      case "successoutbound":
        return "default";
      case "waiting":
      case "waitinginbound":
      case "waitingoutbound":
      case "waitingprint":
      case "pending":
        return "secondary";
      default:
        return fallbackVariant;
    }
  };

  const renderBadge = () => {
    if (isStatusSupported) {
      return <BadgeStatus extText={extText} status={status as StatusType} />;
    }

    // Use custom fallback logic if provided, otherwise use default
    const variant = customFallbackLogic
      ? customFallbackLogic(status)
      : getDefaultFallbackVariant(status);

    return (
      <Badge variant={variant}>
        {t(
          `status.${status.toLowerCase().replace(/_/g, "")}`,
          convertToTitleCase(status)
        )}
        {extText && ` ${extText}`}
      </Badge>
    );
  };

  return {
    BadgeComponent: renderBadge(),
    isStatusSupported,
    renderBadge,
  };
};
