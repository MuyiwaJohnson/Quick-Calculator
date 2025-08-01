
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
  canUndo: boolean;
  canRedo: boolean;
  addNumber: (value: number) => void;
  setOperation: (operation: CalculatorOperation) => void;
  reset: () => void;
  undo: () => void;
  redo: () => void;
  copyTotal: () => Promise<void>;
  setVisibility: (visible: boolean) => void;
  close: () => void;
  deleteHistoryItem: (index: number) => void;
  editHistoryItem: (index: number, newValue: number) => void;
}

export interface UseCursorPositionReturn {
  x: any; 
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