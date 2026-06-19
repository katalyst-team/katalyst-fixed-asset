"use client";

"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { useUser } from "@/context/user-context";
import useDeleteStoreDataMutation from "@/hooks/api/store/useDeleteStoreDataMutation";
import useEditStoreDataMutation from "@/hooks/api/store/useEditStoreDataMutation";
import useGetStoreDataQuery from "@/hooks/api/store/useGetStoreDataQuery";
import { StoreFilterOptions, StoreItemType } from "@/types/store";

interface StoreContextType {
  storeData: StoreItemType[];
  filters: StoreFilterOptions;
  setFilters: (filters: StoreFilterOptions) => void;
  isLoading: boolean;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  setCurrentPage: (page: number) => void;

  editStore: (data: {
    storeID: string;
    name: string;
    status: string;
    organizationID: string;
    address: string;
  }) => Promise<void>;
  deleteStore: (data: {
    storeID: string;
    organizationID: string;
  }) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

interface StoreProviderProps {
  children: ReactNode;
  itemsPerPage?: number;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({
  children,
  itemsPerPage = 5,
}) => {
  const { tokenPayload } = useUser();
  const [filters, setFilters] = useState<StoreFilterOptions>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [localItemsPerPage] = useState<number>(itemsPerPage);

  const { data, isLoading, isSuccess } = useGetStoreDataQuery({
    organizationId: tokenPayload?.organization_id || "",
  });
  const [storeData, setStoreData] = useState<StoreItemType[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);

  const { mutateAsync: editStoreData } = useEditStoreDataMutation();
  const { mutateAsync: deleteStoreData } = useDeleteStoreDataMutation();

  useEffect(() => {
    if (isSuccess && data?.data.stores) {
      setTotalItems(data.data.stores.length);
      const startIndex = (currentPage - 1) * localItemsPerPage;
      const endIndex = startIndex + localItemsPerPage;
      const paginatedData = data.data.stores.slice(startIndex, endIndex);
      setStoreData(paginatedData);
    }
  }, [data, currentPage, localItemsPerPage, isSuccess]);

  const editStore = async (data: {
    storeID: string;
    name: string;
    status: string;
    organizationID: string;
    address: string;
  }) => {
    await editStoreData(data);
  };

  const deleteStore = async (data: {
    storeID: string;
    organizationID: string;
  }) => {
    await deleteStoreData(data);
  };

  const value: StoreContextType = {
    currentPage,
    deleteStore,
    editStore,
    filters,
    isLoading,
    itemsPerPage: localItemsPerPage,
    setCurrentPage,
    setFilters,
    storeData,
    totalItems,
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};
