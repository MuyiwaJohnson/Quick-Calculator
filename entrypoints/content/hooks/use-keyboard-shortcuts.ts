import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsProps {
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  isEnabled: boolean;
}

export const useKeyboardShortcuts = ({
  onUndo,
  onRedo,
  onReset,
  isEnabled,
}: KeyboardShortcutsProps) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isEnabled) return;

      // Ctrl+Z for undo
      if (event.ctrlKey && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        onUndo();
        return;
      }

      // Ctrl+Y or Ctrl+Shift+Z for redo
      if ((event.ctrlKey && event.key === 'y') || (event.ctrlKey && event.shiftKey && event.key === 'z')) {
        event.preventDefault();
        onRedo();
        return;
      }

      // Ctrl+R for reset
      if (event.ctrlKey && event.key === 'r') {
        event.preventDefault();
        onReset();
        return;
      }
    },
    [isEnabled, onUndo, onRedo, onReset]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}; 