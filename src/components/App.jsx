import { Box } from '@mui/material';

import { useSettings } from '../hooks/useSettings.js';
import { AppState } from '../providers/AppState.jsx';
import { ThemeProvider } from '../theme/index.jsx';
import { AppHeader } from './AppHeader.jsx';
import { MainContent } from './MainContent.jsx';
import { Sidebar } from './Sidebar.jsx';
import { TaskDetailDrawer } from './TaskDetailDrawer.jsx';

function AppInner() {
  const { data } = useSettings();

  return (
    <ThemeProvider mode={data.themeMode ?? 'dark'}>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <AppHeader />
        <Sidebar />
        <MainContent />
        <TaskDetailDrawer />
      </Box>
    </ThemeProvider>
  );
}

export function App() {
  return (
    <AppState>
      <AppInner />
    </AppState>
  );
}
