# BrainWorks — Nexus Tasks

A modern, full-featured todo app built with React and Vite. Data is stored locally in your browser (IndexedDB) — no backend required to run.

## Features

- Multiple lists with custom icons and colors
- Priorities, due dates, tags, stars, notes, and subtasks
- Dashboard, Today, Upcoming, Starred, and All Tasks views
- Search, filters, and sorting
- Drag-and-drop reordering
- Dark / light theme
- Export and import JSON backups

## Quick start

```bash
npm install
cp .env.example .env   # optional; defaults work
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Environment

Copy `.env.example` to `.env` for local overrides. Only variables prefixed with `VITE_` are exposed to the client.

## Tech stack

- React 18 + Vite
- Material UI
- Dexie (IndexedDB)
- SWR

## License

MIT
