import * as Icons from '@mui/icons-material';
import {
  CalendarMonth,
  Dashboard,
  DeleteOutline,
  Star,
  Timer,
  Today,
  ViewList,
  WbSunny,
} from '@mui/icons-material';
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useEffect } from 'react';

import { useTodoLists } from '../hooks/useTodoLists.js';
import { useAppState } from '../providers/AppState.jsx';
import { VIEWS } from '../utils.js';

const NAV_ITEMS = [
  { view: VIEWS.dashboard, label: 'Dashboard', icon: Dashboard },
  { view: VIEWS.today, label: 'Today', icon: Today },
  { view: VIEWS.upcoming, label: 'Upcoming', icon: WbSunny },
  { view: VIEWS.starred, label: 'Starred', icon: Star },
  { view: VIEWS.all, label: 'All Tasks', icon: ViewList },
  { view: VIEWS.calendar, label: 'Calendar', icon: CalendarMonth },
  { view: VIEWS.pomodoro, label: 'Pomodoro', icon: Timer },
];

const DRAWER_WIDTH = 280;

export function Sidebar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { data: lists, deleteList } = useTodoLists();
  const {
    currentList,
    view,
    openList,
    openView,
    sidebarOpen,
    setSidebarOpen,
  } = useAppState();

  useEffect(() => {
    if (view === VIEWS.list && !currentList && lists[0]?.id) {
      openList(lists[0].id);
    }
  }, [view, currentList, lists, openList]);

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar />
      <Typography
        variant="overline"
        sx={{ px: 2, py: 1, color: 'text.secondary', fontWeight: 700 }}
      >
        Views
      </Typography>
      <List dense>
        {NAV_ITEMS.map(({ view: v, label, icon: Icon }) => (
          <ListItem key={v} disablePadding>
            <ListItemButton
              selected={view === v}
              onClick={() => {
                openView(v);
                if (isMobile) setSidebarOpen(false);
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Typography
        variant="overline"
        sx={{ px: 2, py: 1, color: 'text.secondary', fontWeight: 700 }}
      >
        My Lists
      </Typography>
      <List dense sx={{ flex: 1, overflow: 'auto' }}>
        {lists.map(list => {
          const Icon = Icons[list.icon] ?? Icons.List;
          return (
            <ListItem
              key={list.id}
              disablePadding
              secondaryAction={
                <IconButton
                  edge="end"
                  size="small"
                  aria-label="delete list"
                  onClick={e => {
                    e.stopPropagation();
                    if (
                      window.confirm(
                        `Delete "${list.name}" and all its tasks?`
                      )
                    ) {
                      void deleteList(list.id);
                    }
                  }}
                >
                  <DeleteOutline fontSize="small" />
                </IconButton>
              }
            >
              <ListItemButton
                selected={view === VIEWS.list && currentList === list.id}
                onClick={() => {
                  openList(list.id);
                  if (isMobile) setSidebarOpen(false);
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: `${list.color}22`,
                      color: list.color,
                    }}
                  >
                    <Icon fontSize="small" />
                  </Box>
                </ListItemIcon>
                <ListItemText primary={list.name} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sx={{
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        {drawer}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: sidebarOpen ? DRAWER_WIDTH : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
      open={sidebarOpen}
    >
      {drawer}
    </Drawer>
  );
}
