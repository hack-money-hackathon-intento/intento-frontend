import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
// Recomendado por Next si usas Prettier:
import prettier from 'eslint-config-prettier/flat'
import reactHooks from 'eslint-plugin-react-hooks'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import unusedImports from 'eslint-plugin-unused-imports'
import globals from 'globals'

export default defineConfig([
	...nextVitals,
	...nextTs,
	prettier,

	globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),

	{
		files: ['**/*.{js,jsx,mjs,ts,tsx}'],

		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.browser
			}
		},

		plugins: {
			'react-hooks': reactHooks,
			'simple-import-sort': simpleImportSort,
			'unused-imports': unusedImports
		},

		rules: {
			eqeqeq: ['warn', 'always'],

			'@typescript-eslint/no-unused-vars': 'off',

			'simple-import-sort/imports': 'error',
			'simple-import-sort/exports': 'warn',

			'unused-imports/no-unused-imports': 'warn',
			'unused-imports/no-unused-vars': [
				'warn',
				{
					vars: 'all',
					args: 'after-used',
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_'
				}
			],

			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn'
		}
	}
])
