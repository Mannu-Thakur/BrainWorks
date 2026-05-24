import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { FILTER_MODES, SORT_MODES } from '../hooks/useTaskFilters.js';
import { VIEWS } from '../utils.js';

const AppStateContext = createContext(null);

export function AppState({ children }) {
  const [currentList, setCurrentList] = useState(null);
  const [view, setView] = useState(VIEWS.dashboard);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(FILTER_MODES.all);
  const [sort, setSort] = useState(SORT_MODES.manual);
  const [priorityFilter, setPriorityFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [detailItemId, setDetailItemId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const openList = useCallback(listId => {
    setCurrentList(listId);
    setView(VIEWS.list);
    setDetailItemId(null);
  }, []);

  const openView = useCallback(newView => {
    setView(newView);
    setDetailItemId(null);
    if (newView !== VIEWS.list) {
      setCurrentList(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      currentList,
      setCurrentList,
      view,
      setView,
      openList,
      openView,
      search,
      setSearch,
      filter,
      setFilter,
      sort,
      setSort,
      priorityFilter,
      setPriorityFilter,
      tagFilter,
      setTagFilter,
      detailItemId,
      setDetailItemId,
      sidebarOpen,
      setSidebarOpen,
    }),
    [
      currentList,
      view,
      openList,
      openView,
      search,
      filter,
      sort,
      priorityFilter,
      tagFilter,
      detailItemId,
      sidebarOpen,
    ]
  );

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppState');
  }
  return context;
}
