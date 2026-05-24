import { Close, DeleteOutline } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useEffect, useMemo, useState } from 'react';

import { useAllTasks } from '../hooks/useAllTasks.js';
import { useTaskActions } from '../hooks/useTaskActions.js';
import { useTodoList } from '../hooks/useTodoList.js';
import { useAppState } from '../providers/AppState.jsx';
import { PRIORITIES, VIEWS } from '../utils.js';

export function TaskDetailDrawer() {
  const { detailItemId, setDetailItemId, view, currentList } = useAppState();
  const { data: allTasks } = useAllTasks();
  const { data: listData, updateItem, deleteItem } = useTodoList(currentList);
  const { updateTask, deleteTask } = useTaskActions();

  const item = useMemo(() => {
    if (!detailItemId) return null;
    if (view === VIEWS.list && listData?.items) {
      return listData.items.find(i => i.id === detailItemId);
    }
    return allTasks.find(i => i.id === detailItemId);
  }, [detailItemId, view, listData, allTasks]);

  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState(0);
  const [dueDate, setDueDate] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [subtaskText, setSubtaskText] = useState('');
  const [subtasks, setSubtasks] = useState([]);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setNotes(item.notes ?? '');
      setPriority(item.priority ?? 0);
      setDueDate(item.dueDate ? new Date(item.dueDate) : null);
      setTags(item.tags ?? []);
      setSubtasks(item.subtasks ?? []);
    }
  }, [item]);

  const isGlobal = view !== VIEWS.list;

  const save = patch => {
    if (!item) return;
    if (isGlobal) {
      void updateTask(item.id, patch);
    } else {
      void updateItem(item.id, patch);
    }
  };

  const handleClose = () => setDetailItemId(null);

  const addSubtask = () => {
    const text = subtaskText.trim();
    if (!text) return;
    const next = [...subtasks, { id: crypto.randomUUID(), text, done: false }];
    setSubtasks(next);
    setSubtaskText('');
    save({ subtasks: next });
  };

  const toggleSubtask = id => {
    const next = subtasks.map(s =>
      s.id === id ? { ...s, done: !s.done } : s
    );
    setSubtasks(next);
    save({ subtasks: next });
  };

  const removeSubtask = id => {
    const next = subtasks.filter(s => s.id !== id);
    setSubtasks(next);
    save({ subtasks: next });
  };

  return (
    <Drawer anchor="right" open={Boolean(item)} onClose={handleClose}>
      <Box sx={{ width: { xs: '100vw', sm: 400 }, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            Task details
          </Typography>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </Box>
        {item && (
          <>
            <TextField
              fullWidth
              label="Title"
              value={name}
              onChange={e => setName(e.target.value)}
              onBlur={() => name !== item.name && save({ name })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              minRows={4}
              label="Notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              onBlur={() => notes !== (item.notes ?? '') && save({ notes })}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                label="Priority"
                value={priority}
                onChange={e => {
                  const v = Number(e.target.value);
                  setPriority(v);
                  save({ priority: v });
                }}
              >
                {Object.entries(PRIORITIES).map(([, p]) => (
                  <MenuItem key={p.value} value={p.value}>
                    {p.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <DatePicker
              label="Due date"
              value={dueDate}
              onChange={d => {
                setDueDate(d);
                save({ dueDate: d ? d.toISOString() : null });
              }}
              slotProps={{ textField: { fullWidth: true, size: 'small', sx: { mb: 2 } } }}
            />
            <Typography variant="subtitle2" gutterBottom>
              Tags
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
              {tags.map(tag => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  onDelete={() => {
                    const next = tags.filter(t => t !== tag);
                    setTags(next);
                    save({ tags: next });
                  }}
                />
              ))}
            </Box>
            <TextField
              size="small"
              placeholder="Add tag, Enter"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const t = tagInput.trim().toLowerCase();
                  if (t && !tags.includes(t)) {
                    const next = [...tags, t];
                    setTags(next);
                    setTagInput('');
                    save({ tags: next });
                  }
                }
              }}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Typography variant="subtitle2" gutterBottom>
              Subtasks
            </Typography>
            {subtasks.map(st => (
              <Box
                key={st.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 0.5,
                }}
              >
                <input
                  type="checkbox"
                  checked={st.done}
                  onChange={() => toggleSubtask(st.id)}
                />
                <Typography
                  sx={{
                    flex: 1,
                    textDecoration: st.done ? 'line-through' : 'none',
                  }}
                >
                  {st.text}
                </Typography>
                <IconButton size="small" onClick={() => removeSubtask(st.id)}>
                  <Close fontSize="small" />
                </IconButton>
              </Box>
            ))}
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <TextField
                size="small"
                fullWidth
                placeholder="New subtask"
                value={subtaskText}
                onChange={e => setSubtaskText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSubtask()}
              />
              <Button variant="outlined" onClick={addSubtask}>
                Add
              </Button>
            </Box>
            <Button
              fullWidth
              color="error"
              variant="outlined"
              startIcon={<DeleteOutline />}
              onClick={() => {
                if (isGlobal) {
                  void deleteTask(item.id);
                } else {
                  void deleteItem(item.id);
                }
                handleClose();
              }}
            >
              Delete task
            </Button>
          </>
        )}
      </Box>
    </Drawer>
  );
}
