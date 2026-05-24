import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Box, CircularProgress, Typography } from '@mui/material';

import { useTaskActions } from '../hooks/useTaskActions.js';
import { useAppState } from '../providers/AppState.jsx';
import { TaskItem } from './TaskItem.jsx';

export function SortableTaskList({
  items,
  isLoading,
  isGlobal,
  listActions,
  enableReorder,
}) {
  const { setDetailItemId } = useAppState();
  const { toggleTask, deleteTask, updateTask } = useTaskActions();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = event => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex(i => i.id === active.id);
    const newIndex = items.findIndex(i => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    void listActions.reorderItems(reordered);
  };

  const handleToggle = item => {
    void toggleTask(item);
  };

  const handleDelete = id => {
    if (isGlobal) {
      void deleteTask(id);
    } else {
      void listActions.deleteItem(id);
    }
  };

  const handleStar = item => {
    const patch = { starred: !item.starred };
    if (isGlobal) {
      void updateTask(item.id, patch);
    } else {
      void listActions.updateItem(item.id, patch);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!items.length) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          color: 'text.secondary',
          border: theme => `2px dashed ${theme.palette.divider}`,
          borderRadius: 3,
        }}
      >
        <Typography variant="h6" gutterBottom>
          No tasks here
        </Typography>
        <Typography variant="body2">
          Add a task above or adjust your filters
        </Typography>
      </Box>
    );
  }

  const content = items.map(item => (
    <TaskItem
      key={item.id}
      item={item}
      isGlobal={isGlobal}
      onToggle={handleToggle}
      onDelete={handleDelete}
      onStar={handleStar}
      onOpenDetail={() => setDetailItemId(item.id)}
      dragHandle={enableReorder}
    />
  ));

  if (!enableReorder) {
    return <Box>{content}</Box>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
        {content}
      </SortableContext>
    </DndContext>
  );
}
