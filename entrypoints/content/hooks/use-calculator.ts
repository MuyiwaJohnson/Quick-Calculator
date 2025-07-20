import { useState, useCallback, useMemo, useRef } from "react";
import type {
  CalculatorConfig,
  CalculatorHistory,
  CalculatorOperation,
  UseCalculatorReturn,
} from "../../../types";
import { checkOverflow } from "../utils/utils";

export const useCalculator = (
  config: CalculatorConfig = {}
): UseCalculatorReturn => {
  const [total, setTotal] = useState(0);
  const [history, setHistory] = useState<CalculatorHistory[]>([]);
  const [isCalculatorVisible, setIsCalculatorVisible] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<CalculatorOperation>(
    config.defaultOperation || "+"
  );
  const [undoStack, setUndoStack] = useState<CalculatorHistory[]>([]);
  const [redoStack, setRedoStack] = useState<CalculatorHistory[]>([]);

  // Use refs for config values to avoid recreating callbacks when config changes
  const configRef = useRef(config);
  configRef.current = config;

  // Memoize frequently used config values
  const { enableOverflowCheck, maxHistoryLength, defaultOperation, currency } =
    useMemo(
      () => ({
        enableOverflowCheck: config.enableOverflowCheck,
        maxHistoryLength: config.maxHistoryLength,
        defaultOperation: config.defaultOperation || "+",
        currency: config.currency,
      }),
      [
        config.enableOverflowCheck,
        config.maxHistoryLength,
        config.defaultOperation,
        config.currency,
      ]
    );

  const calculateResult = useCallback(
    (
      operation: CalculatorOperation,
      currentTotal: number,
      newValue: number
    ): number => {
      if (enableOverflowCheck !== false) {
        if (checkOverflow(currentTotal, newValue, operation)) {
          throw new Error("Result too large! Consider using smaller numbers.");
        }
      }

      let result: number;
      switch (operation) {
        case "+":
          result = currentTotal + newValue;
          break;
        case "-":
          result = currentTotal - newValue;
          break;
        case "×":
          result = currentTotal * newValue;
          break;
        case "÷":
          if (newValue === 0) {
            throw new Error("Cannot divide by zero!");
          }
          result = currentTotal / newValue;
          break;
        case "%":
          result = (currentTotal * newValue) / 100;
          break;
        default:
          result = currentTotal + newValue;
      }

      if (!isFinite(result)) {
        throw new Error("Calculation resulted in infinity or NaN!");
      }
      return result;
    },
    [enableOverflowCheck]
  );

  const addNumber = useCallback(
    (value: number) => {
      try {
        const newTotal = calculateResult(currentOperation, total, value);
        const newHistoryItem: CalculatorHistory = {
          value,
          operation: currentOperation,
          timestamp: Date.now(),
        };

        // Clear redo stack when new operation is performed
        setRedoStack([]);

        // Add to undo stack for redo functionality
        setUndoStack(prev => [...prev, newHistoryItem]);

        // Batch state updates
        setTotal(newTotal);
        setHistory((prev) => {
          const newHistory = [...prev, newHistoryItem];
          // Limit history length if configured
          return maxHistoryLength && newHistory.length > maxHistoryLength
            ? newHistory.slice(-maxHistoryLength)
            : newHistory;
        });
        setIsCalculatorVisible(true);
      } catch (error) {
        console.error("Calculator error:", error);
        // Set total to error state instead of throwing
        setTotal(0);
        // Optionally show error message to user
        // You could add a toast notification here
      }
    },
    [calculateResult, currentOperation, total, maxHistoryLength]
  );

  const setOperation = useCallback((operation: CalculatorOperation) => {
    setCurrentOperation(operation);
  }, []);

  const reset = useCallback(() => {
    setTotal(0);
    setHistory([]);
    setIsCalculatorVisible(false);
    setCurrentOperation(defaultOperation);
  }, [defaultOperation]);

  const setVisibility = useCallback((visible: boolean) => {
    setIsCalculatorVisible(visible);
  }, []);

  const close = useCallback(() => {
    setIsCalculatorVisible(false);
  }, []);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;

    const lastItem = undoStack[undoStack.length - 1];
    let newTotal = total;

    try {
      switch (lastItem.operation) {
        case "+":
          newTotal = total - lastItem.value;
          break;
        case "-":
          newTotal = total + lastItem.value;
          break;
        case "×":
          if (lastItem.value === 0) {
            console.error("Cannot undo multiplication by zero");
            return;
          }
          newTotal = total / lastItem.value;
          break;
        case "÷":
          newTotal = total * lastItem.value;
          break;
        case "%":
          if (lastItem.value === 0) {
            console.error("Cannot undo percentage calculation with zero");
            return;
          }
          newTotal = total / (lastItem.value / 100);
          break;
      }

      // Check if result is valid
      if (!isFinite(newTotal)) {
        console.error("Undo operation resulted in invalid number");
        return;
      }

      // Move item from undo to redo stack
      setUndoStack(prev => prev.slice(0, -1));
      setRedoStack(prev => [...prev, lastItem]);

      // Update state
      setTotal(newTotal);
      setHistory(prev => prev.slice(0, -1));

      if (history.length === 1) {
        setIsCalculatorVisible(false);
      }
    } catch (error) {
      console.error("Error during undo operation:", error);
    }
  }, [undoStack, total, history.length]);

  const copyTotal = useCallback(async () => {
    const formattedTotal = total.toString();

    try {
      await navigator.clipboard.writeText(formattedTotal);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = formattedTotal;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
  }, [total]);

  const recalculateTotal = useCallback(
    (historyArray: CalculatorHistory[]) => {
      let newTotal = 0;
      for (const item of historyArray) {
        try {
          newTotal = calculateResult(item.operation, newTotal, item.value);
        } catch (error) {
          console.error("Error recalculating total:", error);
          // Return a safe default value instead of breaking
          return 0;
        }
      }
      return newTotal;
    },
    [calculateResult]
  );

  const deleteHistoryItem = useCallback(
    (index: number) => {
      if (index < 0 || index >= history.length) return;

      const newHistory = history.filter((_, i) => i !== index);
      const newTotal = recalculateTotal(newHistory);

      // Ensure we have a valid total
      if (isFinite(newTotal)) {
        // Batch state updates
        setHistory(newHistory);
        setTotal(newTotal);

        if (newHistory.length === 0) {
          setIsCalculatorVisible(false);
        }
      } else {
        console.error("Invalid total after deleting history item, resetting to 0");
        setHistory(newHistory);
        setTotal(0);
      }
    },
    [history, recalculateTotal]
  );

  const editHistoryItem = useCallback(
    (index: number, newValue: number) => {
      if (index < 0 || index >= history.length) return;

      const newHistory = [...history];
      newHistory[index] = { ...newHistory[index], value: newValue };
      const newTotal = recalculateTotal(newHistory);

      // Ensure we have a valid total
      if (isFinite(newTotal)) {
        // Batch state updates
        setHistory(newHistory);
        setTotal(newTotal);
      } else {
        console.error("Invalid total after editing history item, resetting to 0");
        setHistory(newHistory);
        setTotal(0);
      }
    },
    [history, recalculateTotal]
  );

  // Computed values for undo/redo state
  const canUndo = useMemo(() => undoStack.length > 0, [undoStack.length]);
  const canRedo = useMemo(() => redoStack.length > 0, [redoStack.length]);

  // Redo function
  const redo = useCallback(() => {
    if (redoStack.length === 0) return;

    const itemToRedo = redoStack[redoStack.length - 1];
    let newTotal = total;

    try {
      switch (itemToRedo.operation) {
        case "+":
          newTotal = total + itemToRedo.value;
          break;
        case "-":
          newTotal = total - itemToRedo.value;
          break;
        case "×":
          newTotal = total * itemToRedo.value;
          break;
        case "÷":
          if (itemToRedo.value === 0) {
            console.error("Cannot redo division by zero");
            return;
          }
          newTotal = total / itemToRedo.value;
          break;
        case "%":
          newTotal = (total * itemToRedo.value) / 100;
          break;
      }

      if (!isFinite(newTotal)) {
        console.error("Redo operation resulted in invalid number");
        return;
      }

      setTotal(newTotal);
      setHistory(prev => [...prev, itemToRedo]);
      setRedoStack(prev => prev.slice(0, -1));
      setUndoStack(prev => [...prev, itemToRedo]);
    } catch (error) {
      console.error("Error during redo operation:", error);
    }
  }, [redoStack, total]);

  return {
    total,
    history,
    currentOperation,
    isCalculatorVisible,
    canUndo,
    canRedo,
    addNumber,
    setOperation,
    reset,
    undo,
    redo,
    copyTotal,
    setVisibility,
    close,
    deleteHistoryItem,
    editHistoryItem,
  };
};
