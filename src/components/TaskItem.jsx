import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Alarm,
  CalendarMonth,
  ChevronRight,
  DeleteOutline,
  DragIndicator,
  Repeat,
  Star,
  StarBorder,
} from '@mui/icons-material';
import {
  Box,
  Checkbox,
  Chip,
  IconButton,
  LinearProgress,
  Typography,
} from '@mui/material';
import { format, isPast, isToday, parseISO } from 'date-fns';

import { PRIORITIES } from '../utils.js';

function priorityMeta(value) {
  return Object.values(PRIORITIES).find(p => p.value === value) ?? PRIORITIES.none;
}

function formatDue(dueDate) {
  if (!dueDate) return null;
  try {
    const d = parseISO(dueDate);
    if (isToday(d)) return 'Today';
    return format(d, 'MMM d');
  } catch {
    return null;
  }
}

function isOverdue(dueDate, checked) {
  if (!dueDate || checked) return false;
  try {
    return isPast(parseISO(dueDate)) && !isToday(parseISO(dueDate));
  } catch {
    return false;
  }
}

export function TaskItem({
  item,
  isGlobal,
  onToggle,
  onDelete,
  onStar,
  onOpenDetail,
  dragHandle = false,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: !dragHandle });

  const priority = priorityMeta(item.priority);
  const dueLabel = formatDue(item.dueDate);
  const overdue = isOverdue(item.dueDate, item.checked);
  const subtasks = item.subtasks ?? [];
  const doneSub = subtasks.filter(s => s.done).length;
  const subProgress =
    subtasks.length > 0 ? (doneSub / subtasks.length) * 100 : 0;

  const style = dragHandle
    ? {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }
    : {};

  return (
    <Box
      ref={dragHandle ? setNodeRef : undefined}
      style={style}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 0.5,
        p: 1.5,
        mb: 1,
        borderRadius: 2,
        bgcolor: theme =>
          theme.palette.mode === 'dark'
            ? 'rgba(30,41,59,0.5)'
            : 'rgba(255,255,255,0.85)',
        border: theme => `1px solid ${theme.palette.divider}`,
        '&:hover': { borderColor: 'primary.main' },
      }}
    >
      {dragHandle && (
        <IconButton
          size="small"
          sx={{ cursor: 'grab', mt: 0.25 }}
          {...attributes}
          {...listeners}
        >
          <DragIndicator fontSize="small" />
        </IconButton>
      )}
      <Checkbox
        checked={item.checked ?? false}
        onChange={() => onToggle(item)}
        sx={{ mt: -0.5 }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }} onClick={() => onOpenDetail(item)}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            sx={{
              fontWeight: 600,
              textDecoration: item.checked ? 'line-through' : 'none',
              color: item.checked ? 'text.secondary' : 'text.primary',
              flex: 1,
            }}
          >
            {item.name}
          </Typography>
          <IconButton
            size="small"
            onClick={e => {
              e.stopPropagation();
              onStar(item);
            }}
          >
            {item.starred ? (
              <Star fontSize="small" sx={{ color: '#f59e0b' }} />
            ) : (
              <StarBorder fontSize="small" />
            )}
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
          {isGlobal && item.list && (
            <Chip
              size="small"
              label={item.list.name}
              sx={{ bgcolor: `${item.list.color}22`, color: item.list.color }}
            />
          )}
          {item.priority > 0 && (
            <Chip
              size="small"
              label={priority.label}
              sx={{ bgcolor: `${priority.color}22`, color: priority.color }}
            />
          )}
          {dueLabel && (
            <Chip
              size="small"
              icon={<CalendarMonth sx={{ fontSize: 14 }} />}
              label={dueLabel}
              color={overdue ? 'error' : 'default'}
              variant={overdue ? 'filled' : 'outlined'}
            />
          )}
          {item.reminderAt && (
            <Chip size="small" icon={<Alarm sx={{ fontSize: 14 }} />} label="Reminder" variant="outlined" />
          )}
          {item.recurrence && item.recurrence !== 'none' && (
            <Chip size="small" icon={<Repeat sx={{ fontSize: 14 }} />} label={item.recurrence} variant="outlined" />
          )}
          {(item.tags ?? []).map(tag => (
            <Chip key={tag} size="small" label={tag} variant="outlined" />
          ))}
        </Box>
        {subtasks.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <LinearProgress
              variant="determinate"
              value={subProgress}
              sx={{ height: 4, borderRadius: 2 }}
            />
            <Typography variant="caption" color="text.secondary">
              {doneSub}/{subtasks.length} subtasks
            </Typography>
          </Box>
        )}
      </Box>
      <IconButton size="small" onClick={() => onOpenDetail(item)}>
        <ChevronRight />
      </IconButton>
      <IconButton
        size="small"
        color="error"
        onClick={() => onDelete(item.id)}
      >
        <DeleteOutline fontSize="small" />
      </IconButton>
    </Box>
  );
}
