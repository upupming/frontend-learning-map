module.exports = {
  extends: 'standard-with-typescript',
  parserOptions: {
    project: './tsconfig.json'
  },
  rules: {
    '@typescript-eslint/no-non-null-assertion': 0,
    // we should be able to use if (xxx) just like C++ where xxx can be non boolean value
    '@typescript-eslint/strict-boolean-expressions': 0,
    '@typescript-eslint/brace-style': 0,
    '@typescript-eslint/explicit-function-return-type': 0
  },
  overrides: [
    {
      files: ['**/*.spec.ts'],
      plugins: ['jest'],
      env: {
        'jest/globals': true
      }
    }
  ]
}
