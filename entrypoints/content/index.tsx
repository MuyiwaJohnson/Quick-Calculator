// content.js
import ReactDOM from "react-dom/client";
import { createShadowRootUi } from "#imports";
import ContentCalculatorUI from "./ContentCalculatorUI.tsx";
import "../popup/style.css";

export default defineContentScript({
  matches: ["*://*/*"],
  async main(ctx) {
    console.log("Floating UI content script loaded");
    
    let mousePosition = { x: 0, y: 0 };
    let uiMounted = false;
    let ui: any;

    // Track mouse position globally
    const handleMouseMove = (e: MouseEvent) => {
      mousePosition = { x: e.clientX, y: e.clientY };
      
      // Dispatch custom event for UI to listen
      if (uiMounted) {
        window.dispatchEvent(new CustomEvent('mousePositionUpdate', {
          detail: { x: e.clientX, y: e.clientY }
        }));
      }
    };

    // Handle double-click on numbers
    const handleDoubleClick = (e: MouseEvent) => {
      const selection = window.getSelection();
      const selectedText = selection ? selection.toString() : "";
      const number = parseFloat(selectedText);
      
      if (!isNaN(number) && selectedText.trim() !== '') {
        window.dispatchEvent(new CustomEvent('numberDoubleClick', {
          detail: { number, position: { x: e.clientX, y: e.clientY } }
        }));
      }
    };

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('dblclick', handleDoubleClick);

    // Create shadow root UI
    ui = await createShadowRootUi(ctx, {
      name: "floating-calculator-ui",
      position: "overlay", // Use overlay for floating UI
      onMount: (container) => {
        // Render FloatingUI directly as the root
        const root = ReactDOM.createRoot(container);
        root.render(
          <ContentCalculatorUI 
            initialPosition={mousePosition}
            onClose={() => {
              uiMounted = false;
              ui.remove();
            }}
          />
        );
        uiMounted = true;
        return { root };
      },
      onRemove: (elements) => {
        uiMounted = false;
        elements?.root.unmount();
      },
    });

    // Listen for context menu messages
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'SHOW_FLOATING_UI') {
        mousePosition = message.position;
        ui.mount();
        sendResponse({ message: "SHOW_FLOATING_UI message received!" });
      }
    });

    // Cleanup on script end
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('dblclick', handleDoubleClick);
    };
  },
});