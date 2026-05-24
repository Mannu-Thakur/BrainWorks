# BrainWorks — Nexus Tasks

A **portfolio-grade** productivity app: modern UI, smart notifications, Pomodoro, calendar, streaks, and offline-first storage — built with React + Vite.

## Highlights for recruiters

- **Notification system** — in-app center + browser push, reminders, daily digest
- **Productivity tools** — Pomodoro timer, focus mode, command palette (Ctrl+K)
- **Rich task model** — priorities, due dates, tags, subtasks, recurring tasks
- **Analytics** — completion rate, 7-day chart, daily streaks
- **PWA** — installable, works offline (service worker via vite-plugin-pwa)
- **No backend required** — IndexedDB (Dexie); optional `VITE_API_URL` for future API

## Features

| Area | Details |
|------|---------|
| Tasks | Lists, drag-and-drop, filters, search, stars, notes, subtasks |
| Notifications | Per-task reminders, due-today alerts, daily digest, sound |
| Views | Dashboard, Today, Upcoming, Starred, All, Calendar, Pomodoro |
| UX | Dark/light theme, keyboard shortcuts, focus mode, toasts |
| Data | Export/import JSON, local-first privacy |

## Quick start

```bash
npm install
cp .env.example .env
npm run dev
```

Allow **browser notifications** when prompted (Settings → Request browser permission).

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Command palette |
| `Ctrl+1` | Dashboard |
| `Ctrl+2` | Today |
| `Ctrl+3` | Pomodoro |
| `Ctrl+F` | Focus mode |
| `Ctrl+/` | All tasks |

## Scripts

```bash
npm run dev      # development
npm run build    # production build
npm run preview  # preview build
npm run lint     # ESLint
```

## Environment

See `.env.example`. Only `VITE_*` variables are exposed to the client.

## Tech stack

React 18 · Vite · Material UI · Dexie · SWR · date-fns · @dnd-kit · vite-plugin-pwa

## License

MIT
