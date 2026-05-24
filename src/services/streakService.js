import { format, parseISO, subDays } from 'date-fns';

import { APIs, putter } from '../utils.js';

function todayKey() {
  return format(new Date(), 'yyyy-MM-dd');
}

export async function recordTaskCompletion(currentStreakData) {
  const today = todayKey();
  const data = currentStreakData ?? {
    current: 0,
    best: 0,
    lastCompletedDate: null,
  };

  if (data.lastCompletedDate === today) {
    return data;
  }

  let current = 1;
  if (data.lastCompletedDate) {
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    if (data.lastCompletedDate === yesterday) {
      current = (data.current ?? 0) + 1;
    }
  }

  const next = {
    current,
    best: Math.max(data.best ?? 0, current),
    lastCompletedDate: today,
  };

  await putter({ url: APIs.Settings, key: 'streakData', value: next });
  return next;
}

export function getWeeklyCompletionCounts(allTasks) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = subDays(new Date(), i);
    const key = format(d, 'yyyy-MM-dd');
    const count = allTasks.filter(t => {
      if (!t.checked || !t.updatedAt) return false;
      try {
        return format(parseISO(t.updatedAt), 'yyyy-MM-dd') === key;
      } catch {
        return false;
      }
    }).length;
    days.push({ label: format(d, 'EEE'), count, key });
  }
  return days;
}
