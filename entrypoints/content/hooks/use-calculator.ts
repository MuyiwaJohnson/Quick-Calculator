import { useState, useCallback } from 'react';
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

  /**
   * Calculates the result of applying an operation to the current total and a new value.
   * Throws if overflow or invalid operation occurs.
   * @param {CalculatorOperation} operation
   * @param {number} currentTotal
   * @param {number} newValue
   * @returns {number}
   */
  const calculateResult = useCallback((operation: CalculatorOperation, currentTotal: number, newValue: number): number => {
    if (config.enableOverflowCheck !== false) {
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
  }, [config.enableOverflowCheck]);

  /**
   * Adds a number to the calculator using the current operation.
   * Updates total and history.
   * @param {number} value
   */
  const addNumber = useCallback((value: number) => {
    try {
      const newTotal = calculateResult(currentOperation, total, value);
      setTotal(newTotal);
      const newHistoryItem: CalculatorHistory = {
        value,
        operation: currentOperation,
        timestamp: Date.now()
      };
      setHistory(prev => {
        const newHistory = [...prev, newHistoryItem];
        // Limit history length if configured
        if (config.maxHistoryLength && newHistory.length > config.maxHistoryLength) {
          return newHistory.slice(-config.maxHistoryLength);
        }
        return newHistory;
      });
      setIsCalculatorVisible(true);
    } catch (error) {
      console.error('Calculator error:', error);
      throw error;
    }
  }, [calculateResult, currentOperation, total, config.maxHistoryLength]);

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
    setCurrentOperation(config.defaultOperation || '+');
  }, [config.defaultOperation]);

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
    if (history.length > 0) {
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
      setTotal(newTotal);
      setHistory(prev => prev.slice(0, -1));
      if (history.length === 1) {
        setIsCalculatorVisible(false);
      }
    }
  }, [history, total]);

  /**
   * Copies the total to the clipboard, formatted as currency.
   */
  const copyTotal = useCallback(async () => {
    const formattedTotal = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: config.currency === '₦' ? 'NGN' : 'USD'
    }).format(total);
    try {
      await navigator.clipboard.writeText(formattedTotal);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = formattedTotal;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }, [total, config.currency]);

  /**
   * Deletes a history item and recalculates the total.
   */
  const deleteHistoryItem = useCallback((index: number) => {
    if (index >= 0 && index < history.length) {
      const newHistory = history.filter((_, i) => i !== index);
      setHistory(newHistory);
      
      // Recalculate total from remaining history
      let newTotal = 0;
      newHistory.forEach(item => {
        try {
          newTotal = calculateResult(item.operation, newTotal, item.value);
        } catch (error) {
          console.error('Error recalculating total:', error);
        }
      });
      setTotal(newTotal);
      
      if (newHistory.length === 0) {
        setIsCalculatorVisible(false);
      }
    }
  }, [history, calculateResult]);

  /**
   * Edits a history item and recalculates the total.
   */
  const editHistoryItem = useCallback((index: number, newValue: number) => {
    if (index >= 0 && index < history.length) {
      const newHistory = [...history];
      newHistory[index] = { ...newHistory[index], value: newValue };
      setHistory(newHistory);
      
      // Recalculate total from updated history
      let newTotal = 0;
      newHistory.forEach(item => {
        try {
          newTotal = calculateResult(item.operation, newTotal, item.value);
        } catch (error) {
          console.error('Error recalculating total:', error);
        }
      });
      setTotal(newTotal);
    }
  }, [history, calculateResult]);

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