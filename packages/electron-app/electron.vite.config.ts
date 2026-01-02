import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

// Plugin to fix electron imports
const fixElectronPlugin = () => ({
  name: 'fix-electron',
  generateBundle(_options: any, bundle: any) {
    for (const fileName in bundle) {
      const chunk = bundle[fileName];
      if (chunk.type === 'chunk' && chunk.code) {
        // Keep electron as namespace import but access properties correctly
        // No replacement needed - just keep the electron namespace
      }
    }
  }
});

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin(), fixElectronPlugin()],
    build: {
      rollupOptions: {
        output: {
          format: 'cjs',
          manualChunks: undefined
        }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react()]
  }
})
