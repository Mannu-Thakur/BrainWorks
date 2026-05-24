import * as Icons from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  ToggleButton,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

import { useTodoLists } from '../hooks/useTodoLists.js';
import { DEFAULT_LIST_COLOR } from '../utils.js';

const LIST_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f43f5e',
  '#f59e0b',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
];

export function NewListDialog({ dialogState }) {
  const [name, setName] = useState('');
  const [iconSearch, setIconSearch] = useState('');
  const [icon, setIcon] = useState('List');
  const [color, setColor] = useState(DEFAULT_LIST_COLOR);
  const { newList } = useTodoLists();
  const [filteredIcons, setFilteredIcons] = useState([]);

  useEffect(() => {
    setFilteredIcons(
      Object.entries(Icons)
        .filter(([n]) => !/Outlined$|TwoTone$|Rounded$|Sharp$/.test(n))
        .filter(([n]) => (iconSearch ? n.toLowerCase().includes(iconSearch.toLowerCase()) : true))
        .slice(0, 12)
    );
  }, [iconSearch]);

  const reset = () => {
    setName('');
    setIcon('List');
    setColor(DEFAULT_LIST_COLOR);
    setIconSearch('');
  };

  return (
    <Dialog
      open={dialogState.isOpen}
      onClose={() => {
        dialogState.close();
        reset();
      }}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Create new list</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="List name"
          fullWidth
          value={name}
          onChange={e => setName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Typography variant="subtitle2" gutterBottom>
          Color
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          {LIST_COLORS.map(c => (
            <Box
              key={c}
              onClick={() => setColor(c)}
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: c,
                cursor: 'pointer',
                border: color === c ? '3px solid white' : 'none',
                boxShadow: color === c ? `0 0 0 2px ${c}` : 'none',
              }}
            />
          ))}
        </Box>
        <TextField
          margin="dense"
          label="Search icons"
          fullWidth
          value={iconSearch}
          onChange={e => setIconSearch(e.target.value)}
          sx={{ mb: 1 }}
        />
        <Card variant="outlined" sx={{ p: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {filteredIcons.map(([iconName, Icon]) => (
            <ToggleButton
              key={iconName}
              value={iconName}
              selected={icon === iconName}
              onClick={() => setIcon(iconName)}
              size="small"
            >
              <Icon fontSize="small" />
            </ToggleButton>
          ))}
        </Card>
      </DialogContent>
      <DialogActions>
        <Button onClick={dialogState.close}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!name.trim()}
          onClick={() => {
            void newList(name.trim(), icon, color);
            dialogState.close();
            reset();
          }}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
