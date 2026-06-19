'use client';

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import { useUser } from '@/context/user-context';
import useDeleteAttributeCollectionMutation from '@/hooks/api/attribute/collection/useDeleteAttributeCollectionMutation';
import useGetAttributeCollectionsQuery from '@/hooks/api/attribute/collection/useGetAttributeCollectionsQuery';
import useUpdateAttributeCollectionMutation from '@/hooks/api/attribute/collection/useUpdateAttributeCollectionMutation';
import { AttributeCollectionItemType } from '@/types/attributeCollection';

interface AttributeCollectionContextType {
  attributeCollections: AttributeCollectionItemType[];
  isLoading: boolean;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  storeId: string | undefined;
  setCurrentPage: (page: number) => void;
  setStoreId: (storeId: string | undefined) => void;

  updateAttributeCollection: (data: {
    attributeCollectionId: string;
    name: string;
    description?: string;
    organizationId: string;
    attribute_items?: { attribute_id: string; is_required: boolean }[];
  }) => Promise<void>;
  
  deleteAttributeCollection: (data: {
    attributeCollectionId: string;
    organizationId: string;
  }) => Promise<void>;
}

const AttributeCollectionContext = createContext<AttributeCollectionContextType | undefined>(undefined);

interface AttributeCollectionProviderProps {
  children: ReactNode;
  itemsPerPage?: number;
}

export const AttributeCollectionProvider: React.FC<AttributeCollectionProviderProps> = ({
  children,
  itemsPerPage = 5,
}) => {
  const { tokenPayload } = useUser();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [localItemsPerPage] = useState<number>(itemsPerPage);
  const [storeId, setStoreId] = useState<string | undefined>(undefined);

  const { data, isLoading, isSuccess } = useGetAttributeCollectionsQuery({
    organizationId: tokenPayload?.organization_id || '',
    store_id: storeId,
  });
  
  const [attributeCollections, setAttributeCollections] = useState<AttributeCollectionItemType[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);

  const { mutateAsync: updateAttributeCollectionData } = useUpdateAttributeCollectionMutation();
  const { mutateAsync: deleteAttributeCollectionData } = useDeleteAttributeCollectionMutation();

  useEffect(() => {
    if (isSuccess && data?.data.attribute_collections) {
      setTotalItems(data.data.attribute_collections.length);
      const startIndex = (currentPage - 1) * localItemsPerPage;
      const endIndex = startIndex + localItemsPerPage;
      const paginatedData = data.data.attribute_collections.slice(startIndex, endIndex);
      setAttributeCollections(paginatedData);
    }
  }, [data, currentPage, localItemsPerPage, isSuccess]);

  const updateAttributeCollection = async (data: {
    attributeCollectionId: string;
    name: string;
    description?: string;
    organizationId: string;
    attribute_items?: { attribute_id: string; is_required: boolean }[];
  }) => {
    const { attributeCollectionId, organizationId, ...payload } = data;
    await updateAttributeCollectionData({
      attributeCollectionId,
      organizationId,
      payload,
    });
  };

  const deleteAttributeCollection = async (data: {
    attributeCollectionId: string;
    organizationId: string;
  }) => {
    await deleteAttributeCollectionData(data);
  };

  const value: AttributeCollectionContextType = {
    attributeCollections,
    currentPage,
    deleteAttributeCollection,
    isLoading,
    itemsPerPage: localItemsPerPage,
    setCurrentPage,
    setStoreId,
    storeId,
    totalItems,
    updateAttributeCollection,
  };

  return (
    <AttributeCollectionContext.Provider value={value}>{children}</AttributeCollectionContext.Provider>
  );
};

export const useAttributeCollection = (): AttributeCollectionContextType => {
  const context = useContext(AttributeCollectionContext);
  if (!context) {
    throw new Error('useAttributeCollection must be used within a AttributeCollectionProvider');
  }
  return context;
};
