import useSWR from 'swr';

import { APIs, fetcher, putter } from '../utils.js';

export function useSettings() {
  const { data = { themeMode: 'dark' }, mutate } = useSWR(
    { url: APIs.Settings },
    fetcher
  );

  return {
    data,
    async setSetting(key, value) {
      await mutate(
        await putter({ url: APIs.Settings, key, value }),
        {
          optimisticData: old => ({ ...old, [key]: value }),
          populateCache: false,
        }
      );
    },
  };
}
