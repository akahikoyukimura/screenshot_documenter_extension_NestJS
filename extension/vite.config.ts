import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,

    rollupOptions: {
      input: path.resolve(__dirname, 'src/popup.html'),

      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },

  plugins: [
    {
      name: 'chrome-extension-build',

      closeBundle() {
        const dist = path.resolve(__dirname, 'dist');

        // Copy manifest
        fs.copyFileSync(
          path.resolve(__dirname, 'src/manifest.json'),
          path.join(dist, 'manifest.json'),
        );

        // Move popup.html from dist/src to dist/
        const popupSource = path.join(dist, 'src', 'popup.html');
        const popupDestination = path.join(dist, 'popup.html');

        if (fs.existsSync(popupSource)) {
          fs.renameSync(popupSource, popupDestination);
        }

        // Remove empty src folder
        const srcDir = path.join(dist, 'src');

        if (
          fs.existsSync(srcDir) &&
          fs.readdirSync(srcDir).length === 0
        ) {
          fs.rmdirSync(srcDir);
        }
      },
    },
  ],
});