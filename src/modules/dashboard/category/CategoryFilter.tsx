"use client";

import { Filter } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CategoryFilterOptions } from "@/types/category";

interface CategoryFilterProps {
  onApply: (filters: CategoryFilterOptions) => void;
}

const categories = [
  { label: "Category A", value: "category-a" },
  { label: "Category B", value: "category-b" },
  { label: "Category C", value: "category-c" },
  { label: "Category D", value: "category-d" },
  { label: "Category E", value: "category-e" },
];

const subcategories = [
  { label: "Sub Category A", value: "subcategory-a" },
  { label: "Sub Category B", value: "subcategory-b" },
  { label: "Sub Category C", value: "subcategory-c" },
];

const CategoryFilter: React.FC<CategoryFilterProps> = ({ onApply }) => {
  const [categoryName, setCategoryName] = React.useState("");
  const [subcategoryName, setSubcategoryName] = React.useState("");
  const [categoryParent, setCategoryParent] = React.useState<
    string | undefined
  >(undefined);
  const [subCategory, setSubCategory] = React.useState<string | undefined>(
    undefined
  );

  const handleApply = () => {
    const filters: CategoryFilterOptions = {
      categoryName,
      categoryParent,
      subCategory,
      subcategoryName,
    };
    onApply(filters);
  };

  const handleCancel = () => {
    setCategoryName("");
    setSubcategoryName("");
    setCategoryParent(undefined);
    setSubCategory(undefined);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline">
          <Filter className="mr-2 h-4 w-4" /> Filter
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[400px] p-4">
        <div className="space-y-4">
          <h2 className="border-b border-border pb-3 mb-3 font-semibold text-sm">Filter</h2>

          <div className="border-b border-border/50 pb-3 mb-3 space-y-2">
            <label className="text-sm font-medium">Category Name</label>
            <Input
              placeholder="Category Name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
          </div>

          <div className="border-b border-border/50 pb-3 mb-3 space-y-2">
            <label className="text-sm font-medium">Sub Category Name</label>
            <Input
              placeholder="Sub Category Name"
              value={subcategoryName}
              onChange={(e) => setSubcategoryName(e.target.value)}
            />
          </div>

          <div className="border-b border-border/50 pb-3 mb-3">
            <Combobox
              label="Category Parent"
              options={categories}
              placeholder="Select Category"
              onSelect={setCategoryParent}
            />
          </div>

          <Combobox
            label="Sub Category"
            options={subcategories}
            placeholder="Select Sub Category"
            onSelect={setSubCategory}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="default" onClick={handleApply}>Apply</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CategoryFilter;
