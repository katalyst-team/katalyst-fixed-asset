"use client";

import { Button } from "@/components/ui/button";
import { InventorySectionItem } from "@/types/detailInventory";

import { useDetailInventory } from "./useDetailInventory";

interface DetailInventorySectionProps {
  section: InventorySectionItem;
  isActive: boolean;
}

const DetailInventorySection: React.FC<DetailInventorySectionProps> = ({
  section,
  isActive,
}) => {
  const { fetchSectionItems } = useDetailInventory();

  return (
    <Button
      className="p-4 h-auto flex flex-col items-start"
      variant={isActive ? "default" : "outline"}
      onClick={() => fetchSectionItems(section.id ?? "")}
    >
      <h3 className="text-lg font-medium">{section.name}</h3>
    </Button>
  );
};

export default DetailInventorySection;
