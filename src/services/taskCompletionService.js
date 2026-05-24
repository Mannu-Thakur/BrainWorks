import { notifyUser } from './notificationService.js';
import { handleRecurringTaskComplete } from './recurrenceService.js';
import { recordTaskCompletion } from './streakService.js';

export async function onTaskCompleted(task, settings, streakData) {
  const nextStreak = await recordTaskCompletion(streakData);

  if (task.recurrence && task.recurrence !== 'none') {
    await handleRecurringTaskComplete({ ...task, checked: true });
  }

  if (nextStreak.current > 0 && nextStreak.current % 7 === 0) {
    await notifyUser({
      title: 'Streak milestone',
      body: `${nextStreak.current}-day completion streak!`,
      type: 'achievement',
      browser: settings.browserNotifications,
    });
  }

  return nextStreak;
}
