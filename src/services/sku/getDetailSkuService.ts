// ... Impor dari semua types lain
import { DetailSkuFilterOptions, DetailSkuItemType } from "@/types/detailSku";

// ... Semua Dummy Data lainnya

const DUMMY_DETAIL_SKU_DATA: DetailSkuItemType[] = [
  {
    epc: "ASDASDASD",
    lastStatus: "Inbound Failed",
    lastUpdate: "23-04-2024:11-04-00",
    no: "0001",
  },
  {
    epc: "ZXCVZXCV",
    lastStatus: "Inbound Success",
    lastUpdate: "24-04-2024:14-22-00",
    no: "0002",
  },
  {
    epc: "QWERQWER",
    lastStatus: "Waiting Print",
    lastUpdate: "25-04-2024:09-15-00",
    no: "0003",
  },
  {
    epc: "UIOPUIOP",
    lastStatus: "Waiting Inbound",
    lastUpdate: "26-04-2024:16-58-00",
    no: "0004",
  },
];

export const getDetailSkuDataService = async (
  filters?: DetailSkuFilterOptions
): Promise<DetailSkuItemType[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredData = [...DUMMY_DETAIL_SKU_DATA];

      if (filters) {
        filteredData = filteredData.filter((item) => {
          if (
            filters.epc &&
            !item.epc.toLowerCase().includes(filters.epc.toLowerCase())
          )
            return false;
          if (filters.lastStatus && item.lastStatus !== filters.lastStatus)
            return false;
          return true;
        });
      }

      resolve(filteredData);
    }, 200);
  });
};
