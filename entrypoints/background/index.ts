import { browser } from "wxt/browser";

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.create({
      id: "open-cursor-mate",
      title: "Cursor Mate",
      contexts: ["all"],
    });
  });

  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "open-cursor-mate" && tab?.id) {
      browser.tabs.sendMessage(
        tab.id,
        { type: "SHOW_FLOATING_UI" }
      );
    }
  });
});
