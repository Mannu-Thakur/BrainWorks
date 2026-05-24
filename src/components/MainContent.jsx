import { Box, Toolbar } from '@mui/material';

import { useAppState } from '../providers/AppState.jsx';
import { VIEWS } from '../utils.js';
import { CalendarView } from './CalendarView.jsx';
import { Dashboard } from './Dashboard.jsx';
import { PomodoroTimer } from './PomodoroTimer.jsx';
import { TaskView } from './TaskView.jsx';

export function MainContent() {
  const { view, focusMode } = useAppState();

  let content = <TaskView />;
  if (view === VIEWS.dashboard) content = <Dashboard />;
  else if (view === VIEWS.pomodoro) content = <PomodoroTimer />;
  else if (view === VIEWS.calendar) content = <CalendarView />;

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: { xs: 2, md: 3 },
        width: focusMode ? '100%' : { md: `calc(100% - 280px)` },
        minHeight: '100vh',
        transition: 'width 0.2s',
      }}
    >
      <Toolbar />
      {content}
    </Box>
  );
}
