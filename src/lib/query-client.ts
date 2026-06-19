import { QueryClient } from "@tanstack/react-query";

let client: QueryClient | null = null;

export function getQueryClient(): QueryClient {
  if (!client) {
    client = new QueryClient();
  }
  return client;
}

export function invalidateUserCache(accountId?: string): void {
  const queryClient = getQueryClient();
  const queryKey = accountId ? ["user", accountId] : ["user"];
  queryClient.invalidateQueries({ queryKey });
}

export function setUserCache(data: unknown, accountId?: string): void {
  const queryClient = getQueryClient();
  const queryKey = accountId ? ["user", accountId] : ["user"];
  queryClient.setQueryData(queryKey, data);
}

export function clearUserCache(accountId?: string): void {
  const queryClient = getQueryClient();
  const queryKey = accountId ? ["user", accountId] : ["user"];
  queryClient.removeQueries({ queryKey });
}

export function resetUserCache(accountId?: string): void {
  const queryClient = getQueryClient();
  const queryKey = accountId ? ["user", accountId] : ["user"];
  queryClient.resetQueries({ queryKey });
}