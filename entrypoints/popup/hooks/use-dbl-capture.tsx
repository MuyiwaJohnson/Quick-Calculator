import { useEffect, useCallback, useRef } from 'react';
import { extractNumber } from '../utils/utils';

export function useDoubleClickCapture(onAdd: (val: number) => void) {
  const styleRef = useRef<HTMLStyleElement | null>(null);

  const handler = useCallback(() => {
    const sel = window.getSelection()?.toString().trim() ?? '';
    const num = extractNumber(sel);

    if (num !== null) {
      // Visual feedback - highlight the selected text briefly
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // Create a temporary highlight effect
        const highlight = document.createElement('div');
        highlight.style.cssText = `
          position: fixed;
          top: ${rect.top}px;
          left: ${rect.left}px;
          width: ${rect.width}px;
          height: ${rect.height}px;
          background: rgba(34, 197, 94, 0.3);
          border: 2px solid rgb(34, 197, 94);
          border-radius: 4px;
          pointer-events: none;
          z-index: 9998;
          animation: numberCapture 0.6s ease-out forwards;
        `;

        // Add CSS animation only once
        if (!styleRef.current) {
          const style = document.createElement('style');
          style.id = 'number-capture-styles';
          style.textContent = `
            @keyframes numberCapture {
              0% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.1); opacity: 0.8; }
              100% { transform: scale(1); opacity: 0; }
            }
          `;
          document.head.appendChild(style);
          styleRef.current = style;
        }

        document.body.appendChild(highlight);

        // Remove highlight after animation
        setTimeout(() => {
          if (highlight.parentNode) {
            highlight.parentNode.removeChild(highlight);
          }
        }, 600);
      }

      onAdd(num);
    }
  }, [onAdd]);

  useEffect(() => {
    document.addEventListener('dblclick', handler, { passive: true });
    return () => {
      document.removeEventListener('dblclick', handler);
      // Clean up style element on unmount
      if (styleRef.current && styleRef.current.parentNode) {
        styleRef.current.parentNode.removeChild(styleRef.current);
        styleRef.current = null;
      }
    };
  }, [handler]);
} 