module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  plugins: ['@typescript-eslint', 'prettier', 'security'],
  env: {
    node: true,
    browser: true,
    es6: true,
    jest: true
  },
  ignorePatterns: ['node_modules/**', 'dist/**', 'coverage/**'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    warnOnUnsupportedTypeScriptVersion: false,
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-useless-escape': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { 
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '^_',
      'caughtErrorsIgnorePattern': '^_'
    }],
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/ban-types': ['warn', {
      'types': {
        '{}': {
          'message': 'Use object instead',
          'fixWith': 'object'
        },
        'Object': {
          'message': 'Use object instead',
          'fixWith': 'object'
        },
        'Function': {
          'message': 'Use specific function type instead',
          'fixWith': '(...args: any[]) => any'
        }
      },
      'extendDefaults': true
    }],
    'no-async-promise-executor': 'error',
    '@typescript-eslint/no-empty-function': 'warn',
    '@typescript-eslint/no-empty-object-type': 'off',
    'no-useless-catch': 'error',
    '@typescript-eslint/no-require-imports': 'error'
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
}; 