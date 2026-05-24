import useSWR from 'swr';

import { APIs, fetcher, putter } from '../utils.js';

export function useTodoList(currentList) {
  const { data, mutate, isLoading } = useSWR(
    () => currentList && { url: APIs.TodoList, id: currentList },
    fetcher
  );

  const updateItemOptimistic = (itemId, patch, oldData) => {
    const idx = oldData.items.findIndex(({ id }) => id === itemId);
    if (idx === -1) return oldData;
    const items = [...oldData.items];
    items[idx] = { ...items[idx], ...patch };
    return { ...oldData, items };
  };

  return {
    data,
    isLoading,
    async newItem(fields) {
      const name = typeof fields === 'string' ? fields : fields.name;
      const extras = typeof fields === 'string' ? {} : fields;
      const tempId = crypto.randomUUID();
      const newItem = {
        name,
        checked: false,
        id: tempId,
        priority: extras.priority ?? 0,
        dueDate: extras.dueDate ?? null,
        notes: extras.notes ?? '',
        tags: extras.tags ?? [],
        subtasks: extras.subtasks ?? [],
        starred: extras.starred ?? false,
        sortOrder: data?.items?.length ?? 0,
      };
      return mutate(
        await putter({ url: APIs.TodoList, id: currentList, name, ...extras }),
        {
          populateCache: false,
          optimisticData: oldData => ({
            ...oldData,
            items: [...(oldData?.items ?? []), newItem],
          }),
        }
      );
    },
    async deleteItem(itemToDelete) {
      return mutate(
        await putter({ url: APIs.TodoListDelete, id: itemToDelete }),
        {
          populateCache: false,
          optimisticData: oldData => ({
            ...oldData,
            items: oldData.items.filter(({ id }) => id !== itemToDelete),
          }),
        }
      );
    },
    async deleteCompleted() {
      const completedIds = data?.items?.filter(i => i.checked).map(i => i.id) ?? [];
      if (!completedIds.length) return;
      return mutate(
        await putter({ url: APIs.TodoListBulkDelete, ids: completedIds }),
        {
          populateCache: false,
          optimisticData: oldData => ({
            ...oldData,
            items: oldData.items.filter(({ id }) => !completedIds.includes(id)),
          }),
        }
      );
    },
    async toggleChecked(itemToToggle) {
      const item = data?.items?.find(({ id }) => id === itemToToggle);
      if (!item) return;
      return mutate(
        await putter({
          url: APIs.TodoListUpdate,
          id: itemToToggle,
          checked: !item.checked,
        }),
        {
          populateCache: false,
          optimisticData: oldData =>
            updateItemOptimistic(itemToToggle, { checked: !item.checked }, oldData),
        }
      );
    },
    async updateItem(itemId, patch) {
      const payload =
        typeof patch === 'string' ? { name: patch } : patch;
      return mutate(
        await putter({ url: APIs.TodoListUpdate, id: itemId, ...payload }),
        {
          populateCache: false,
          optimisticData: oldData => updateItemOptimistic(itemId, payload, oldData),
        }
      );
    },
    async reorderItems(items) {
      const orderPayload = items.map((item, index) => ({
        id: item.id,
        sortOrder: index,
      }));
      return mutate(
        await putter({
          url: APIs.TodoListReorder,
          items: orderPayload,
        }),
        {
          populateCache: false,
          optimisticData: oldData => ({ ...oldData, items }),
        }
      );
    },
    refresh: () => mutate(),
  };
}
