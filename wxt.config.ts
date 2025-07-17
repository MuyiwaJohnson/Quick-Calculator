import { defineConfig } from 'wxt';
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  vite: ()=>({
    plugins: [tailwindcss()],
  }),
  manifest: {
    name: 'Cursor Simple Calc',
    description: 'A simple, animated calculator extension with cursor shadow and context menu integration.',
    permissions: ['clipboardWrite', 'contextMenus', 'storage'],
    icons: {
      '16': 'icon/16.png',
      '32': 'icon/32.png',
      '48': 'icon/48.png',
      '128': 'icon/128.png',
    },
    action: {},
  },
});
