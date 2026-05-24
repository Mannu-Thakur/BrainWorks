import { Box } from '@mui/material';

import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts.js';
import { useReminderScheduler } from '../hooks/useReminderScheduler.js';
import { useSettings } from '../hooks/useSettings.js';
import { AppState, useAppState } from '../providers/AppState.jsx';
import { NotificationProvider } from '../providers/NotificationProvider.jsx';
import { ThemeProvider } from '../theme/index.jsx';
import { VIEWS } from '../utils.js';
import { AppHeader } from './AppHeader.jsx';
import { CommandPalette } from './CommandPalette.jsx';
import { FocusModeFab } from './FocusModeFab.jsx';
import { MainContent } from './MainContent.jsx';
import { Sidebar } from './Sidebar.jsx';
import { TaskDetailDrawer } from './TaskDetailDrawer.jsx';

function AppShell() {
  const { data } = useSettings();
  const {
    focusMode,
    setFocusMode,
    commandPaletteOpen,
    setCommandPaletteOpen,
    openView,
  } = useAppState();

  useReminderScheduler();

  useKeyboardShortcuts({
    onCommandPalette: () => setCommandPaletteOpen(true),
    onToggleFocus: () => setFocusMode(f => !f),
    onQuickAdd: () => openView(VIEWS.all),
  });

  return (
    <ThemeProvider mode={data.themeMode ?? 'dark'}>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <AppHeader />
        {!focusMode && <Sidebar />}
        <MainContent />
        <TaskDetailDrawer />
        <FocusModeFab />
        <CommandPalette
          open={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
        />
      </Box>
    </ThemeProvider>
  );
}

function AppInner() {
  return <AppShell />;
}

export function App() {
  return (
    <AppState>
      <NotificationProvider>
        <AppInner />
      </NotificationProvider>
    </AppState>
  );
}
