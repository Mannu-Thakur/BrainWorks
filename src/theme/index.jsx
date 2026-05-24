import { CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

const sharedTypography = {
  fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
  h4: { fontWeight: 700, letterSpacing: '-0.02em' },
  h5: { fontWeight: 700, letterSpacing: '-0.01em' },
  h6: { fontWeight: 600 },
  button: { textTransform: 'none', fontWeight: 600 },
};

const sharedShape = { borderRadius: 14 };

function glassPaper(mode) {
  return {
    backgroundImage:
      mode === 'dark'
        ? 'linear-gradient(145deg, rgba(30,41,59,0.92) 0%, rgba(15,23,42,0.88) 100%)'
        : 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
    backdropFilter: 'blur(20px)',
    border: `1px solid ${mode === 'dark' ? 'rgba(148,163,184,0.12)' : 'rgba(15,23,42,0.06)'}`,
    boxShadow:
      mode === 'dark'
        ? '0 8px 32px rgba(0,0,0,0.35)'
        : '0 8px 32px rgba(15,23,42,0.08)',
  };
}

export function createAppTheme(mode = 'dark') {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: { main: isDark ? '#818cf8' : '#4f46e5' },
      secondary: { main: isDark ? '#f472b6' : '#db2777' },
      background: {
        default: isDark ? '#0b0f1a' : '#f1f5f9',
        paper: isDark ? '#111827' : '#ffffff',
      },
      success: { main: '#22c55e' },
      warning: { main: '#f59e0b' },
      error: { main: '#ef4444' },
      divider: isDark ? 'rgba(148,163,184,0.12)' : 'rgba(15,23,42,0.08)',
    },
    typography: sharedTypography,
    shape: sharedShape,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            background: isDark
              ? 'radial-gradient(ellipse 120% 80% at 10% -20%, rgba(99,102,241,0.25) 0%, transparent 50%), radial-gradient(ellipse 80% 60% at 90% 110%, rgba(244,114,182,0.15) 0%, transparent 50%), #0b0f1a'
              : 'radial-gradient(ellipse 120% 80% at 10% -20%, rgba(99,102,241,0.12) 0%, transparent 50%), radial-gradient(ellipse 80% 60% at 90% 110%, rgba(244,114,182,0.08) 0%, transparent 50%), #f1f5f9',
            minHeight: '100vh',
          },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
      },
      MuiCard: {
        styleOverrides: {
          root: glassPaper(mode),
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            ...glassPaper(mode),
            borderRight: `1px solid ${isDark ? 'rgba(148,163,184,0.1)' : 'rgba(15,23,42,0.06)'}`,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            ...glassPaper(mode),
            boxShadow: 'none',
            borderBottom: `1px solid ${isDark ? 'rgba(148,163,184,0.1)' : 'rgba(15,23,42,0.06)'}`,
            backgroundColor: 'transparent',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 10 },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 500 },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            margin: '2px 8px',
            '&.Mui-selected': {
              background: isDark
                ? 'linear-gradient(90deg, rgba(99,102,241,0.35), rgba(129,140,248,0.15))'
                : 'linear-gradient(90deg, rgba(79,70,229,0.15), rgba(99,102,241,0.08))',
            },
          },
        },
      },
    },
  });
}

export function ThemeProvider({ mode, children }) {
  const theme = createAppTheme(mode);
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
