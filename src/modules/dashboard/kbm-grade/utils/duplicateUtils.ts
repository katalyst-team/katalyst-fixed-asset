import { getSkuDataService } from "@/services/sku/getSkuDataService";
import { SkuItemType } from "@/types/sku";

import { KbmGradeType } from "../KbmGradeConfigContext";

const DEFAULT_DUPLICATE_CHECK_LIMIT = 1000;

const normalizeName = (name: string): string => name.trim().toLowerCase();

interface DuplicateCheckParams {
  categoryId: string;
  gradeType: KbmGradeType;
  gTypeAttributeId: string;
  name: string;
  organizationId: string;
  excludeSkuId?: string;
  limit?: number;
}

export const isDuplicateKbmGradeName = async ({
  categoryId,
  gradeType,
  gTypeAttributeId,
  name,
  organizationId,
  excludeSkuId,
  limit = DEFAULT_DUPLICATE_CHECK_LIMIT,
}: DuplicateCheckParams): Promise<boolean> => {
  if (!name.trim()) return false;
  if (!organizationId || !categoryId || !gTypeAttributeId) return false;

  const queryAttributes = JSON.stringify({ [gTypeAttributeId]: [gradeType] });
  const response = await getSkuDataService({
    filters: {
      category_ids: [categoryId],
      limit,
      query: name,
      query_attributes: queryAttributes,
    },
    organizationId,
  });

  const skus = (response?.data?.skus ?? []) as SkuItemType[];
  const normalized = normalizeName(name);

  return skus.some((sku) => {
    if (excludeSkuId && sku.id === excludeSkuId) return false;
    return normalizeName(sku.name) === normalized;
  });
};

export const normalizeKbmGradeName = (name: string): string =>
  normalizeName(name);
