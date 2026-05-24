import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from '@mui/material';

import {
  collectAllTags,
  FILTER_MODES,
  SORT_MODES,
} from '../hooks/useTaskFilters.js';
import { useAppState } from '../providers/AppState.jsx';
import { PRIORITIES } from '../utils.js';

export function TaskFilters({ items }) {
  const {
    filter,
    setFilter,
    sort,
    setSort,
    priorityFilter,
    setPriorityFilter,
    tagFilter,
    setTagFilter,
  } = useAppState();

  const tags = collectAllTags(items);

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}
      useFlexGap
    >
      <FormControl size="small" sx={{ minWidth: 110 }}>
        <InputLabel>Status</InputLabel>
        <Select
          label="Status"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <MenuItem value={FILTER_MODES.all}>All</MenuItem>
          <MenuItem value={FILTER_MODES.active}>Active</MenuItem>
          <MenuItem value={FILTER_MODES.completed}>Done</MenuItem>
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Sort</InputLabel>
        <Select label="Sort" value={sort} onChange={e => setSort(e.target.value)}>
          <MenuItem value={SORT_MODES.manual}>Manual</MenuItem>
          <MenuItem value={SORT_MODES.priority}>Priority</MenuItem>
          <MenuItem value={SORT_MODES.dueDate}>Due date</MenuItem>
          <MenuItem value={SORT_MODES.name}>Name</MenuItem>
          <MenuItem value={SORT_MODES.created}>Created</MenuItem>
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 110 }}>
        <InputLabel>Priority</InputLabel>
        <Select
          label="Priority"
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
        >
          <MenuItem value="">Any</MenuItem>
          {Object.entries(PRIORITIES)
            .filter(([, p]) => p.value > 0)
            .map(([, p]) => (
              <MenuItem key={p.value} value={p.value}>
                {p.label}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
      {tags.length > 0 && (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
          {tags.slice(0, 8).map(tag => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              variant={tagFilter === tag ? 'filled' : 'outlined'}
              color={tagFilter === tag ? 'primary' : 'default'}
              onClick={() => setTagFilter(tagFilter === tag ? '' : tag)}
            />
          ))}
        </Box>
      )}
    </Stack>
  );
}
