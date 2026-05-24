import { useEffect } from 'react';

import { useAppState } from '../providers/AppState.jsx';
import { VIEWS } from '../utils.js';

export function useKeyboardShortcuts({
  onCommandPalette,
  onToggleFocus,
  onQuickAdd,
}) {
  const { openView, setSearch } = useAppState();

  useEffect(() => {
    const handler = e => {
      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.key === 'k') {
        e.preventDefault();
        onCommandPalette?.();
        return;
      }

      if (mod && e.key === '/') {
        e.preventDefault();
        onQuickAdd?.();
        return;
      }

      if (mod && e.key === 'f') {
        e.preventDefault();
        onToggleFocus?.();
        return;
      }

      if (mod && !e.shiftKey) {
        if (e.key === '1') {
          e.preventDefault();
          openView(VIEWS.dashboard);
        } else if (e.key === '2') {
          e.preventDefault();
          openView(VIEWS.today);
        } else if (e.key === '3') {
          e.preventDefault();
          openView(VIEWS.pomodoro);
        }
      }

      if (e.key === 'Escape') {
        setSearch('');
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCommandPalette, onToggleFocus, onQuickAdd, openView, setSearch]);
}
