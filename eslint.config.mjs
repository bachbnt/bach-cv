import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  globalIgnores([
    '.next/**',
    // the other builds and runs of the tests (`.next-build`, `.next-cv`) and the local mockups
    '.next-*/**',
    'test-results*/**',
    'design/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // not part of the Next.js app
    'worker/**',
    '.claude/**',
  ]),
]);
