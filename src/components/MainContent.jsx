import { Box, Toolbar } from '@mui/material';

import { useAppState } from '../providers/AppState.jsx';
import { VIEWS } from '../utils.js';
import { Dashboard } from './Dashboard.jsx';
import { TaskView } from './TaskView.jsx';

export function MainContent() {
  const { view } = useAppState();

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: { xs: 2, md: 3 },
        width: { md: `calc(100% - 280px)` },
        minHeight: '100vh',
      }}
    >
      <Toolbar />
      {view === VIEWS.dashboard ? <Dashboard /> : <TaskView />}
    </Box>
  );
}
