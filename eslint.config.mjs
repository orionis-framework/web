import js from '@eslint/js';
import react from '@eslint-react/eslint-plugin';
import next from '@next/eslint-plugin-next';
import { defineConfig, globalIgnores } from 'eslint/config';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import { importX } from 'eslint-plugin-import-x';
import jsxA11y from 'eslint-plugin-jsx-a11y-x';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const sourceFiles = ['**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}'];

export default defineConfig([
  globalIgnores(['out/**', '.next/**', 'build/**', 'node_modules/**', 'next-env.d.ts']),
  {
    files: sourceFiles,
    extends: [js.configs.recommended, importX.flatConfigs.recommended],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    settings: {
      'import-x/resolver-next': [createTypeScriptImportResolver()],
    },
    rules: {
      'import-x/no-anonymous-default-export': 'error',
    },
  },
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    extends: [tseslint.configs.recommended, importX.flatConfigs.typescript],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      next.configs['core-web-vitals'],
      react.configs['recommended-typescript'],
      reactHooks.configs.flat.recommended,
      jsxA11y.configs.recommended,
    ],
    settings: {
      'jsx-a11y-x': {
        components: { Image: 'img', Link: 'a' },
      },
    },
  },
]);
