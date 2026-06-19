"use client";

import PackingModalAddPack from "./PackingModalAddPack";

const PackingHeader = () => {
  return (
    <div className="flex flex-col lg:flex-row items-center gap-2">
      <div className="flex gap-2">
        <PackingModalAddPack />
        {/* <Button size={"sm"} variant={"outline"}>
          <FileText className="mr-2 h-4 w-4" /> Export
        </Button> */}
      </div>
      {/* <div>
        <LedgerFilter />
      </div> */}
    </div>
  );
};

export default PackingHeader;
