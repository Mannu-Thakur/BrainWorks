import { addHours, format, isBefore, parseISO, startOfDay } from 'date-fns';
import { useEffect, useRef } from 'react';
import { useSWRConfig } from 'swr';

import {
  markTaskNotified,
  notifyUser,
  playNotificationSound,
  requestNotificationPermission,
} from '../services/notificationService.js';
import { APIs, db } from '../utils.js';
import { useAllTasks } from './useAllTasks.js';
import { useNotifications } from './useNotifications.js';
import { useSettings } from './useSettings.js';

const CHECK_MS = 30_000;

export function useReminderScheduler() {
  const { data: tasks } = useAllTasks();
  const { data: settings } = useSettings();
  const { refresh } = useNotifications();
  const { mutate } = useSWRConfig();
  const digestSentRef = useRef(null);

  useEffect(() => {
    if (settings.browserNotifications) {
      void requestNotificationPermission();
    }
  }, [settings.browserNotifications]);

  useEffect(() => {
    const runCheck = async () => {
      if (!settings.notificationsEnabled) return;

      const now = new Date();

      for (const task of tasks) {
        if (task.checked) continue;

        if (task.reminderAt) {
          const reminder = parseISO(task.reminderAt);
          if (
            isBefore(reminder, now) &&
            task.lastNotifiedAt !== task.reminderAt
          ) {
            await notifyUser({
              title: 'Reminder',
              body: task.name,
              type: 'reminder',
              taskId: task.id,
              browser: settings.browserNotifications,
            });
            if (settings.soundEnabled) playNotificationSound();
            await markTaskNotified(task.id);
            refresh();
          }
        }

        if (task.dueDate && !task.reminderAt) {
          const due = parseISO(task.dueDate);
          const dueMorning = addHours(startOfDay(due), settings.dailyDigestHour ?? 9);
          const notifyKey = `due-${task.id}-${format(due, 'yyyy-MM-dd')}`;
          if (
            isBefore(dueMorning, now) &&
            isBefore(now, addHours(dueMorning, 1)) &&
            task.lastNotifiedAt !== notifyKey
          ) {
            await notifyUser({
              title: 'Due today',
              body: task.name,
              type: 'due',
              taskId: task.id,
              browser: settings.browserNotifications,
            });
            await db.listItems.update(task.id, { lastNotifiedAt: notifyKey });
            refresh();
          }
        }
      }

      const todayKey = format(now, 'yyyy-MM-dd');
      const hour = now.getHours();
      if (
        settings.dailyDigestHour === hour &&
        digestSentRef.current !== todayKey
      ) {
        const dueToday = tasks.filter(t => {
          if (t.checked || !t.dueDate) return false;
          try {
            return format(parseISO(t.dueDate), 'yyyy-MM-dd') === todayKey;
          } catch {
            return false;
          }
        });
        if (dueToday.length > 0) {
          await notifyUser({
            title: 'Daily digest',
            body: `You have ${dueToday.length} task(s) due today`,
            type: 'digest',
            browser: settings.browserNotifications,
          });
          digestSentRef.current = todayKey;
          refresh();
        }
      }

      void mutate(key => key?.url === APIs.AllTasks, undefined, { revalidate: true });
    };

    void runCheck();
    const id = setInterval(() => void runCheck(), CHECK_MS);
    return () => clearInterval(id);
  }, [tasks, settings, refresh, mutate]);
}
