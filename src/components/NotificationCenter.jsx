import {
  CheckCircleOutline,
  DeleteSweep,
  Notifications,
  NotificationsActive,
} from '@mui/icons-material';
import {
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Menu,
  Typography,
} from '@mui/material';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { useState } from 'react';

import { useNotifications } from '../hooks/useNotifications.js';
import { useSettings } from '../hooks/useSettings.js';
import { requestNotificationPermission } from '../services/notificationService.js';

export function NotificationCenter() {
  const [anchor, setAnchor] = useState(null);
  const { data, unreadCount, markRead, markAllRead, clearAll } =
    useNotifications();
  const { data: settings, setSetting } = useSettings();

  const open = Boolean(anchor);

  return (
    <>
      <IconButton color="inherit" onClick={e => setAnchor(e.currentTarget)}>
        <Badge badgeContent={unreadCount} color="error">
          <Notifications />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        PaperProps={{ sx: { width: 360, maxHeight: 480 } }}
      >
        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotificationsActive color="primary" />
          <Typography fontWeight={700} flex={1}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={() => markAllRead()}>
              Mark all read
            </Button>
          )}
        </Box>
        <Divider />
        {data.length === 0 ? (
          <Typography sx={{ p: 2 }} color="text.secondary" variant="body2">
            No notifications yet. Enable reminders on tasks to get alerts.
          </Typography>
        ) : (
          <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
            {data.map(n => (
              <ListItem
                key={n.id}
                sx={{
                  bgcolor: n.read ? 'transparent' : 'action.hover',
                  cursor: 'pointer',
                }}
                onClick={() => !n.read && markRead(n.id)}
              >
                <ListItemText
                  primary={n.title}
                  secondary={
                    <>
                      {n.body}
                      <Typography component="span" variant="caption" display="block">
                        {formatDistanceToNow(parseISO(n.createdAt), {
                          addSuffix: true,
                        })}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
        <Divider />
        <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            size="small"
            startIcon={<CheckCircleOutline />}
            onClick={async () => {
              const p = await requestNotificationPermission();
              if (p === 'granted') {
                await setSetting('browserNotifications', true);
              }
            }}
          >
            Enable browser alerts
          </Button>
          <Button
            size="small"
            color="inherit"
            startIcon={<DeleteSweep />}
            onClick={() => clearAll()}
          >
            Clear history
          </Button>
          <Typography variant="caption" color="text.secondary">
            In-app + browser · Digest at {settings.dailyDigestHour ?? 9}:00
          </Typography>
        </Box>
      </Menu>
    </>
  );
}
