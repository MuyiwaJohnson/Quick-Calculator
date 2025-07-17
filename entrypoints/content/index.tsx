import ReactDOM from "react-dom/client";
import { createShadowRootUi } from "#imports";
import ContentCalculatorUI from "./components/ContentCalculatorUI.tsx";
import "../popup/style.css";
import { addDoubleClickNumberListener } from "./utils/dbl-click-num-listener.ts";

export default defineContentScript({
  matches: ["*://*/*"],
  cssInjectionMode: "ui",
  async main(ctx) {
    let uiMounted = false;
    let ui: any;

    // Add double-click number listener
    const removeDoubleClickListener = addDoubleClickNumberListener((number, position) => {
      window.dispatchEvent(
        new CustomEvent("numberDoubleClick", {
          detail: { number, position },
        })
      );
    });

    // Create shadow root UI
    ui = await createShadowRootUi(ctx, {
      name: "floating-calculator-ui",
      position: "overlay",
      onMount: (container) => {
        const wrapper = document.createElement("div");
        container.append(wrapper);

        const root = ReactDOM.createRoot(wrapper);
        root.render(
          <ContentCalculatorUI
            onClose={() => {
              uiMounted = false;
              ui.remove();
            }}
            onRemove={ui.remove}
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
      if (message.type === "SHOW_FLOATING_UI") {
        ui.mount();
        sendResponse({ message: "SHOW_FLOATING_UI message received!" });
      }
    });

    // Cleanup on script end
    return () => {
      removeDoubleClickListener();
    };
  },
});
