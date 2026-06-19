import { Inbox } from "lucide-react";
import { useTranslation } from "next-i18next";
import React from "react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  const { t } = useTranslation("common");

  const finalIcon = icon || <Inbox className="h-12 w-12 text-muted-foreground" />;
  const finalTitle = title || t("noItemsFound");
  const finalDescription = description || t("noItemsFoundDescription");

  return (
    <div
      className={`flex w-full h-full flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg bg-gradient-to-b from-card/80 to-muted/30 ${className}`}
    >
      <div className="rounded-full bg-accent/10 p-4 mb-2">
        {finalIcon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{finalTitle}</h3>
      <p className="text-sm text-muted-foreground max-w-sm text-center mb-5">{finalDescription}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
