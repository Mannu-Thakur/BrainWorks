import { useCallback } from 'react';
import { useSWRConfig } from 'swr';

import { useToast } from '../providers/NotificationProvider.jsx';
import { onTaskCompleted } from '../services/taskCompletionService.js';
import { APIs, putter } from '../utils.js';
import { useSettings } from './useSettings.js';

export function useTaskActions() {
  const { mutate } = useSWRConfig();
  const { data: settings } = useSettings();
  const { showToast } = useToast();

  const refreshAll = useCallback(() => {
    void mutate(
      key => key?.url === APIs.AllTasks || key?.url === APIs.TodoLists
    );
    void mutate(key => key?.url === APIs.TodoList, undefined, {
      revalidate: true,
    });
    void mutate(key => key?.url === APIs.Settings, undefined, {
      revalidate: true,
    });
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
    async task => {
      const newChecked = !task.checked;
      await putter({
        url: APIs.TodoListUpdate,
        id: task.id,
        checked: newChecked,
      });
      if (newChecked) {
        await onTaskCompleted(
          { ...task, checked: true },
          settings,
          settings.streakData
        );
        showToast('Task completed — nice work!');
      }
      refreshAll();
    },
    [refreshAll, settings, showToast]
  );

  return { updateTask, deleteTask, toggleTask, refreshAll };
}
