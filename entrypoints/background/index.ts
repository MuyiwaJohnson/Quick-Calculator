import { browser } from "wxt/browser";

export default defineBackground(() => {
  // Context menu setup
  browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.create({
      id: "quick-calculator",
      title: "Quick Calculator",
      contexts: ["all"],
    });
  });

  // Context menu click handler
  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "quick-calculator" && tab?.id) {
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
