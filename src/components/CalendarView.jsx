import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Typography,
} from '@mui/material';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { useMemo, useState } from 'react';

import { useAllTasks } from '../hooks/useAllTasks.js';
import { useAppState } from '../providers/AppState.jsx';

export function CalendarView() {
  const [month, setMonth] = useState(new Date());
  const { data: tasks } = useAllTasks();
  const { setDetailItemId, openList } = useAppState();

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    return eachDayOfInterval({ start, end });
  }, [month]);

  const tasksByDay = useMemo(() => {
    const map = {};
    for (const t of tasks) {
      if (!t.dueDate) continue;
      try {
        const key = format(parseISO(t.dueDate), 'yyyy-MM-dd');
        if (!map[key]) map[key] = [];
        map[key].push(t);
      } catch {
        /* skip */
      }
    }
    return map;
  }, [tasks]);

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => setMonth(subMonths(month, 1))}>
          <ChevronLeft />
        </IconButton>
        <Typography variant="h5" fontWeight={800} sx={{ flex: 1, textAlign: 'center' }}>
          {format(month, 'MMMM yyyy')}
        </Typography>
        <IconButton onClick={() => setMonth(addMonths(month, 1))}>
          <ChevronRight />
        </IconButton>
      </Box>
      <Grid container spacing={0.5}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <Grid item xs={12 / 7} key={d}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', textAlign: 'center', py: 0.5 }}
            >
              {d}
            </Typography>
          </Grid>
        ))}
        {days.map(day => {
          const key = format(day, 'yyyy-MM-dd');
          const dayTasks = tasksByDay[key] ?? [];
          const isToday = isSameDay(day, new Date());
          return (
            <Grid item xs={12 / 7} key={key}>
              <Card
                variant="outlined"
                sx={{
                  minHeight: 88,
                  opacity: isSameMonth(day, month) ? 1 : 0.35,
                  borderColor: isToday ? 'primary.main' : 'divider',
                  borderWidth: isToday ? 2 : 1,
                }}
              >
                <CardContent sx={{ p: 0.75, '&:last-child': { pb: 0.75 } }}>
                  <Typography variant="caption" fontWeight={isToday ? 700 : 400}>
                    {format(day, 'd')}
                  </Typography>
                  {dayTasks.slice(0, 2).map(t => (
                    <Chip
                      key={t.id}
                      label={t.name}
                      size="small"
                      sx={{
                        mt: 0.25,
                        width: '100%',
                        height: 20,
                        fontSize: 10,
                        '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' },
                      }}
                      onClick={() => {
                        openList(t.listId);
                        setDetailItemId(t.id);
                      }}
                    />
                  ))}
                  {dayTasks.length > 2 && (
                    <Typography variant="caption" color="text.secondary">
                      +{dayTasks.length - 2} more
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
