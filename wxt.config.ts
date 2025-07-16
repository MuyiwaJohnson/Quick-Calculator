import { defineConfig } from 'wxt';


export default defineConfig({
  modules: ['@wxt-dev/module-react'],
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
  },
});
