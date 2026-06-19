import { useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { useUser } from "@/context/user-context";
import { KEY_USE_GET_USER_PREFERENCES } from "@/hooks/api/user/useUserPreferencesQuery";
import type { UserPreferencesType } from "@/types/user-preferences";

interface UserPreferencesContextType {
  preferences: UserPreferencesType | null;
  isLoading: boolean;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setColorTheme: (colorTheme: "blue" | "green" | "indigo" | "slate" | "purple") => void;
  setDensity: (density: "comfortable" | "compact") => void;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

const DEFAULT_PREFERENCES: UserPreferencesType = {
  color_theme: "blue",
  density: "comfortable",
  dismissed_alerts: [],
  theme: "system",
};

export function UserPreferencesProvider({ children }: { children: React.ReactNode }) {
  const { tokenPayload } = useUser();
  const userId = tokenPayload?.account_id ?? "";
  const queryClient = useQueryClient();

  const [preferences, setPreferencesState] = useState<UserPreferencesType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchPreferences = async () => {
      try {
        const data = await queryClient.fetchQuery({
          queryFn: async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/v1/users/${userId}/preferences`, {
              headers: {
                Authorization: `Bearer ${tokenPayload}`,
                "Content-Type": "application/json",
              },
            });
            return response.json();
          },
          queryKey: KEY_USE_GET_USER_PREFERENCES(userId),
        });

        if (data?.data) {
          setPreferencesState(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch user preferences:", error);
        setPreferencesState(DEFAULT_PREFERENCES);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, [userId, tokenPayload, queryClient]);

  const updatePreferences = useCallback(async (updates: Partial<UserPreferencesType>) => {
    if (!userId) return;

    const newPreferences: UserPreferencesType = { ...DEFAULT_PREFERENCES, ...preferences, ...updates } as UserPreferencesType;
    setPreferencesState(newPreferences);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/v1/users/${userId}/preferences`, {
        body: JSON.stringify(updates),
        headers: {
          Authorization: `Bearer ${tokenPayload}`,
          "Content-Type": "application/json",
        },
        method: "PATCH",
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: KEY_USE_GET_USER_PREFERENCES(userId) });
      }
    } catch (error) {
      console.error("Failed to update user preferences:", error);
      setPreferencesState(preferences);
    }
  }, [userId, preferences, tokenPayload, queryClient]);

  const setTheme = useCallback((theme: "light" | "dark" | "system") => {
    updatePreferences({ theme });
  }, [updatePreferences]);

  const setColorTheme = useCallback((colorTheme: "blue" | "green" | "indigo" | "slate" | "purple") => {
    updatePreferences({ color_theme: colorTheme });
  }, [updatePreferences]);

  const setDensity = useCallback((density: "comfortable" | "compact") => {
    updatePreferences({ density });
  }, [updatePreferences]);

  const value = useMemo(
    () => ({
      isLoading,
      preferences,
      setColorTheme,
      setDensity,
      setTheme,
    }),
    [preferences, isLoading, setColorTheme, setDensity, setTheme],
  );

  return (
    <UserPreferencesContext.Provider value={value}>{children}</UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error("useUserPreferences must be used within a UserPreferencesProvider");
  }
  return context;
}
