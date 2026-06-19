import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

interface UseUrlFilterSyncOptions<T> {
  fromQuery: (q: Record<string, string | string[] | undefined>) => Partial<T>;
  onInit: (filters: Partial<T>) => void;
  toQuery: (filters: T) => Record<string, string | string[] | undefined>;
}

export function useUrlFilterSync<T>({
  fromQuery,
  onInit,
  toQuery,
}: UseUrlFilterSyncOptions<T>) {
  const router = useRouter();
  const initialized = useRef(false);
  const onInitRef = useRef(onInit);
  onInitRef.current = onInit;

  useEffect(() => {
    if (!router.isReady || initialized.current) return;
    initialized.current = true;
    onInitRef.current(
      fromQuery(router.query as Record<string, string | string[] | undefined>),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  const syncToUrl = (filters: T) => {
    if (!router.isReady) return;
    router.replace(
      { pathname: router.pathname, query: toQuery(filters) },
      undefined,
      { shallow: true },
    );
  };

  return { syncToUrl };
}
