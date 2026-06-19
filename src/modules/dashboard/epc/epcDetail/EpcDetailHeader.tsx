"use client";

// eslint-disable-next-line simple-import-sort/imports
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

interface EpcDetailHeaderProps {
  epcCode: string;
}

const EpcDetailHeader: React.FC<EpcDetailHeaderProps> = ({ epcCode }) => {
  const { t } = useTranslation(["epc"]);
  const router = useRouter();

  return (
    <div className="flex flex-col lg:flex-row w-full justify-between">
      <div className="flex flex-row items-center gap-2">
        <Button size="icon" variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-bold font-heading">
          {t("detail.title")}: {epcCode}
        </h1>
      </div>

      <div className="hidden lg:flex flex-col lg:flex-row gap-2">
        {/* Future: Add export functionality */}
        {/* <Button size={"sm"} variant={"outline"}>
          <FileText className="mr-2" /> {t("buttons.export")}
        </Button> */}
      </div>
    </div>
  );
};

export default EpcDetailHeader;
