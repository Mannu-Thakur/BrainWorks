import {
  compareAsc,
  isAfter,
  isBefore,
  isToday,
  isTomorrow,
  parseISO,
  startOfDay,
} from 'date-fns';
import { useMemo } from 'react';

export const FILTER_MODES = {
  all: 'all',
  active: 'active',
  completed: 'completed',
};

export const SORT_MODES = {
  manual: 'manual',
  priority: 'priority',
  dueDate: 'dueDate',
  name: 'name',
  created: 'created',
};

function parseDue(dueDate) {
  if (!dueDate) return null;
  try {
    return parseISO(dueDate);
  } catch {
    return null;
  }
}

export function filterTasks(items, { search, filter, priority, tag, sort }) {
  let result = [...items];

  const q = search?.toLowerCase().trim();
  if (q) {
    result = result.filter(
      item =>
        item.name.toLowerCase().includes(q) ||
        (item.notes ?? '').toLowerCase().includes(q) ||
        (item.tags ?? []).some(t => t.toLowerCase().includes(q))
    );
  }

  if (filter === FILTER_MODES.active) {
    result = result.filter(item => !item.checked);
  } else if (filter === FILTER_MODES.completed) {
    result = result.filter(item => item.checked);
  }

  if (priority !== null && priority !== undefined && priority !== '') {
    result = result.filter(item => item.priority === Number(priority));
  }

  if (tag) {
    result = result.filter(item => (item.tags ?? []).includes(tag));
  }

  switch (sort) {
    case SORT_MODES.priority:
      result.sort((a, b) => b.priority - a.priority || a.sortOrder - b.sortOrder);
      break;
    case SORT_MODES.dueDate:
      result.sort((a, b) => {
        const da = parseDue(a.dueDate);
        const db_ = parseDue(b.dueDate);
        if (!da && !db_) return a.sortOrder - b.sortOrder;
        if (!da) return 1;
        if (!db_) return -1;
        return compareAsc(da, db_);
      });
      break;
    case SORT_MODES.name:
      result.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case SORT_MODES.created:
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
    default:
      result.sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
  }

  return result;
}

export function useTaskFilters(items, options) {
  return useMemo(() => filterTasks(items, options), [items, options]);
}

export function getTodayTasks(items) {
  return items.filter(item => {
    if (item.checked) return false;
    const due = parseDue(item.dueDate);
    if (!due) return false;
    return isToday(due) || isBefore(due, startOfDay(new Date()));
  });
}

export function getUpcomingTasks(items) {
  const tomorrow = startOfDay(new Date());
  tomorrow.setDate(tomorrow.getDate() + 1);
  return items.filter(item => {
    if (item.checked) return false;
    const due = parseDue(item.dueDate);
    if (!due) return false;
    return (
      isTomorrow(due) ||
      (isAfter(due, startOfDay(new Date())) && !isToday(due))
    );
  });
}

export function getStarredTasks(items) {
  return items.filter(item => item.starred && !item.checked);
}

export function collectAllTags(items) {
  const set = new Set();
  for (const item of items) {
    for (const tag of item.tags ?? []) {
      if (tag) set.add(tag);
    }
  }
  return [...set].sort();
}
