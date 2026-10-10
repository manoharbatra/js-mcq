import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    // One copy of each, or CodeMirror's extension checks fail and the editor stops accepting input.
    dedupe: ['react', 'react-dom', '@codemirror/state', '@codemirror/view', '@codemirror/language'],
  },
  optimizeDeps: {
    // The code editor is lazy-loaded, so pre-bundle it up front instead of mid-session.
    include: [
      '@uiw/react-codemirror',
      '@codemirror/lang-javascript',
      '@codemirror/state',
      '@codemirror/view',
      '@hello-pangea/dnd',
      'prettier/standalone',
      'prettier/plugins/babel',
      'prettier/plugins/estree',
    ],
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
