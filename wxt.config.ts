import { defineConfig } from 'wxt';
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  vite: ()=>({
    plugins: [tailwindcss()],
  }),
  manifest: {
    name: 'Quick Calculator',
    description: 'Just double-click a number, and its done.',
    permissions: ['clipboardWrite', 'contextMenus'],
    icons: {
      '16': 'icon/16.png',
      '24': 'icon/24.png',
      '32': 'icon/32.png',
      '48': 'icon/48.png',
      '128': 'icon/128.png',
    },
    version: '1.0.0',
    action: {},
  },
});
