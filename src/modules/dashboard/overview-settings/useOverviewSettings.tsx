"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

import { useUser } from "@/context/user-context";
import useGetOrganizationSettingsQuery from "@/hooks/api/organization/useGetOrganizationSettingsQuery";
import useUpdateOrganizationSettingsMutation from "@/hooks/api/organization/useUpdateOrganizationSettingsMutation";
import { OrganizationSettings } from "@/services/organization";

interface OverviewSettingsContextType {
  settings: OrganizationSettings;
  localSettings: OrganizationSettings;
  setLocalSettings: React.Dispatch<React.SetStateAction<OrganizationSettings>>;
  isLoading: boolean;
  isSaving: boolean;
  hasChanges: boolean;
  handleSave: () => void;
  handleReset: () => void;
  updateLocalSetting: <K extends keyof OrganizationSettings>(
    key: K,
    value: OrganizationSettings[K],
  ) => void;
}

const OverviewSettingsContext = createContext<OverviewSettingsContextType | null>(null);

export const useOverviewSettings = () => {
  const context = useContext(OverviewSettingsContext);
  if (!context) {
    throw new Error("useOverviewSettings must be used within an OverviewSettingsProvider");
  }
  return context;
};

interface OverviewSettingsProviderProps {
  children: React.ReactNode;
}

const DEFAULT_SETTINGS: OrganizationSettings = {
  aging_stock_days: 90,
  critical_stock_threshold: 10,
  inventory_accuracy_target: 95,
  low_stock_threshold: 20,
  overstock_threshold: 80,
};

export const OverviewSettingsProvider: React.FC<OverviewSettingsProviderProps> = ({
  children,
}) => {
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const { data: settings, isLoading } = useGetOrganizationSettingsQuery({ organizationId });

  const mergedSettings = useMemo(
    () => ({ ...DEFAULT_SETTINGS, ...settings }),
    [settings],
  );

  const [localSettings, setLocalSettings] = useState<OrganizationSettings>(mergedSettings);

  React.useEffect(() => {
    if (!isLoading && settings) {
      setLocalSettings({ ...DEFAULT_SETTINGS, ...settings });
    }
  }, [isLoading, settings]);

  const updateMutation = useUpdateOrganizationSettingsMutation({ organizationId });

  const hasChanges = useMemo(() => {
    return JSON.stringify(localSettings) !== JSON.stringify(mergedSettings);
  }, [localSettings, mergedSettings]);

  const handleSave = useCallback(() => {
    updateMutation.mutate(localSettings);
  }, [updateMutation, localSettings]);

  const handleReset = useCallback(() => {
    setLocalSettings({ ...mergedSettings });
  }, [mergedSettings]);

  const updateLocalSetting = useCallback(
    <K extends keyof OrganizationSettings>(key: K, value: OrganizationSettings[K]) => {
      setLocalSettings((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const value = useMemo<OverviewSettingsContextType>(
    () => ({
      handleReset,
      handleSave,
      hasChanges,
      isLoading,
      isSaving: updateMutation.isPending,
      localSettings,
      setLocalSettings,
      settings: mergedSettings,
      updateLocalSetting,
    }),
    [
      handleReset,
      handleSave,
      hasChanges,
      isLoading,
      localSettings,
      mergedSettings,
      updateLocalSetting,
      updateMutation.isPending,
    ],
  );

  return (
    <OverviewSettingsContext.Provider value={value}>
      {children}
    </OverviewSettingsContext.Provider>
  );
};
