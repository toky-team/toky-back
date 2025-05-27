// @ts-check
import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import moduleResolver from 'eslint-plugin-module-resolver';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintPluginPrettier from 'eslint-plugin-prettier';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  eslintPluginPrettierRecommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: 2020,
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.ts'],
    plugins: {
      'simple-import-sort': simpleImportSort,
      prettier: eslintPluginPrettier,
      'module-resolver': moduleResolver,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      'module-resolver/use-alias': [
        'error',
        {
          alias: {
            '~': './src',
          },
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ["./**", "../**"],
              message: 'Please use absolute imports instead of relative ones.',
            }
          ]
        }
      ],

      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
        },
      ],

      'no-console': 'warn',
      'no-debugger': 'warn',
      'no-var': 'warn',
      'prefer-const': 'warn',
      'eqeqeq': 'warn',
      'prefer-arrow-callback': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',

    },
  }
);
