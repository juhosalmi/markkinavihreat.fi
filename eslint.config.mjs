// @ts-check
import eslintPluginAstro from 'eslint-plugin-astro'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import globals from 'globals'

export default [
  {
    ignores: ['dist/**', '.astro/**', 'node_modules/**', 'playwright-report/**', 'coverage/**'],
  },
  ...eslintPluginAstro.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      globals: { ...globals.node, ...globals.browser },
    },
    plugins: { '@typescript-eslint': tseslint },
    rules: {
      ...tseslint.configs.recommended.rules,
    },
  },
]
