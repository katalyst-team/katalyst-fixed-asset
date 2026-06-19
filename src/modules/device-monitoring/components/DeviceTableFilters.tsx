"use client";

import { useTranslation } from "next-i18next";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DeviceStatus, DeviceType } from "@/types/device-monitoring";

interface DeviceTableFiltersProps {
  filters: {
    deviceType?: DeviceType;
    status?: DeviceStatus;
    search?: string;
  };
  onFilterChange: (filters: {
    deviceType?: DeviceType;
    status?: DeviceStatus;
    search?: string;
  }) => void;
}

export const DeviceTableFilters = ({ filters, onFilterChange }: DeviceTableFiltersProps) => {
  const { t } = useTranslation("device-monitoring");
  const [searchValue, setSearchValue] = useState(filters.search ?? "");

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    onFilterChange({ ...filters, search: value });
  };

  const handleDeviceTypeChange = (value: string) => {
    const deviceType = value === "all" ? undefined : (value as DeviceType);
    onFilterChange({ ...filters, deviceType });
  };

  const handleStatusChange = (value: string) => {
    const status = value === "all" ? undefined : (value as DeviceStatus);
    onFilterChange({ ...filters, status });
  };

  return (
    <div className="mb-4 flex flex-col gap-4 md:flex-row">
      <div className="flex-1">
        <Input
          className="w-full"
          placeholder={t("filter.search")}
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>
      <Select
        value={filters.deviceType ?? "all"}
        onValueChange={handleDeviceTypeChange}
      >
        <SelectTrigger className="w-full md:w-48">
          <SelectValue placeholder={t("filter.all")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filter.all")}</SelectItem>
          <SelectItem value="GATE">{t("filter.gate")}</SelectItem>
          <SelectItem value="FIXED_READER">
            {t("filter.fixedReader")}
          </SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.status ?? "all"}
        onValueChange={handleStatusChange}
      >
        <SelectTrigger className="w-full md:w-48">
          <SelectValue placeholder={t("filter.all")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filter.all")}</SelectItem>
          <SelectItem value="ONLINE">{t("filter.online")}</SelectItem>
          <SelectItem value="OFFLINE">{t("filter.offline")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};