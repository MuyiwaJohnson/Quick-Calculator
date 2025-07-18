import ReactDOM from "react-dom/client";
import { createShadowRootUi } from "#imports";
import ContentCalculatorUI from "./components/ContentCalculatorUI.tsx";
import "./style.css";
import { addDoubleClickNumberListener } from "./utils/dbl-click-num-listener.ts";

export default defineContentScript({
  matches: ["*://*/*"],
  cssInjectionMode: "ui",
  async main(ctx) {
    let uiMounted = false;
    let ui: any;

    // Add double-click number listener
    const removeDoubleClickListener = addDoubleClickNumberListener(
      (number, position) => {
        window.dispatchEvent(
          new CustomEvent("numberDoubleClick", {
            detail: { number, position },
          })
        );
      }
    );

    // Shared UI mounting logic
    const mountCalculatorUI = async () => {
      if (uiMounted) return;
      ui = await createShadowRootUi(ctx, {
        name: "floating-calculator-ui",
        position: "overlay",
        onMount: (container) => {
          const wrapper = document.createElement("div");
          wrapper.style.backgroundColor = "rgba(20,20,20,0.98)";
          wrapper.style.borderRadius = "16px";
          wrapper.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
          wrapper.style.border = "1px solid #444";

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
      ui.mount();
    };

    // Single message listener for both message types
    browser.runtime.onMessage.addListener((message) => {
      if (
        (message.type === "MOUNT_UI" || message.type === "SHOW_FLOATING_UI") &&
        !uiMounted
      ) {
        mountCalculatorUI();
      }
    });

    // Cleanup on script end
    return () => {
      removeDoubleClickListener();
    };
  },
});
