import { browser } from "wxt/browser";

export default defineBackground(() => {
  console.log("background loaded");
  browser.contextMenus.create({
    id: "open-cursor-mate",
    title: "Cursor Mate",
    contexts: ["all"],
  });

  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "open-cursor-mate" && tab?.id) {
      console.log("info", info);
      console.log("tab", tab);
      browser.tabs.sendMessage(
        tab.id,
        { type: "SHOW_FLOATING_UI" },
        (response) => {
          console.log("response", response);
        }
      );
    }
  });
});
