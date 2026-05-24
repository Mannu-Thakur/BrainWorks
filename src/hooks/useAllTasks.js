import useSWR from 'swr';

import { APIs, fetcher } from '../utils.js';

export function useAllTasks() {
  const { data = [], mutate, isLoading } = useSWR(
    { url: APIs.AllTasks },
    fetcher
  );

  return { data, isLoading, refresh: () => mutate() };
}
