module.exports = {
    env: {
        browser: false,
        commonjs: true,
        es2021: false
    },
    extends: 'eslint:recommended',
    parserOptions: {
        ecmaVersion: 5,
        sourceType: 'module',
        requireConfigFile: false
    },
    parser: '@babel/eslint-parser',
    rules: {
        'array-bracket-spacing': ['error', 'never'],
        'brace-style': ['error', '1tbs', { 'allowSingleLine': true }],
        'dot-location': ['error', 'property'],
        'dot-notation': ['error', { 'allowKeywords': false }],
        'indent': ['error', 4],
        'keyword-spacing': ['error', { before: true, after: true }],
        'linebreak-style': ['error', 'windows'],
        'no-irregular-whitespace': 'error',
        'no-mixed-spaces-and-tabs': 'error',
        'no-multi-spaces': 'error',
        'no-redeclare': 0,
        'no-return-assign': ['error', 'always'],
        'no-trailing-spaces': 'error',
        'no-undef': 0,
        'no-unused-vars': 0,
        'quotes': ['error', 'single'],
        'semi': ['error', 'always'],
        'space-infix-ops': 'error',
    }
};
