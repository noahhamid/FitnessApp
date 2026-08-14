import { useCallback, useState } from "react";
import type { QueryClient, QueryKey } from "@tanstack/react-query";

/**
 * Pull-to-refresh state + handler. Pass an async function that invalidates /
 * refetches the screen's queries.
 */
export function usePullToRefresh(refresh: () => Promise<unknown>) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  return { refreshing, onRefresh };
}

/** Invalidate several query-key prefixes and wait for them to settle. */
export async function invalidateQueryPrefixes(
  qc: QueryClient,
  prefixes: QueryKey[],
): Promise<void> {
  await Promise.all(
    prefixes.map((queryKey) => qc.invalidateQueries({ queryKey })),
  );
}
