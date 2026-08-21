import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { copyFileSync, existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runBuild() {
  console.log('🚀 [JobGuard Build] 1/3 Building Popup UI (React)...');
  await build({
    configFile: false,
    plugins: [react()],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          popup: resolve(__dirname, 'index.html'),
        },
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
    },
  });

  console.log('🚀 [JobGuard Build] 2/3 Building Content Script (Self-Contained IIFE)...');
  await build({
    configFile: false,
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      lib: {
        entry: resolve(__dirname, 'src/content/index.ts'),
        name: 'JobGuardContent',
        formats: ['iife'],
        fileName: () => 'content.js',
      },
    },
  });

  console.log('🚀 [JobGuard Build] 3/3 Building Background Service Worker (Self-Contained IIFE)...');
  await build({
    configFile: false,
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      lib: {
        entry: resolve(__dirname, 'src/background/serviceWorker.ts'),
        name: 'JobGuardBackground',
        formats: ['iife'],
        fileName: () => 'background.js',
      },
    },
  });

  // Ensure manifest and icons are in dist
  console.log('📦 [JobGuard Build] Copying manifest and icons to dist...');
  if (!existsSync('dist/icons')) {
    mkdirSync('dist/icons', { recursive: true });
  }

  copyFileSync('public/manifest.json', 'dist/manifest.json');
  if (existsSync('public/icons/icon-16.png')) copyFileSync('public/icons/icon-16.png', 'dist/icons/icon-16.png');
  if (existsSync('public/icons/icon-48.png')) copyFileSync('public/icons/icon-48.png', 'dist/icons/icon-48.png');
  if (existsSync('public/icons/icon-128.png')) copyFileSync('public/icons/icon-128.png', 'dist/icons/icon-128.png');

  console.log('✅ [JobGuard Build] 100% Successful! content.js and background.js are self-contained with ZERO external imports.');
}

runBuild().catch((err) => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
