import { useQuery } from "@tanstack/react-query";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { syncCookiesFromStorage } from "@/lib/authTokens";
import { decodeToken, type Store, type TokenPayload } from "@/lib/jwt";
import {
  invalidateUserCache,
} from "@/lib/query-client";
import {
  GetAccountsResponse,
  getAccountsService,
} from "@/services/auth/getAccountsService";

interface UserContextType {
  user: GetAccountsResponse | null;
  token: string | null;
  tokenPayload: TokenPayload | null;
  isLoading: boolean;
  error: Error | null;
  selectedTeam: string;
  setSelectedTeam: (team: string) => void;
  stores: Store[];
  hasMultipleStores: boolean;
}

const UserContext = createContext<UserContextType>({
  error: null,
  hasMultipleStores: false,
  isLoading: true,
  selectedTeam: "",
  setSelectedTeam: () => {},
  stores: [],
  token: null,
  tokenPayload: null,
  user: null,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [tokenPayload, setTokenPayload] = useState<TokenPayload | null>(null);
  const [selectedTeam, setSelectedTeamState] = useState<string>("");

  // Initialize token from cookie on client side
  useEffect(() => {
    if (!getCookie("token") && typeof window !== "undefined") {
      syncCookiesFromStorage();
    }

    // Try getCookie first
    let tokenFromCookie = getCookie("token")?.toString();

    // Fallback: Parse document.cookie if getCookie doesn't work
    if (!tokenFromCookie && typeof document !== "undefined") {
      const cookies = document.cookie.split(";");
      const tokenCookie = cookies.find((c) => c.trim().startsWith("token="));
      if (tokenCookie) {
        tokenFromCookie = tokenCookie.split("=")[1];
      }
    }

    if (tokenFromCookie) {
      setToken(tokenFromCookie);
      try {
        const decoded = decodeToken(tokenFromCookie);
        setTokenPayload(decoded);
      } catch (error) {
        console.error("Failed to decode token:", error);
        setTokenPayload(null);
      }
    } else {
      setToken(null);
      setTokenPayload(null);
    }
  }, []);

  // Enhanced setSelectedTeam that automatically persists to localStorage
  const setSelectedTeam = useCallback((team: string) => {
    setSelectedTeamState(team);
    localStorage.setItem("selectedStoreId", team);
  }, []);

  useEffect(() => {
    // intentionally empty - no-op kept for future auth redirect logic
  }, [tokenPayload, router]);

  const {
    data: userResponse,
    isLoading,
    error,
  } = useQuery({
    enabled: Boolean(tokenPayload?.account_id),
    queryFn: () => {
      if (!tokenPayload?.account_id) {
        throw new Error("No account ID found");
      }
      return getAccountsService();
    },
    queryKey: ["user", tokenPayload?.account_id],
    refetchInterval: 5 * 60 * 1000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    staleTime: 60 * 1000,
  });

  const stores: Store[] = userResponse?.data?.stores ?? [];
  const hasMultipleStores = stores.length > 1;

  useEffect(() => {
    if (stores.length === 0) return;

    const persistedStoreId = localStorage.getItem("selectedStoreId");

    if (stores.length === 1) {
      // Always select the single store
      setSelectedTeamState(stores[0].id);
      localStorage.setItem("selectedStoreId", stores[0].id);
      return;
    }

    // Multiple stores: try persisted value
    const persistedStore =
      persistedStoreId === "0"
        ? { id: "0" }
        : stores.find((store) => store.id === persistedStoreId);

    if (persistedStore) {
      setSelectedTeamState(persistedStore.id);
    } else {
      setSelectedTeam("0");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userResponse]);

  return (
    <UserContext.Provider
      value={{
        error,
        hasMultipleStores,
        isLoading,
        selectedTeam,
        setSelectedTeam,
        stores,
        token,
        tokenPayload,
        user: userResponse || null,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

export function useInvalidateUser(): () => void {
  const { tokenPayload } = useUser();
  return useCallback(() => {
    if (tokenPayload?.account_id) {
      invalidateUserCache(tokenPayload.account_id);
    }
  }, [tokenPayload?.account_id]);
}
