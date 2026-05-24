import {
  Add,
  DarkMode,
  LightMode,
  Menu as MenuIcon,
  Search,
  Settings,
  Terminal,
} from '@mui/icons-material';
import {
  AppBar,
  Box,
  IconButton,
  InputAdornment,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import { usePopupState } from 'material-ui-popup-state/hooks';

import { useSettings } from '../hooks/useSettings.js';
import { useAppState } from '../providers/AppState.jsx';
import { NewListDialog } from './NewListDialog.jsx';
import { NotificationCenter } from './NotificationCenter.jsx';
import { SettingsDialog } from './SettingsDialog.jsx';

export function AppHeader() {
  const dialogState = usePopupState({ variant: 'dialog', popupId: 'new-list' });
  const settingsState = usePopupState({
    variant: 'dialog',
    popupId: 'settings',
  });
  const { search, setSearch, sidebarOpen, setSidebarOpen, setCommandPaletteOpen } =
    useAppState();
  const { data, setSetting } = useSettings();
  const isDark = (data.themeMode ?? 'dark') === 'dark';

  return (
    <>
      <NewListDialog dialogState={dialogState} />
      <SettingsDialog dialogState={settingsState} />
      <AppBar position="fixed" sx={{ zIndex: theme => theme.zIndex.drawer + 2 }}>
        <Toolbar sx={{ gap: 1 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(90deg, #818cf8, #f472b6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mr: 1,
              display: { xs: 'none', sm: 'block' },
            }}
          >
            Nexus Tasks
          </Typography>
          <TextField
            size="small"
            placeholder="Search tasks, tags, notes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{
              flexGrow: 1,
              maxWidth: 480,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: theme =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(15,23,42,0.5)'
                    : 'rgba(255,255,255,0.7)',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ flexGrow: 1, display: { xs: 'block', sm: 'none' } }} />
          <IconButton
            color="inherit"
            title="Command palette (Ctrl+K)"
            onClick={() => setCommandPaletteOpen(true)}
            sx={{ display: { xs: 'none', md: 'inline-flex' } }}
          >
            <Terminal fontSize="small" />
          </IconButton>
          <NotificationCenter />
          <IconButton
            color="inherit"
            aria-label="toggle theme"
            onClick={() => setSetting('themeMode', isDark ? 'light' : 'dark')}
          >
            {isDark ? <LightMode /> : <DarkMode />}
          </IconButton>
          <IconButton color="inherit" onClick={settingsState.open}>
            <Settings />
          </IconButton>
          <IconButton
            color="inherit"
            aria-label="new list"
            onClick={dialogState.open}
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            <Add />
          </IconButton>
        </Toolbar>
      </AppBar>
    </>
  );
}
