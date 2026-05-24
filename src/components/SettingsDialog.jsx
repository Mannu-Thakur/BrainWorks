import { Download, Upload } from '@mui/icons-material';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { useRef } from 'react';
import { useSWRConfig } from 'swr';

import { APIs, exportData, putter } from '../utils.js';

export function SettingsDialog({ dialogState }) {
  const fileRef = useRef(null);
  const { mutate } = useSWRConfig();

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

  return (
    <Dialog open={dialogState.isOpen} onClose={dialogState.close} maxWidth="sm" fullWidth>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" paragraph>
          Your data is stored locally in this browser. Export regularly to keep a
          backup.
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
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
          Import replaces all current lists and tasks.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={dialogState.close}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
