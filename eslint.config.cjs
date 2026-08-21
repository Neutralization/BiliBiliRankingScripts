const js = require('@eslint/js');

module.exports = [
    {
        ignores: [
            'json2/**'
        ]
    },
    js.configs.recommended,
    {
        files: [
            '**/*.jsx'
        ],
        languageOptions: {
            ecmaVersion: 3,
            sourceType: 'script'
        },
        rules: {
            'array-bracket-spacing': ['error', 'never'],
            'brace-style': ['error', '1tbs', { 'allowSingleLine': true }],
            'comma-dangle': ['error', 'only-multiline'],
            'dot-location': ['error', 'property'],
            'dot-notation': ['error', { 'allowKeywords': false }],
            'indent': ['error', 4],
            'keyword-spacing': ['error', { before: true, after: true }],
            'linebreak-style': ['error', 'windows'],
            'no-irregular-whitespace': 'error',
            'no-mixed-spaces-and-tabs': 'error',
            'no-multi-spaces': 'error',
            'no-redeclare': 0,
            'no-restricted-syntax': [
                'error',
                {
                    selector: 'Property[kind="get"]',
                    message: 'ES3/ExtendScript does not support object literal getters.'
                },
                {
                    selector: 'Property[kind="set"]',
                    message: 'ES3/ExtendScript does not support object literal setters.'
                }
            ],
            'no-return-assign': ['error', 'always'],
            'no-trailing-spaces': 'error',
            'no-undef': 0,
            'no-unused-vars': 0,
            'quotes': ['error', 'single'],
            'semi': ['error', 'always'],
            'space-infix-ops': 'error'
        }
    },
    {
        files: [
            'eslint.config.cjs'
        ],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'commonjs'
        },
        rules: {
            'no-undef': 0
        }
    }
];
