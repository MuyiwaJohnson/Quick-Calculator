import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsProps {
  onEscape: () => void;
  onUndo: () => void;
  onReset: () => void;
  isEnabled: boolean;
  showToast: (message: string, type: 'success' | 'info' | 'warning') => void;
  onShortcutPress: (shortcut: string) => void;
  onOperationChange: (operation: string) => void;
  onCopyTotal: () => void;
  onShowCalculator: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onToggleFollowCursor?: () => void;
}

export const useKeyboardShortcuts = ({
  onEscape,
  onUndo,
  onReset,
  isEnabled,
  showToast,
  onShortcutPress,
  onOperationChange,
  onCopyTotal,
  onShowCalculator,
  onExportCSV,
  onExportJSON,
  onToggleFollowCursor,
}: KeyboardShortcutsProps) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isEnabled) return;

      // Escape key
      if (event.key === 'Escape') {
        event.preventDefault();
        onShortcutPress('Escape');
        onEscape();
        return;
      }

      // Ctrl+Shift+C to show calculator
      if (event.ctrlKey && event.shiftKey && event.key === 'C') {
        event.preventDefault();
        onShortcutPress('Ctrl+Shift+C');
        onShowCalculator();
        return;
      }

      // Ctrl+Shift+F to toggle follow cursor
      if (event.ctrlKey && event.shiftKey && (event.key === 'F' || event.key === 'f')) {
        event.preventDefault();
        onShortcutPress('Ctrl+Shift+F');
        onToggleFollowCursor && onToggleFollowCursor();
        return;
      }

      // Ctrl+Z for undo
      if (event.ctrlKey && event.key === 'z') {
        event.preventDefault();
        onShortcutPress('Ctrl+Z');
        onUndo();
        return;
      }

      // Ctrl+R for reset
      if (event.ctrlKey && event.key === 'r') {
        event.preventDefault();
        onShortcutPress('Ctrl+R');
        onReset();
        return;
      }

      // Ctrl+C for copy total
      if (event.ctrlKey && event.key === 'c' && !event.shiftKey) {
        event.preventDefault();
        onShortcutPress('Ctrl+C');
        onCopyTotal();
        return;
      }

      // Ctrl+E for export CSV
      if (event.ctrlKey && event.key === 'e' && !event.shiftKey) {
        event.preventDefault();
        onShortcutPress('Ctrl+E');
        onExportCSV();
        return;
      }

      // Ctrl+Shift+E for export JSON
      if (event.ctrlKey && event.shiftKey && event.key === 'E') {
        event.preventDefault();
        onShortcutPress('Ctrl+Shift+E');
        onExportJSON();
        return;
      }

      // Operation shortcuts
      if (!event.ctrlKey && !event.altKey) {
        switch (event.key) {
          case '+':
            event.preventDefault();
            onShortcutPress('+');
            onOperationChange('+');
            break;
          case '-':
            event.preventDefault();
            onShortcutPress('-');
            onOperationChange('-');
            break;
          case '*':
          case 'x':
          case 'X':
            event.preventDefault();
            onShortcutPress('×');
            onOperationChange('×');
            break;
          case '/':
            event.preventDefault();
            onShortcutPress('÷');
            onOperationChange('÷');
            break;
          case '%':
            event.preventDefault();
            onShortcutPress('%');
            onOperationChange('%');
            break;
          default:
            if (event.shiftKey && event.key === '8') {
              event.preventDefault();
              onShortcutPress('×');
              onOperationChange('×');
            }
            break;
        }
      }
    },
    [
      isEnabled,
      onEscape,
      onUndo,
      onReset,
      onShortcutPress,
      onOperationChange,
      onCopyTotal,
      onShowCalculator,
      onExportCSV,
      onExportJSON,
      onToggleFollowCursor,
    ]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}; 