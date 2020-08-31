module.exports = {
  env: {
    es6: true,
    node: true
  },
  parser: 'babel-eslint',
  extends: ['standard'],
  plugins: ['jsdoc'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  rules: {
    'space-before-function-paren': [
      2,
      {
        anonymous: 'always',
        named: 'never'
      }
    ]
  },
  ignorePatterns: ['src/__tests__', 'node_modules/']
}
