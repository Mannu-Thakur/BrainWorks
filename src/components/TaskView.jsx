import * as Icons from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { useMemo } from 'react';

import { useAllTasks } from '../hooks/useAllTasks.js';
import { useTaskActions } from '../hooks/useTaskActions.js';
import {
  getStarredTasks,
  getTodayTasks,
  getUpcomingTasks,
  SORT_MODES,
  useTaskFilters,
} from '../hooks/useTaskFilters.js';
import { useTodoList } from '../hooks/useTodoList.js';
import { useTodoLists } from '../hooks/useTodoLists.js';
import { useAppState } from '../providers/AppState.jsx';
import { APIs, putter } from '../utils.js';
import { VIEWS } from '../utils.js';
import { SortableTaskList } from './SortableTaskList.jsx';
import { TaskComposer } from './TaskComposer.jsx';
import { TaskFilters } from './TaskFilters.jsx';

const VIEW_TITLES = {
  [VIEWS.today]: 'Today',
  [VIEWS.upcoming]: 'Upcoming',
  [VIEWS.starred]: 'Starred',
  [VIEWS.all]: 'All Tasks',
};

export function TaskView() {
  const {
    view,
    currentList,
    search,
    filter,
    sort,
    priorityFilter,
    tagFilter,
  } = useAppState();
  const { data: listData, isLoading: listLoading, ...listActions } =
    useTodoList(currentList);
  const { data: allTasks, isLoading: allLoading } = useAllTasks();
  const { data: lists, updateList } = useTodoLists();
  const { refreshAll } = useTaskActions();

  const rawItems = useMemo(() => {
    if (view === VIEWS.list) {
      return listData?.items ?? [];
    }
    let items = allTasks;
    if (view === VIEWS.today) items = getTodayTasks(allTasks);
    else if (view === VIEWS.upcoming) items = getUpcomingTasks(allTasks);
    else if (view === VIEWS.starred) items = getStarredTasks(allTasks);
    return items;
  }, [view, listData, allTasks]);

  const filteredItems = useTaskFilters(rawItems, {
    search,
    filter,
    sort,
    priority: priorityFilter,
    tag: tagFilter,
  });

  const isGlobalView = view !== VIEWS.list;
  const isLoading = isGlobalView ? allLoading : listLoading;
  const title =
    view === VIEWS.list
      ? listData?.name ?? 'List'
      : VIEW_TITLES[view] ?? 'Tasks';

  const Icon =
    view === VIEWS.list
      ? Icons[listData?.icon] ?? Icons.List
      : Icons.CalendarMonth;

  const completedCount = rawItems.filter(i => i.checked).length;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        {view === VIEWS.list && listData && (
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: `${listData.color}22`,
              color: listData.color,
            }}
          >
            <Icon />
          </Box>
        )}
        <Box sx={{ flex: 1 }}>
          {view === VIEWS.list && listData ? (
            <Typography
              variant="h4"
              contentEditable
              suppressContentEditableWarning
              onBlur={e => {
                const name = e.currentTarget.textContent?.trim();
                if (name && name !== listData.name) {
                  void updateList(listData.id, { name });
                }
              }}
              sx={{
                outline: 'none',
                fontWeight: 800,
                '&:focus': {
                  borderBottom: 2,
                  borderColor: 'primary.main',
                },
              }}
            >
              {listData.name}
            </Typography>
          ) : (
            <Typography variant="h4" fontWeight={800}>
              {title}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            {rawItems.filter(i => !i.checked).length} active
            {completedCount > 0 && ` · ${completedCount} completed`}
          </Typography>
        </Box>
      </Box>

      <TaskFilters items={rawItems} />

      {(view === VIEWS.list || isGlobalView) && (
        <TaskComposer
          onAdd={async fields => {
            if (isGlobalView) {
              const { listId, ...rest } = fields;
              await putter({
                url: APIs.TodoList,
                id: listId,
                name: rest.name,
                priority: rest.priority,
                dueDate: rest.dueDate,
                starred: rest.starred,
                tags: rest.tags,
              });
              refreshAll();
            } else {
              await listActions.newItem(fields);
            }
          }}
          listId={currentList}
          isGlobal={isGlobalView}
          lists={lists}
        />
      )}

      <SortableTaskList
        items={filteredItems}
        isLoading={isLoading}
        isGlobal={isGlobalView}
        listActions={listActions}
        enableReorder={view === VIEWS.list && sort === SORT_MODES.manual}
      />

      {view === VIEWS.list && completedCount > 0 && (
        <Typography
          variant="body2"
          color="primary"
          sx={{ mt: 2, cursor: 'pointer', textAlign: 'center' }}
          onClick={() => listActions.deleteCompleted()}
        >
          Clear {completedCount} completed task{completedCount > 1 ? 's' : ''}
        </Typography>
      )}
    </Box>
  );
}
