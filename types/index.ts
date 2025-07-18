// Types ported from cursor-mate

// Core Types
export type CalculatorOperation = '+' | '-' | '×' | '÷' | '%';
export type ToastType = 'success' | 'info' | 'warning';

// Configuration
export interface CalculatorConfig {
  defaultOperation?: CalculatorOperation;
  maxHistoryLength?: number;
  enableOverflowCheck?: boolean;
  currency?: string;
}

// Data Structures
export interface CalculatorHistory {
  value: number;
  operation: CalculatorOperation;
  timestamp: number;
}

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  timestamp: number;
}

// Hook Return Types
export interface UseCalculatorReturn {
  total: number;
  history: CalculatorHistory[];
  currentOperation: CalculatorOperation;
  isCalculatorVisible: boolean;
  addNumber: (value: number) => void;
  setOperation: (operation: CalculatorOperation) => void;
  reset: () => void;
  undo: () => void;
  copyTotal: () => Promise<void>;
  setVisibility: (visible: boolean) => void;
}

// For use-cursor-pos, adapt as needed for your implementation
export interface UseCursorPositionReturn {
  x: any; // Replace with correct type if using motion/react
  y: any;
}

export interface UseToastReturn {
  toasts: Toast[];
  showToast: (message: string, type: ToastType) => void;
  removeToast: (id: number) => void;
}

// Component Prop Types
export interface CursorMateProviderProps {
  config?: CalculatorConfig;
  children: React.ReactNode;
}

export interface CursorMateProps {
  config?: CalculatorConfig;
  onTotalChange?: (total: number) => void;
  onHistoryChange?: (history: CalculatorHistory[]) => void;
  onOperationChange?: (operation: CalculatorOperation) => void;
  children?: React.ReactNode;
  className?: string;
} 