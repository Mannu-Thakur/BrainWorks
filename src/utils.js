import Dexie from 'dexie';

export const PRIORITIES = {
  none: { value: 0, label: 'None', color: '#94a3b8' },
  low: { value: 1, label: 'Low', color: '#22c55e' },
  medium: { value: 2, label: 'Medium', color: '#f59e0b' },
  high: { value: 3, label: 'High', color: '#ef4444' },
  urgent: { value: 4, label: 'Urgent', color: '#dc2626' },
};

export const DEFAULT_LIST_COLOR = '#6366f1';

export const VIEWS = {
  dashboard: 'dashboard',
  today: 'today',
  upcoming: 'upcoming',
  starred: 'starred',
  all: 'all',
  list: 'list',
  pomodoro: 'pomodoro',
  calendar: 'calendar',
};

export const RECURRENCE = {
  none: 'none',
  daily: 'daily',
  weekly: 'weekly',
  monthly: 'monthly',
};

export const DEFAULT_SETTINGS = {
  themeMode: 'dark',
  notificationsEnabled: true,
  browserNotifications: true,
  soundEnabled: true,
  dailyDigestHour: 9,
  pomodoroMinutes: 25,
  streakData: { current: 0, best: 0, lastCompletedDate: null },
};

export function parseTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  try {
    return JSON.parse(tags);
  } catch {
    return [];
  }
}

export function serializeTags(tags) {
  return JSON.stringify(tags ?? []);
}

export function parseSubtasks(subtasks) {
  if (!subtasks) return [];
  if (Array.isArray(subtasks)) return subtasks;
  try {
    return JSON.parse(subtasks);
  } catch {
    return [];
  }
}

export function serializeSubtasks(subtasks) {
  return JSON.stringify(subtasks ?? []);
}

export function normalizeItem(item) {
  return {
    ...item,
    priority: item.priority ?? 0,
    starred: Boolean(item.starred),
    tags: parseTags(item.tags),
    subtasks: parseSubtasks(item.subtasks),
    notes: item.notes ?? '',
    sortOrder: item.sortOrder ?? 0,
    reminderAt: item.reminderAt ?? null,
    recurrence: item.recurrence ?? RECURRENCE.none,
    lastNotifiedAt: item.lastNotifiedAt ?? null,
    createdAt: item.createdAt ?? new Date().toISOString(),
    updatedAt: item.updatedAt ?? new Date().toISOString(),
  };
}

export function normalizeList(list) {
  return {
    ...list,
    color: list.color ?? DEFAULT_LIST_COLOR,
    sortOrder: list.sortOrder ?? 0,
    createdAt: list.createdAt ?? new Date().toISOString(),
  };
}

export const db = new Dexie('todo-list-db');

db.version(2).stores({
  lists: '++id, name',
  listItems: '++id, name, checked, listId',
});

db.version(3)
  .stores({
    lists: '++id, name, sortOrder',
    listItems:
      '++id, listId, name, checked, priority, dueDate, starred, sortOrder',
    settings: 'key',
  })
  .upgrade(async tx => {
    const lists = await tx.table('lists').toArray();
    for (let i = 0; i < lists.length; i++) {
      await tx.table('lists').update(lists[i].id, {
        color: DEFAULT_LIST_COLOR,
        sortOrder: i,
        createdAt: new Date().toISOString(),
      });
    }
    const items = await tx.table('listItems').toArray();
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await tx.table('listItems').update(item.id, {
        priority: 0,
        starred: false,
        tags: serializeTags([]),
        subtasks: serializeSubtasks([]),
        notes: '',
        sortOrder: i,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  });

db.version(4)
  .stores({
    lists: '++id, name, sortOrder',
    listItems:
      '++id, listId, name, checked, priority, dueDate, starred, sortOrder, reminderAt',
    settings: 'key',
    notifications: '++id, createdAt, read',
  })
  .upgrade(async tx => {
    const items = await tx.table('listItems').toArray();
    for (const item of items) {
      await tx.table('listItems').update(item.id, {
        reminderAt: null,
        recurrence: RECURRENCE.none,
        lastNotifiedAt: null,
      });
    }
  });

async function getItemsForList(listId) {
  const items = await db.listItems.where({ listId }).toArray();
  return items
    .map(normalizeItem)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
}

async function getAllItemsNormalized() {
  const items = await db.listItems.toArray();
  const lists = await db.lists.toArray();
  const listMap = Object.fromEntries(lists.map(l => [l.id, normalizeList(l)]));
  return items
    .map(item => ({
      ...normalizeItem(item),
      list: listMap[item.listId],
    }))
    .filter(item => item.list);
}

export const APIs = {
  TodoLists: 'todo-lists',
  TodoListsUpdate: 'todo-lists-update',
  TodoListsDelete: 'todo-lists-delete',
  TodoList: 'todo-list',
  TodoListDelete: 'todo-list-delete',
  TodoListUpdate: 'todo-list-update',
  TodoListBulkDelete: 'todo-list-bulk-delete',
  TodoListReorder: 'todo-list-reorder',
  AllTasks: 'all-tasks',
  Settings: 'settings',
  Notifications: 'notifications',
  NotificationsMarkRead: 'notifications-mark-read',
  NotificationsClear: 'notifications-clear',
  Export: 'export',
  Import: 'import',
  Search: 'search',
};

export async function fetcher({ url, ...variables }) {
  switch (url) {
    case APIs.TodoLists: {
      const lists = await db.lists.toArray();
      return lists.map(normalizeList).sort((a, b) => a.sortOrder - b.sortOrder);
    }
    case APIs.TodoList: {
      const list = await db.lists.get(variables.id);
      if (!list) return null;
      return {
        ...normalizeList(list),
        items: await getItemsForList(variables.id),
      };
    }
    case APIs.AllTasks:
      return getAllItemsNormalized();
    case APIs.Settings: {
      const rows = await db.settings?.toArray?.();
      const stored = rows?.length
        ? Object.fromEntries(rows.map(({ key, value }) => [key, value]))
        : {};
      return { ...DEFAULT_SETTINGS, ...stored };
    }
    case APIs.Notifications: {
      const rows = await db.notifications.orderBy('createdAt').reverse().toArray();
      return rows.slice(0, 50);
    }
    case APIs.Search: {
      const q = (variables.query ?? '').toLowerCase().trim();
      if (!q) return [];
      const all = await getAllItemsNormalized();
      return all.filter(
        item =>
          item.name.toLowerCase().includes(q) ||
          item.notes.toLowerCase().includes(q) ||
          item.tags.some(t => t.toLowerCase().includes(q)) ||
          item.list?.name?.toLowerCase().includes(q)
      );
    }
    default:
      throw new Error(`Unknown API ${url}`);
  }
}

export async function putter({ url, id, ...variables }) {
  const now = new Date().toISOString();

  switch (url) {
    case APIs.TodoLists: {
      const count = await db.lists.count();
      return db.lists.add({
        name: variables.name,
        icon: variables.icon || 'List',
        color: variables.color || DEFAULT_LIST_COLOR,
        sortOrder: count,
        createdAt: now,
      });
    }
    case APIs.TodoListsUpdate:
      return db.lists.update(id, {
        ...variables,
        ...(variables.name !== undefined ? {} : {}),
      });
    case APIs.TodoListsDelete: {
      await db.listItems.where({ listId: id }).delete();
      return db.lists.delete(id);
    }
    case APIs.TodoList: {
      const listItems = await db.listItems.where({ listId: id }).toArray();
      const sortOrder = listItems.length;
      return db.listItems.add({
        listId: id,
        name: variables.name,
        checked: false,
        priority: variables.priority ?? 0,
        dueDate: variables.dueDate ?? null,
        notes: variables.notes ?? '',
        tags: serializeTags(variables.tags ?? []),
        subtasks: serializeSubtasks(variables.subtasks ?? []),
        starred: variables.starred ?? false,
        reminderAt: variables.reminderAt ?? null,
        recurrence: variables.recurrence ?? RECURRENCE.none,
        lastNotifiedAt: null,
        sortOrder,
        createdAt: now,
        updatedAt: now,
      });
    }
    case APIs.TodoListDelete:
      return db.listItems.delete(id);
    case APIs.TodoListBulkDelete:
      return db.listItems.bulkDelete(variables.ids);
    case APIs.TodoListUpdate: {
      const patch = { ...variables, updatedAt: now };
      if (variables.tags !== undefined) {
        patch.tags = serializeTags(variables.tags);
      }
      if (variables.subtasks !== undefined) {
        patch.subtasks = serializeSubtasks(variables.subtasks);
      }
      return db.listItems.update(id, patch);
    }
    case APIs.TodoListReorder: {
      const updates = variables.items.map(({ id: itemId, sortOrder }) =>
        db.listItems.update(itemId, { sortOrder, updatedAt: now })
      );
      return Promise.all(updates);
    }
    case APIs.Settings:
      return db.settings.put({ key: variables.key, value: variables.value });
    case APIs.Notifications:
      return db.notifications.add({
        title: variables.title,
        body: variables.body,
        type: variables.type ?? 'info',
        taskId: variables.taskId ?? null,
        read: false,
        createdAt: now,
      });
    case APIs.NotificationsMarkRead:
      if (variables.all) {
        const unread = await db.notifications.filter(n => !n.read).toArray();
        return Promise.all(
          unread.map(n => db.notifications.update(n.id, { read: true }))
        );
      }
      return db.notifications.update(id, { read: true });
    case APIs.NotificationsClear:
      return db.notifications.clear();
    case APIs.Import: {
      await db.transaction('rw', db.lists, db.listItems, db.settings, async () => {
        await db.lists.clear();
        await db.listItems.clear();
        for (const list of variables.data.lists ?? []) {
          const { items, ...listData } = list;
          const newId = await db.lists.add({
            name: listData.name,
            icon: listData.icon ?? 'List',
            color: listData.color ?? DEFAULT_LIST_COLOR,
            sortOrder: listData.sortOrder ?? 0,
            createdAt: listData.createdAt ?? now,
          });
          for (const item of items ?? []) {
            await db.listItems.add({
              listId: newId,
              name: item.name,
              checked: item.checked ?? false,
              priority: item.priority ?? 0,
              dueDate: item.dueDate ?? null,
              notes: item.notes ?? '',
              tags: serializeTags(parseTags(item.tags)),
              subtasks: serializeSubtasks(parseSubtasks(item.subtasks)),
              starred: item.starred ?? false,
              reminderAt: item.reminderAt ?? null,
              recurrence: item.recurrence ?? RECURRENCE.none,
              lastNotifiedAt: null,
              sortOrder: item.sortOrder ?? 0,
              createdAt: item.createdAt ?? now,
              updatedAt: item.updatedAt ?? now,
            });
          }
        }
      });
      return true;
    }
    default:
      throw new Error(`Unknown API ${url}`);
  }
}

export async function exportData() {
  const lists = await db.lists.toArray();
  const result = [];
  for (const list of lists) {
    const items = await getItemsForList(list.id);
    result.push({
      ...normalizeList(list),
      items: items.map(item => {
        const copy = { ...item };
        delete copy.listId;
        return copy;
      }),
    });
  }
  return { version: 4, exportedAt: new Date().toISOString(), lists: result };
}

/** Advance due date for recurring tasks */
export function nextDueDate(isoDate, recurrence) {
  if (!isoDate || recurrence === RECURRENCE.none) return null;
  const d = new Date(isoDate);
  if (recurrence === RECURRENCE.daily) d.setDate(d.getDate() + 1);
  else if (recurrence === RECURRENCE.weekly) d.setDate(d.getDate() + 7);
  else if (recurrence === RECURRENCE.monthly) d.setMonth(d.getMonth() + 1);
  return d.toISOString();
}

export function nextReminder(isoDate, recurrence) {
  return nextDueDate(isoDate, recurrence);
}
