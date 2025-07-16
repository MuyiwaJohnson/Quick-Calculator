import React, { useCallback, useMemo, useState } from 'react';
import { useCalculator } from '../hooks/use-calculator';
import { useCursorPosition } from '../hooks/use-cursor-pos';
import { useDoubleClickCapture } from '../hooks/use-dbl-capture';
import { useKeyboardShortcuts } from '../hooks/use-keyboard-shortcuts';
import { useToast, ToastContainer } from '../hooks/use-toast';
import { CursorShadow } from '../components/cursor-shadow';
import type { CursorMateProps, CalculatorOperation } from '../types';

export const CursorMate: React.FC<CursorMateProps> = ({
  config = {},
  onTotalChange,
  onHistoryChange,
  onOperationChange,
  children,
  className = ''
}) => {
  const {
    total,
    history,
    currentOperation,
    isCalculatorVisible,
    addNumber,
    setOperation,
    reset,
    undo,
    show,
    hide,
    copyTotal,
    exportToCSV,
    exportToJSON
  } = useCalculator(config);

  const { x, y } = useCursorPosition();
  const { toasts, showToast, removeToast } = useToast();
  const [followCursor, setFollowCursor] = useState(true);

  const operationLabels = useMemo(() => ({
    '+': 'added',
    '-': 'subtracted',
    '×': 'multiplied by',
    '÷': 'divided by',
    '%': 'percentage of'
  }), []);

  const getOperationLabel = useCallback((operation: string): string => {
    return operationLabels[operation as keyof typeof operationLabels] || 'added';
  }, [operationLabels]);

  const handleNumberCapture = useCallback((val: number) => {
    addNumber(val);
    showToast(`${getOperationLabel(currentOperation)} ${config.currency || '₦'}${val.toLocaleString()}`, 'success');
  }, [addNumber, currentOperation, getOperationLabel, showToast, config.currency]);

  const handleOperationChange = useCallback((operation: string) => {
    const validOperations: CalculatorOperation[] = ['+', '-', '×', '÷', '%'];
    if (validOperations.includes(operation as CalculatorOperation)) {
      setOperation(operation as CalculatorOperation);
    }
  }, [setOperation]);

  const handleShortcutPress = useCallback((shortcut: string) => {
    // Optional: Add visual feedback for shortcut presses
    console.log(`Shortcut pressed: ${shortcut}`);
  }, []);

  const toggleFollowCursor = useCallback(() => {
    setFollowCursor(f => {
      showToast(f ? 'Calculator is now fixed in place.' : 'Calculator will now follow the cursor.', 'info');
      return !f;
    });
  }, [showToast]);

  useDoubleClickCapture(handleNumberCapture);

  useKeyboardShortcuts({
    onEscape: hide,
    onUndo: undo,
    onReset: reset,
    isEnabled: true,
    showToast,
    onShortcutPress: handleShortcutPress,
    onOperationChange: handleOperationChange,
    onCopyTotal: copyTotal,
    onShowCalculator: show,
    onExportCSV: exportToCSV,
    onExportJSON: exportToJSON,
    onToggleFollowCursor: toggleFollowCursor,
  });

  React.useEffect(() => {
    onTotalChange?.(total);
  }, [total, onTotalChange]);

  React.useEffect(() => {
    onHistoryChange?.(history);
  }, [history, onHistoryChange]);

  React.useEffect(() => {
    onOperationChange?.(currentOperation);
  }, [currentOperation, onOperationChange]);

  return (
    <div className={className}>
      {children}
      <CursorShadow
        x={x}
        y={y}
        total={total}
        history={history}
        isVisible={isCalculatorVisible}
        onOperation={handleOperationChange}
        currentOperation={currentOperation}
        onCopy={copyTotal}
        followCursor={followCursor}
      />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}; 