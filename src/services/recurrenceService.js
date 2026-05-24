import { APIs, nextDueDate, nextReminder, putter, RECURRENCE } from '../utils.js';

export async function handleRecurringTaskComplete(task) {
  if (!task.checked || task.recurrence === RECURRENCE.none) return;

  const newDue = nextDueDate(task.dueDate ?? new Date().toISOString(), task.recurrence);
  const newReminder = task.reminderAt
    ? nextReminder(task.reminderAt, task.recurrence)
    : null;

  await putter({
    url: APIs.TodoList,
    id: task.listId,
    name: task.name,
    priority: task.priority,
    dueDate: newDue,
    reminderAt: newReminder,
    recurrence: task.recurrence,
    notes: task.notes,
    tags: task.tags,
    starred: task.starred,
    subtasks: [],
  });
}
