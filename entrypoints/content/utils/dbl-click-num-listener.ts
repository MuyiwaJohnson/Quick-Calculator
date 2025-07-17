import { extractNumberFromText } from './utils';

export function addDoubleClickNumberListener(callback: (number: number, position: { x: number, y: number }) => void) {
  const handler = (e: MouseEvent) => {
    // Ignore clicks inside the shadow root
    if ((e.target as HTMLElement).closest('[data-wxt-shadow-root]')) return;
    const selection = window.getSelection();
    const selectedText = selection ? selection.toString() : '';
    const number = extractNumberFromText(selectedText);
    if (number !== null && selectedText.trim() !== '') {
      callback(number, { x: e.clientX, y: e.clientY });
    }
  };
  document.addEventListener('dblclick', handler);
  return () => document.removeEventListener('dblclick', handler);
} 