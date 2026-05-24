import { CenterFocusStrong, CloseFullscreen } from '@mui/icons-material';
import { Fab, Tooltip, Zoom } from '@mui/material';

import { useAppState } from '../providers/AppState.jsx';

export function FocusModeFab() {
  const { focusMode, setFocusMode } = useAppState();

  return (
    <Zoom in>
      <Tooltip title={focusMode ? 'Exit focus mode (Ctrl+F)' : 'Focus mode (Ctrl+F)'}>
        <Fab
          color={focusMode ? 'secondary' : 'primary'}
          sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1300 }}
          onClick={() => setFocusMode(!focusMode)}
        >
          {focusMode ? <CloseFullscreen /> : <CenterFocusStrong />}
        </Fab>
      </Tooltip>
    </Zoom>
  );
}
