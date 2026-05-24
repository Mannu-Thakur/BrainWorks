import { APIs, db, putter } from '../utils.js';

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return Notification.requestPermission();
}

export function showBrowserNotification(title, options = {}) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return null;
  }
  try {
    const n = new Notification(title, {
      icon: '/vite.svg',
      badge: '/vite.svg',
      ...options,
    });
    n.onclick = () => {
      window.focus();
      n.close();
      options.onClick?.();
    };
    return n;
  } catch {
    return null;
  }
}

export async function pushInAppNotification({ title, body, type, taskId }) {
  await putter({
    url: APIs.Notifications,
    title,
    body,
    type,
    taskId,
  });
}

export async function notifyUser({
  title,
  body,
  type = 'info',
  taskId = null,
  browser = true,
}) {
  await pushInAppNotification({ title, body, type, taskId });
  if (browser) {
    showBrowserNotification(title, { body, tag: taskId ? `task-${taskId}` : type });
  }
}

export function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.value = 0.08;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    /* ignore */
  }
}

export async function markTaskNotified(taskId) {
  await db.listItems.update(taskId, {
    lastNotifiedAt: new Date().toISOString(),
  });
}
