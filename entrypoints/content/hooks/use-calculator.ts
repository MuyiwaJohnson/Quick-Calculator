import { useState, useCallback, useMemo, useRef } from 'react';
import { checkOverflow } from '../utils/performance';
import type { CalculatorConfig, CalculatorHistory, CalculatorOperation, UseCalculatorReturn } from '../../../types';

/**
 * Custom React hook for calculator logic and state management.
 * Handles total, history, operations, undo, reset, and clipboard copy.
 *
 * @param {CalculatorConfig} config - Optional configuration for the calculator.
 * @returns {UseCalculatorReturn} Calculator state and actions.
 */
export const useCalculator = (config: CalculatorConfig = {}): UseCalculatorReturn => {
  const [total, setTotal] = useState(0);
  const [history, setHistory] = useState<CalculatorHistory[]>([]);
  const [isCalculatorVisible, setIsCalculatorVisible] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<CalculatorOperation>(
    config.defaultOperation || '+'
  );

  // Use refs for config values to avoid recreating callbacks when config changes
  const configRef = useRef(config);
  configRef.current = config;

  // Memoize frequently used config values
  const { enableOverflowCheck, maxHistoryLength, defaultOperation, currency } = useMemo(() => ({
    enableOverflowCheck: config.enableOverflowCheck,
    maxHistoryLength: config.maxHistoryLength,
    defaultOperation: config.defaultOperation || '+',
    currency: config.currency
  }), [config.enableOverflowCheck, config.maxHistoryLength, config.defaultOperation, config.currency]);

  /**
   * Calculates the result of applying an operation to the current total and a new value.
   * Throws if overflow or invalid operation occurs.
   * @param {CalculatorOperation} operation
   * @param {number} currentTotal
   * @param {number} newValue
   * @returns {number}
   */
  const calculateResult = useCallback((operation: CalculatorOperation, currentTotal: number, newValue: number): number => {
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
  }, [enableOverflowCheck]);

  /**
   * Adds a number to the calculator using the current operation.
   * Updates total and history.
   * @param {number} value
   */
  const addNumber = useCallback((value: number) => {
    try {
      const newTotal = calculateResult(currentOperation, total, value);
      const newHistoryItem: CalculatorHistory = {
        value,
        operation: currentOperation,
        timestamp: Date.now()
      };
      
      // Batch state updates
      setTotal(newTotal);
      setHistory(prev => {
        const newHistory = [...prev, newHistoryItem];
        // Limit history length if configured
        return maxHistoryLength && newHistory.length > maxHistoryLength
          ? newHistory.slice(-maxHistoryLength)
          : newHistory;
      });
      setIsCalculatorVisible(true);
    } catch (error) {
      console.error('Calculator error:', error);
      throw error;
    }
  }, [calculateResult, currentOperation, total, maxHistoryLength]);

  /**
   * Sets the current operation for the calculator.
   * @param {CalculatorOperation} operation
   */
  const setOperation = useCallback((operation: CalculatorOperation) => {
    setCurrentOperation(operation);
  }, []);

  /**
   * Resets the calculator to its initial state.
   */
  const reset = useCallback(() => {
    setTotal(0);
    setHistory([]);
    setIsCalculatorVisible(false);
    setCurrentOperation(defaultOperation);
  }, [defaultOperation]);

  /**
   * Sets the calculator visibility.
   */
  const setVisibility = useCallback((visible: boolean) => {
    setIsCalculatorVisible(visible);
  }, []);

  /**
   * Closes the calculator (sets visibility to false).
   */
  const close = useCallback(() => {
    setIsCalculatorVisible(false);
  }, []);

  /**
   * Undoes the last operation in the history.
   */
  const undo = useCallback(() => {
    if (history.length === 0) return;
    
    const lastItem = history[history.length - 1];
    let newTotal = total;
    
    switch (lastItem.operation) {
      case "+":
        newTotal = total - lastItem.value;
        break;
      case "-":
        newTotal = total + lastItem.value;
        break;
      case "×":
        newTotal = total / lastItem.value;
        break;
      case "÷":
        newTotal = total * lastItem.value;
        break;
      case "%":
        newTotal = total / (lastItem.value / 100);
        break;
    }
    
    // Batch state updates
    setTotal(newTotal);
    setHistory(prev => prev.slice(0, -1));
    
    if (history.length === 1) {
      setIsCalculatorVisible(false);
    }
  }, [history, total]);

  /**
   * Copies the total to the clipboard, formatted as currency.
   */
  const copyTotal = useCallback(async () => {
    const formattedTotal = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === '₦' ? 'NGN' : 'USD'
    }).format(total);
    
    try {
      await navigator.clipboard.writeText(formattedTotal);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = formattedTotal;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }, [total, currency]);

  /**
   * Recalculates total from history array.
   */
  const recalculateTotal = useCallback((historyArray: CalculatorHistory[]) => {
    let newTotal = 0;
    for (const item of historyArray) {
      try {
        newTotal = calculateResult(item.operation, newTotal, item.value);
      } catch (error) {
        console.error('Error recalculating total:', error);
        break;
      }
    }
    return newTotal;
  }, [calculateResult]);

  /**
   * Deletes a history item and recalculates the total.
   */
  const deleteHistoryItem = useCallback((index: number) => {
    if (index < 0 || index >= history.length) return;
    
    const newHistory = history.filter((_, i) => i !== index);
    const newTotal = recalculateTotal(newHistory);
    
    // Batch state updates
    setHistory(newHistory);
    setTotal(newTotal);
    
    if (newHistory.length === 0) {
      setIsCalculatorVisible(false);
    }
  }, [history, recalculateTotal]);

  /**
   * Edits a history item and recalculates the total.
   */
  const editHistoryItem = useCallback((index: number, newValue: number) => {
    if (index < 0 || index >= history.length) return;
    
    const newHistory = [...history];
    newHistory[index] = { ...newHistory[index], value: newValue };
    const newTotal = recalculateTotal(newHistory);
    
    // Batch state updates
    setHistory(newHistory);
    setTotal(newTotal);
  }, [history, recalculateTotal]);

  return {
    total,
    history,
    currentOperation,
    isCalculatorVisible,
    addNumber,
    setOperation,
    reset,
    undo,
    copyTotal,
    setVisibility,
    close,
    deleteHistoryItem,
    editHistoryItem,
  };
};