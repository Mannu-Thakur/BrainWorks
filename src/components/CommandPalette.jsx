import {
  Dashboard,
  Search,
  Star,
  Timer,
  Today,
  ViewList,
} from '@mui/icons-material';
import {
  Dialog,
  DialogContent,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';

import { useAllTasks } from '../hooks/useAllTasks.js';
import { useTodoLists } from '../hooks/useTodoLists.js';
import { useAppState } from '../providers/AppState.jsx';
import { VIEWS } from '../utils.js';

const COMMANDS = [
  { id: 'dashboard', label: 'Go to Dashboard', icon: Dashboard, view: VIEWS.dashboard },
  { id: 'today', label: 'Go to Today', icon: Today, view: VIEWS.today },
  { id: 'all', label: 'Go to All Tasks', icon: ViewList, view: VIEWS.all },
  { id: 'starred', label: 'Go to Starred', icon: Star, view: VIEWS.starred },
  { id: 'pomodoro', label: 'Open Pomodoro Timer', icon: Timer, view: VIEWS.pomodoro },
];

export function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState('');
  const { openView, openList, setDetailItemId, setSearch } = useAppState();
  const { data: lists } = useTodoLists();
  const { data: tasks } = useAllTasks();

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    const cmds = COMMANDS.filter(c =>
      !q ? true : c.label.toLowerCase().includes(q)
    );
    const matchedLists = lists.filter(l =>
      !q ? false : l.name.toLowerCase().includes(q)
    );
    const matchedTasks = tasks.filter(
      t =>
        !q
          ? false
          : t.name.toLowerCase().includes(q) ||
            (t.notes ?? '').toLowerCase().includes(q)
    );
    return { cmds, matchedLists, matchedTasks };
  }, [query, lists, tasks]);

  const run = action => {
    action();
    setQuery('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent sx={{ pt: 2 }}>
        <TextField
          autoFocus
          fullWidth
          placeholder="Search commands, lists, tasks… (Ctrl+K)"
          value={query}
          onChange={e => setQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 1 }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          Ctrl+1 Dashboard · Ctrl+2 Today · Ctrl+3 Pomodoro · Ctrl+/ Quick search
        </Typography>
        <List dense>
          {filtered.cmds.map(cmd => (
            <ListItemButton
              key={cmd.id}
              onClick={() => run(() => openView(cmd.view))}
            >
              <ListItemIcon>
                <cmd.icon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={cmd.label} />
            </ListItemButton>
          ))}
          {filtered.matchedLists.map(list => (
            <ListItemButton
              key={`list-${list.id}`}
              onClick={() => run(() => openList(list.id))}
            >
              <ListItemText primary={`List: ${list.name}`} />
            </ListItemButton>
          ))}
          {filtered.matchedTasks.slice(0, 8).map(task => (
            <ListItemButton
              key={`task-${task.id}`}
              onClick={() =>
                run(() => {
                  if (task.listId) openList(task.listId);
                  setDetailItemId(task.id);
                })
              }
            >
              <ListItemText
                primary={task.name}
                secondary={task.list?.name}
              />
            </ListItemButton>
          ))}
          {query && (
            <ListItemButton
              onClick={() =>
                run(() => {
                  setSearch(query);
                  openView(VIEWS.all);
                })
              }
            >
              <ListItemText primary={`Search all tasks for "${query}"`} />
            </ListItemButton>
          )}
        </List>
      </DialogContent>
    </Dialog>
  );
}
