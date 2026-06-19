"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { useUser } from "@/context/user-context";
import useDeleteApiKeyDataMutation from "@/hooks/api/api-key/useDeleteApiKeyDataMutation";
import useEditApiKeyDataMutation from "@/hooks/api/api-key/useEditApiKeyDataMutation";
import useGetApiKeyDataQuery from "@/hooks/api/api-key/useGetApiKeyDataQuery";
import { ApiKeyFilterOptions, ApiKeyItemType } from "@/types/api-key";

interface ApiKeyContextType {
  apiKeyData: ApiKeyItemType[];
  filters: ApiKeyFilterOptions;
  setFilters: (filters: ApiKeyFilterOptions) => void;
  isLoading: boolean;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  setCurrentPage: (page: number) => void;

  editApiKey: (data: {
    keyID: string;
    status: "ACTIVE" | "INACTIVE";
    organizationID: string;
    accountOrganizationID: string;
  }) => Promise<void>;
  deleteApiKey: (data: {
    keyID: string;
    organizationID: string;
    accountOrganizationID: string;
  }) => Promise<void>;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

interface ApiKeyProviderProps {
  children: ReactNode;
  itemsPerPage?: number;
}

export const ApiKeyProvider: React.FC<ApiKeyProviderProps> = ({
  children,
  itemsPerPage = 5,
}) => {
  const { tokenPayload } = useUser();
  const [filters, setFilters] = useState<ApiKeyFilterOptions>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [localItemsPerPage] = useState<number>(itemsPerPage);

  const { data, isLoading, isSuccess } = useGetApiKeyDataQuery({
    accountOrganizationID: tokenPayload?.account_organization_role_id || "",
    organizationID: tokenPayload?.organization_id || "",
  });
  const [apiKeyData, setApiKeyData] = useState<ApiKeyItemType[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);

  const { mutateAsync: editApiKeyData } = useEditApiKeyDataMutation();
  const { mutateAsync: deleteApiKeyData } = useDeleteApiKeyDataMutation();

  useEffect(() => {
    if (isSuccess && data?.data.keys) {
      setTotalItems(data.data.keys.length);
      const startIndex = (currentPage - 1) * localItemsPerPage;
      const endIndex = startIndex + localItemsPerPage;
      const paginatedData = data.data.keys.slice(startIndex, endIndex);
      setApiKeyData(paginatedData);
    }
  }, [data, currentPage, localItemsPerPage, isSuccess]);

  const editApiKey = async (data: {
    keyID: string;
    status: "ACTIVE" | "INACTIVE";
    organizationID: string;
    accountOrganizationID: string;
  }) => {
    await editApiKeyData(data);
  };

  const deleteApiKey = async (data: {
    keyID: string;
    organizationID: string;
    accountOrganizationID: string;
  }) => {
    await deleteApiKeyData(data);
  };

  const value: ApiKeyContextType = {
    apiKeyData,
    currentPage,
    deleteApiKey,
    editApiKey,
    filters,
    isLoading,
    itemsPerPage: localItemsPerPage,
    setCurrentPage,
    setFilters,
    totalItems,
  };

  return (
    <ApiKeyContext.Provider value={value}>{children}</ApiKeyContext.Provider>
  );
};

export const useApiKey = (): ApiKeyContextType => {
  const context = useContext(ApiKeyContext);
  if (!context) {
    throw new Error("useApiKey must be used within an ApiKeyProvider");
  }
  return context;
};
