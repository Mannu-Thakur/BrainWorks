import { Pause, PlayArrow, RestartAlt, Timer } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useSettings } from '../hooks/useSettings.js';
import { useToast } from '../providers/NotificationProvider.jsx';
import { notifyUser } from '../services/notificationService.js';

export function PomodoroTimer() {
  const { data: settings } = useSettings();
  const { showToast } = useToast();
  const minutes = settings.pomodoroMinutes ?? 25;
  const totalSec = minutes * 60;

  const [secondsLeft, setSecondsLeft] = useState(totalSec);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);

  const reset = useCallback(() => {
    setSecondsLeft(totalSec);
    setRunning(false);
  }, [totalSec]);

  useEffect(() => {
    setSecondsLeft(totalSec);
  }, [totalSec]);

  useEffect(() => {
    if (!running) {
      clearInterval(intervalRef.current);
      return undefined;
    }
    intervalRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          setRunning(false);
          setSessions(n => n + 1);
          showToast('Pomodoro complete — take a break!');
          void notifyUser({
            title: 'Focus session done',
            body: `${minutes} minute session complete`,
            type: 'pomodoro',
            browser: settings.browserNotifications,
          });
          return totalSec;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, totalSec, minutes, showToast, settings.browserNotifications]);

  const pct = ((totalSec - secondsLeft) / totalSec) * 100;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        <Timer sx={{ verticalAlign: 'middle', mr: 1 }} />
        Pomodoro Focus
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Deep work in {minutes}-minute sprints — great for placement prep & study
      </Typography>
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography
            variant="h1"
            fontWeight={800}
            sx={{
              fontSize: { xs: '4rem', md: '5rem' },
              fontVariantNumeric: 'tabular-nums',
              background: 'linear-gradient(135deg, #818cf8, #f472b6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {mm}:{ss}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={pct}
            sx={{ my: 3, height: 8, borderRadius: 4 }}
          />
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={running ? <Pause /> : <PlayArrow />}
              onClick={() => setRunning(!running)}
            >
              {running ? 'Pause' : 'Start'}
            </Button>
            <Button variant="outlined" startIcon={<RestartAlt />} onClick={reset}>
              Reset
            </Button>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Sessions completed today: {sessions}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
