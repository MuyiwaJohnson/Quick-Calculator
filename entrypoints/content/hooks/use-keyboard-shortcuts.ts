import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsProps {
  onUndo: () => void;
  onReset: () => void;
  isEnabled: boolean;
}

export const useKeyboardShortcuts = ({
  onUndo,
  onReset,
  isEnabled,
}: KeyboardShortcutsProps) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isEnabled) return;

      // Ctrl+Z for undo
      if (event.ctrlKey && event.key === 'z') {
        event.preventDefault();
        onUndo();
        return;
      }

      // Ctrl+R for reset
      if (event.ctrlKey && event.key === 'r') {
        event.preventDefault();
        onReset();
        return;
      }
    },
    [isEnabled, onUndo, onReset]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}; 