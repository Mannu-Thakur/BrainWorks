import { Download, Notifications, Upload } from '@mui/icons-material';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Typography,
} from '@mui/material';
import { useRef } from 'react';
import { useSWRConfig } from 'swr';

import { useSettings } from '../hooks/useSettings.js';
import { requestNotificationPermission } from '../services/notificationService.js';
import { APIs, exportData, putter } from '../utils.js';

export function SettingsDialog({ dialogState }) {
  const fileRef = useRef(null);
  const { mutate } = useSWRConfig();
  const { data: settings, setSetting } = useSettings();

  const handleExport = async () => {
    const data = await exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-tasks-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await putter({ url: APIs.Import, data });
      await mutate(() => true, undefined, { revalidate: true });
      dialogState.close();
    } catch {
      window.alert('Invalid backup file. Please select a valid JSON export.');
    }
    event.target.value = '';
  };

  const enableBrowser = async () => {
    const p = await requestNotificationPermission();
    if (p === 'granted') {
      await setSetting('browserNotifications', true);
    }
  };

  return (
    <Dialog open={dialogState.isOpen} onClose={dialogState.close} maxWidth="sm" fullWidth>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, display: 'flex', gap: 1 }}>
          <Notifications fontSize="small" /> Notifications
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={settings.notificationsEnabled !== false}
              onChange={e => setSetting('notificationsEnabled', e.target.checked)}
            />
          }
          label="In-app notifications"
        />
        <FormControlLabel
          control={
            <Switch
              checked={settings.browserNotifications !== false}
              onChange={e => setSetting('browserNotifications', e.target.checked)}
            />
          }
          label="Browser push notifications"
        />
        <Button size="small" onClick={enableBrowser} sx={{ mb: 1, display: 'block' }}>
          Request browser permission
        </Button>
        <FormControlLabel
          control={
            <Switch
              checked={settings.soundEnabled !== false}
              onChange={e => setSetting('soundEnabled', e.target.checked)}
            />
          }
          label="Sound on reminders"
        />
        <FormControl fullWidth size="small" sx={{ mt: 1, mb: 2 }}>
          <InputLabel>Daily digest hour</InputLabel>
          <Select
            label="Daily digest hour"
            value={settings.dailyDigestHour ?? 9}
            onChange={e => setSetting('dailyDigestHour', Number(e.target.value))}
          >
            {[6, 7, 8, 9, 10, 12, 18].map(h => (
              <MenuItem key={h} value={h}>
                {h}:00
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth size="small" sx={{ mb: 3 }}>
          <InputLabel>Pomodoro length (minutes)</InputLabel>
          <Select
            label="Pomodoro length (minutes)"
            value={settings.pomodoroMinutes ?? 25}
            onChange={e => setSetting('pomodoroMinutes', Number(e.target.value))}
          >
            {[15, 20, 25, 30, 45, 50].map(m => (
              <MenuItem key={m} value={m}>
                {m} min
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant="body2" color="text.secondary" paragraph>
          Data is stored locally in this browser. Export regularly to keep a backup.
        </Typography>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Download />}
          onClick={handleExport}
          sx={{ mb: 1 }}
        >
          Export all data (JSON)
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          hidden
          onChange={handleImport}
        />
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Upload />}
          onClick={() => fileRef.current?.click()}
        >
          Import backup
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={dialogState.close}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
