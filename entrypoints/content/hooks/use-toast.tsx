import { X } from 'lucide-react';
import React, { useState } from 'react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'info' | 'warning';
  timestamp: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const id = Date.now() + Math.random();
    const newToast: Toast = {
      id,
      message,
      type,
      timestamp: Date.now()
    };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return { toasts, showToast, removeToast };
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: number) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ 
  toasts, 
  onRemove 
}) => {
  return (
    <div className="fixed top-4 right-4 z-[10000] space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-2 rounded-lg text-white text-sm shadow-lg backdrop-blur-md border pointer-events-auto
            ${toast.type === 'success' ? 'bg-green-600 border-green-500' : ''}
            ${toast.type === 'info' ? 'bg-blue-600 border-blue-500' : ''}
            ${toast.type === 'warning' ? 'bg-amber-600 border-amber-500' : ''}
            animate-in slide-in-from-right-2 duration-300`}
          style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            zIndex: 10000,
            willChange: 'transform, opacity',
          }}
        >
          <div className="flex items-center justify-between">
            <span>{toast.message}</span>
            <button
              onClick={() => onRemove(toast.id)}
              className="ml-2 text-white/80 hover:text-white transition-colors"
            >
              <X size={13} className="text-white/80 hover:text-white" strokeWidth={2} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}; 