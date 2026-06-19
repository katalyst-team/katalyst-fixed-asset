export const formatSkuOptionLabel = (
  id: string | undefined,
  name: string
): string => {
  const trimmedId = id?.slice(0, 4) ?? "";
  if (trimmedId && name) {
    return `${trimmedId} - ${name}`;
  }

  return name || trimmedId;
};
