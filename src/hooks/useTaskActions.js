import { useCallback } from 'react';
import { useSWRConfig } from 'swr';

import { APIs, putter } from '../utils.js';

export function useTaskActions() {
  const { mutate } = useSWRConfig();

  const refreshAll = useCallback(() => {
    void mutate(key => key?.url === APIs.AllTasks || key?.url === APIs.TodoLists);
    void mutate(
      key => key?.url === APIs.TodoList,
      undefined,
      { revalidate: true }
    );
  }, [mutate]);

  const updateTask = useCallback(
    async (itemId, patch) => {
      await putter({ url: APIs.TodoListUpdate, id: itemId, ...patch });
      refreshAll();
    },
    [refreshAll]
  );

  const deleteTask = useCallback(
    async itemId => {
      await putter({ url: APIs.TodoListDelete, id: itemId });
      refreshAll();
    },
    [refreshAll]
  );

  const toggleTask = useCallback(
    async (itemId, checked) => {
      await putter({ url: APIs.TodoListUpdate, id: itemId, checked: !checked });
      refreshAll();
    },
    [refreshAll]
  );

  return { updateTask, deleteTask, toggleTask, refreshAll };
}
