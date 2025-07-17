import { useState, useCallback, useMemo } from 'react';
import { checkOverflow } from '../utils/performance';
import { 
  exportToCSV as exportToCSVUtil, 
  exportToJSON as exportToJSONUtil, 
  downloadFile, 
  generateFilename, 
  formatHistoryForExport 
} from '../utils/export';
import type { CalculatorConfig, CalculatorHistory, CalculatorOperation, UseCalculatorReturn } from '../../../types';

export const useCalculator = (config: CalculatorConfig = {}): UseCalculatorReturn => {
  const [total, setTotal] = useState(0);
  const [history, setHistory] = useState<CalculatorHistory[]>([]);
  const [isCalculatorVisible, setIsCalculatorVisible] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<CalculatorOperation>(
    config.defaultOperation || '+'
  );

  // Memoize operation label mapping
  const operationLabels = useMemo(() => ({
    "+": "added",
    "-": "subtracted", 
    "×": "multiplied by",
    "÷": "divided by",
    "%": "percentage of"
  }), []);

  const getOperationLabel = useCallback((operation: string): string => {
    return operationLabels[operation as keyof typeof operationLabels] || "added";
  }, [operationLabels]);

  // Calculate result with overflow checking
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

  // Add a number to the calculator
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
      // Error handling should be done by the calling component
      throw error;
    }
  }, [calculateResult, currentOperation, total, config.maxHistoryLength]);

  // Set the current operation
  const setOperation = useCallback((operation: CalculatorOperation) => {
    setCurrentOperation(operation);
  }, []);

  // Reset the calculator
  const reset = useCallback(() => {
    setTotal(0);
    setHistory([]);
    setIsCalculatorVisible(false);
    setCurrentOperation(config.defaultOperation || '+');
  }, [config.defaultOperation]);

  // Undo the last operation
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

  // Show/hide calculator
  const show = useCallback(() => {
    setIsCalculatorVisible(true);
  }, []);

  const hide = useCallback(() => {
    setIsCalculatorVisible(false);
  }, []);

  // Copy total to clipboard
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

  // Export functions
  const exportToCSV = useCallback(() => {
    if (history.length === 0) {
      throw new Error("No history to export");
    }
    
    const exportData = formatHistoryForExport(history, total, config.currency || '₦');
    const csvContent = exportToCSVUtil(exportData);
    const filename = generateFilename('calculator_history', 'csv');
    downloadFile(csvContent, filename, 'text/csv');
  }, [history, total, config.currency]);

  const exportToJSON = useCallback(() => {
    if (history.length === 0) {
      throw new Error("No history to export");
    }
    
    const exportData = formatHistoryForExport(history, total, config.currency || '₦');
    const jsonContent = exportToJSONUtil(exportData);
    const filename = generateFilename('calculator_history', 'json');
    downloadFile(jsonContent, filename, 'application/json');
  }, [history, total, config.currency]);

  return {
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
    exportToJSON,
  };
}; 