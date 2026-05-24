import useSWR from 'swr';

import { APIs, fetcher, putter } from '../utils.js';

export function useNotifications() {
  const { data = [], mutate } = useSWR({ url: APIs.Notifications }, fetcher, {
    refreshInterval: 30000,
  });

  const unreadCount = data.filter(n => !n.read).length;

  return {
    data,
    unreadCount,
    async markRead(id) {
      await mutate(
        await putter({ url: APIs.NotificationsMarkRead, id }),
        {
          optimisticData: old =>
            old.map(n => (n.id === id ? { ...n, read: true } : n)),
          populateCache: false,
        }
      );
    },
    async markAllRead() {
      await mutate(
        await putter({ url: APIs.NotificationsMarkRead, all: true }),
        {
          optimisticData: old => old.map(n => ({ ...n, read: true })),
          populateCache: false,
        }
      );
    },
    async clearAll() {
      await mutate(await putter({ url: APIs.NotificationsClear }), {
        optimisticData: () => [],
        populateCache: false,
      });
    },
    refresh: () => mutate(),
  };
}
