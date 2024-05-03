const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
	js.configs.recommended,
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
				...globals.es6,
				...globals.jest,
			},
			parserOptions: {
				sourceType: "module",
				ecmaVersion: 2022,
				ecmaFeatures: {
					impliedStrict: true,
				},
			},
		},
		rules: {
			"block-scoped-var": 2,
			"curly": 2,
			"default-case": 2,
			"dot-location": [2, "property"],
			"eqeqeq": 2,
			"no-console": 1,
			"no-debugger": 1,
			"no-else-return": 1,
			"no-eval": 1,
			"no-multi-spaces": 1,
			"no-unused-expressions": 1,
			"no-unused-vars": [2, {"argsIgnorePattern": "_notused$"}],
			"no-warning-comments": 1,
			"no-with": 2,
			"require-await": 2,
			"strict": 1,

			"no-shadow": 1,
			"no-undef": 2,
			"no-undefined": 2,
			"no-var": 2,

			"array-bracket-spacing": 2,
			"block-spacing": 2,
			"brace-style": [2, "1tbs", {"allowSingleLine": true}],
			"comma-spacing": 2,
			"comma-style": 2,
			"comma-dangle": [2, "always-multiline"],
			"computed-property-spacing": 2,
			"eol-last": 1,
			"func-call-spacing": 2,
			"indent": ["error", "tab", {"SwitchCase": 1}],
			"key-spacing": 2,
			"keyword-spacing": 2,
			"line-comment-position": 1,
			"linebreak-style": 2,
			"lines-around-comment": 2,
			"lines-between-class-members": 2,
			"new-parens": 2,
			"no-array-constructor": 2,
			"no-mixed-spaces-and-tabs": [2, "smart-tabs"],
			"no-trailing-spaces": 2,
			"no-whitespace-before-property": 2,
			"object-curly-newline": [2, {"consistent": true}],
			"quotes": 1,
			"semi": 2,
			"space-before-blocks": 2,
			"space-before-function-paren": [2, {"anonymous": "always", "named": "never", "asyncArrow": "always"}],
			"space-in-parens": 2,
			"space-infix-ops": 2,
			"space-unary-ops": 2,
			"spaced-comment": 1,
			"switch-colon-spacing": 2,

			"arrow-spacing": 2,
			"prefer-const": 1,
			"prefer-rest-params": 1,
			"prefer-spread": 1,
			"prefer-template": 2,
			"rest-spread-spacing": 2,
			"template-curly-spacing": 2,
		},
	},
];