import { browser } from "wxt/browser";

export default defineBackground(() => {
  // Context menu setup
  browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.create({
      id: "open-cursor-mate",
      title: "Cursor Mate",
      contexts: ["all"],
    });
  });

  // Context menu click handler
  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "open-cursor-mate" && tab?.id) {
      browser.tabs.sendMessage(
        tab.id,
        { type: "SHOW_FLOATING_UI" }
      );
    }
  });

  // Extension icon click handler
  (browser.action ?? browser.browserAction).onClicked.addListener(
    async (tab) => {
      if (tab.id) {
        await browser.tabs.sendMessage(tab.id, { type: "MOUNT_UI" });
      }
    }
  );
});
