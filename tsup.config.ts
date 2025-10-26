import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: false,
  target: 'node18',
  external: [
    'dotenv',
    'fs',
    'path',
    'https',
    'node:*',
    '@elizaos/core',
    '@elizaos/plugin-bootstrap',
    '@elizaos/plugin-sql',
    '@elizaos/plugin-evm',
    '@elizaos/cli',
    'zod',
  ],
  outDir: 'dist',
  splitting: false,
});
