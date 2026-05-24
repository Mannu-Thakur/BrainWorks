import useSWR from 'swr';

import { APIs, fetcher, putter } from '../utils.js';

export function useTodoLists() {
  const { data = [], mutate, isLoading } = useSWR({ url: APIs.TodoLists }, fetcher);

  return {
    data,
    isLoading,
    async newList(newListName, icon, color) {
      return mutate(
        await putter({
          url: APIs.TodoLists,
          icon: icon || 'List',
          name: newListName,
          color,
        }),
        {
          populateCache: false,
          optimisticData: oldData => [
            ...oldData,
            {
              name: newListName,
              icon: icon || 'List',
              color: color || '#6366f1',
              sortOrder: oldData.length,
            },
          ],
        }
      );
    },
    async updateList(listId, patch) {
      await mutate(
        await putter({ url: APIs.TodoListsUpdate, id: listId, ...patch }),
        {
          populateCache: false,
          optimisticData: oldData =>
            oldData.map(d => (d.id === listId ? { ...d, ...patch } : d)),
        }
      );
    },
    async deleteList(listId) {
      await mutate(await putter({ url: APIs.TodoListsDelete, id: listId }), {
        populateCache: false,
        optimisticData: oldData => oldData.filter(d => d.id !== listId),
      });
    },
    refresh: () => mutate(),
  };
}
