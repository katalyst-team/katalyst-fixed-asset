import { LoaderCircle } from "lucide-react";
import { useTranslation } from "next-i18next";

export interface LoadingProps {
  text?: string;
  className?: string;
}

const Loading = ({ text, className }: LoadingProps) => {
  const { t } = useTranslation("common");
  const loadingText = text || t("loading");
  return (
    <div
      className={`flex w-full h-full items-center justify-center ${className || ""}`}
    >
      <div className="animate-in fade-in duration-500 flex flex-col items-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-accent" />
        <span className="text-sm text-muted-foreground mt-3">{loadingText}</span>
      </div>
    </div>
  );
};

export default Loading;
