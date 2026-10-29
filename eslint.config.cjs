const js = require('@eslint/js');

const extendScriptNaming = {
    meta: {
        type: 'suggestion',
        schema: []
    },
    create(context) {
        const camelCase = /^[a-z][a-zA-Z0-9]*$/;
        const constantCase = /^[A-Z][A-Z0-9_]*$/;
        const adobeGlobals = new Set([
            'app', 'Math', 'Date', 'File', 'FolderItem', 'ImportOptions',
            'ImportAsType', 'TrackMatteType', 'MaskMode', 'JSON', 'String',
            'Number', 'Infinity', 'undefined', 'parseInt', 'CloseOptions',
            'ParagraphJustification'
        ]);
        function check(node) {
            const name = node.name;
            if (!camelCase.test(name) && !constantCase.test(name)) {
                context.report({ node, message: 'Use camelCase for identifiers or UPPER_CASE for constants.' });
            }
        }
        return {
            Identifier(node) {
                const parent = node.parent;
                if (adobeGlobals.has(node.name) ||
                    (parent.type === 'MemberExpression' && parent.property === node && !parent.computed) ||
                    (parent.type === 'Property' && parent.key === node && !parent.computed)) return;
                check(node);
            },
        };
    }
};

module.exports = [
    {
        ignores: [
            'json2/**'
        ]
    },
    js.configs.recommended,
    {
        plugins: {
            'extend-script': { rules: { naming: extendScriptNaming } }
        },
        files: [
            '**/*.jsx'
        ],
        languageOptions: {
            ecmaVersion: 3,
            sourceType: 'script'
        },
        rules: {
            'extend-script/naming': 'error',
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
