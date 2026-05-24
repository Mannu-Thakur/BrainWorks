import { Add, Flag, LocalOffer, Star } from '@mui/icons-material';
import {
  Box,
  Chip,
  IconButton,
  MenuItem,
  Paper,
  Select,
  TextField,
  ToggleButton,
  Tooltip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useState } from 'react';

import { PRIORITIES } from '../utils.js';

const PRIORITY_OPTIONS = Object.entries(PRIORITIES).filter(
  ([key]) => key !== 'none'
);

export function TaskComposer({ onAdd, isGlobal, lists, listId }) {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState(0);
  const [dueDate, setDueDate] = useState(null);
  const [starred, setStarred] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [showExtras, setShowExtras] = useState(false);
  const [targetList, setTargetList] = useState(listId ?? lists?.[0]?.id);

  const submit = () => {
    const name = text.trim();
    if (!name) return;
    const payload = {
      name,
      priority,
      dueDate: dueDate ? dueDate.toISOString() : null,
      starred,
      tags,
    };
    if (isGlobal && targetList) {
      onAdd({ ...payload, listId: targetList });
    } else {
      onAdd(payload);
    }
    setText('');
    setPriority(0);
    setDueDate(null);
    setStarred(false);
    setTags([]);
    setTagInput('');
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagInput('');
  };

  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 3,
        bgcolor: theme =>
          theme.palette.mode === 'dark'
            ? 'rgba(15,23,42,0.6)'
            : 'rgba(255,255,255,0.8)',
      }}
    >
      {isGlobal && lists?.length > 0 && (
        <Select
          size="small"
          fullWidth
          value={targetList ?? ''}
          onChange={e => setTargetList(e.target.value)}
          sx={{ mb: 1.5 }}
        >
          {lists.map(l => (
            <MenuItem key={l.id} value={l.id}>
              {l.name}
            </MenuItem>
          ))}
        </Select>
      )}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Add a task… (Enter to save)"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              submit();
            }
          }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
        <Tooltip title="Priority, due date, tags">
          <IconButton
            onClick={() => setShowExtras(!showExtras)}
            color={showExtras ? 'primary' : 'default'}
          >
            <Flag />
          </IconButton>
        </Tooltip>
        <IconButton
          color="primary"
          onClick={submit}
          sx={{ bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.dark' } }}
        >
          <Add />
        </IconButton>
      </Box>
      {showExtras && (
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          <Select
            size="small"
            value={priority}
            onChange={e => setPriority(Number(e.target.value))}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value={0}>No priority</MenuItem>
            {PRIORITY_OPTIONS.map(([key, p]) => (
              <MenuItem key={key} value={p.value}>
                {p.label}
              </MenuItem>
            ))}
          </Select>
          <DatePicker
            label="Due date"
            value={dueDate}
            onChange={setDueDate}
            slotProps={{ textField: { size: 'small', sx: { width: 160 } } }}
          />
          <ToggleButton
            value="star"
            selected={starred}
            onChange={() => setStarred(!starred)}
            size="small"
          >
            <Star fontSize="small" />
          </ToggleButton>
          <TextField
            size="small"
            placeholder="Add tag"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
            InputProps={{
              endAdornment: (
                <IconButton size="small" onClick={addTag}>
                  <LocalOffer fontSize="small" />
                </IconButton>
              ),
            }}
            sx={{ width: 140 }}
          />
          {tags.map(tag => (
            <Chip key={tag} label={tag} size="small" onDelete={() => setTags(tags.filter(t => t !== tag))} />
          ))}
        </Box>
      )}
    </Paper>
  );
}
