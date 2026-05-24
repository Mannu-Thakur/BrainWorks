import {
  CheckCircle,
  ListAlt,
  Schedule,
  Star,
  TrendingUp,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Typography,
} from '@mui/material';
import { format, isBefore, parseISO, startOfDay } from 'date-fns';

import { useAllTasks } from '../hooks/useAllTasks.js';
import {
  getStarredTasks,
  getTodayTasks,
  getUpcomingTasks,
} from '../hooks/useTaskFilters.js';
import { useTodoLists } from '../hooks/useTodoLists.js';
import { useAppState } from '../providers/AppState.jsx';
import { VIEWS } from '../utils.js';

function StatCard({ icon: Icon, label, value, color, onClick }) {
  return (
    <Card
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s',
        '&:hover': onClick ? { transform: 'translateY(-2px)' } : {},
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: `${color}22`,
              color,
            }}
          >
            <Icon />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight={800}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const { data: allTasks } = useAllTasks();
  const { data: lists } = useTodoLists();
  const { openView } = useAppState();

  const active = allTasks.filter(t => !t.checked);
  const completed = allTasks.filter(t => t.checked);
  const today = getTodayTasks(allTasks);
  const upcoming = getUpcomingTasks(allTasks);
  const starred = getStarredTasks(allTasks);
  const overdue = active.filter(t => {
    if (!t.dueDate) return false;
    try {
      return isBefore(parseISO(t.dueDate), startOfDay(new Date()));
    } catch {
      return false;
    }
  });
  const progress =
    allTasks.length > 0
      ? Math.round((completed.length / allTasks.length) * 100)
      : 0;

  const recent = [...active]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 5);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Your productivity command center — {format(new Date(), 'EEEE, MMMM d')}
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={ListAlt}
            label="Active tasks"
            value={active.length}
            color="#818cf8"
            onClick={() => openView(VIEWS.all)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={Schedule}
            label="Due today"
            value={today.length}
            color="#f59e0b"
            onClick={() => openView(VIEWS.today)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={Star}
            label="Starred"
            value={starred.length}
            color="#f472b6"
            onClick={() => openView(VIEWS.starred)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={CheckCircle}
            label="Completed"
            value={completed.length}
            color="#22c55e"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6" fontWeight={700}>
                  <TrendingUp sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Completion rate
                </Typography>
                <Typography variant="h6" color="primary">
                  {progress}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {lists.length} lists · {upcoming.length} upcoming ·{' '}
                {overdue.length} overdue
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Recently updated
              </Typography>
              {recent.length === 0 ? (
                <Typography color="text.secondary">
                  No active tasks yet. Create a list and add your first task!
                </Typography>
              ) : (
                recent.map(task => (
                  <Box
                    key={task.id}
                    sx={{
                      py: 1,
                      borderBottom: theme => `1px solid ${theme.palette.divider}`,
                      '&:last-child': { border: 0 },
                    }}
                  >
                    <Typography fontWeight={600}>{task.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {task.list?.name}
                      {task.dueDate &&
                        ` · Due ${format(parseISO(task.dueDate), 'MMM d')}`}
                    </Typography>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Quick insights
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <InsightRow label="Lists" value={lists.length} />
                <InsightRow label="Total tasks" value={allTasks.length} />
                <InsightRow label="Due this week" value={upcoming.length} />
                <InsightRow label="Overdue" value={overdue.length} danger />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

function InsightRow({ label, value, danger }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Typography color="text.secondary">{label}</Typography>
      <Typography fontWeight={700} color={danger ? 'error.main' : 'text.primary'}>
        {value}
      </Typography>
    </Box>
  );
}
