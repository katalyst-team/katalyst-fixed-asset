"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "next-i18next";

import { Button } from "@/components/ui/button";

interface DetailInventoryHeaderProps {
  skuName: string;
}

const DetailInventoryHeader: React.FC<DetailInventoryHeaderProps> = ({
  skuName,
}) => {
  const { t } = useTranslation("detail-inventory");
  const router = useRouter();

  return (
    <div className="flex flex-col lg:flex-row w-full items-start lg:items-center justify-between gap-2">
      <div className="flex flex-row items-center gap-2">
        <Button size="icon" variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold font-heading">
          {t("summary.title")}: {skuName}
        </h1>
      </div>

      <div className="hidden lg:flex flex-col lg:flex-row gap-2">
        {/* <Button size={"sm"} variant={"outline"}>
          <FileText className="mr-2" /> {t("buttons.export")}
        </Button> */}
      </div>
    </div>
  );
};

export default DetailInventoryHeader;
