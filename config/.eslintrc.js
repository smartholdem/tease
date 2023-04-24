module.exports = {
	parser: "@typescript-eslint/parser",
	parserOptions: {
		project:
			process.env.npm_package_name === "@konceiver/tease"
				? "./tsconfig.eslint.json"
				: "node_modules/@konceiver/tease/config/tsconfig.eslint.json",
		extraFileExtensions: [".json"],
	},
	plugins: ["@typescript-eslint", "jest", "prettier", "simple-import-sort", "unused-imports"],
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/eslint-recommended",
		"plugin:@typescript-eslint/recommended-requiring-type-checking",
		"plugin:@typescript-eslint/recommended",
		"plugin:jest/recommended",
	],
	rules: {
		"@typescript-eslint/ban-ts-comment": "off",
		"@typescript-eslint/ban-types": "off",
		"@typescript-eslint/naming-convention": "off",
		"@typescript-eslint/no-empty-function": "off",
		"@typescript-eslint/no-empty-interface": "off",
		"@typescript-eslint/no-explicit-any": "off",
		"@typescript-eslint/no-misused-promises": "off",
		"@typescript-eslint/no-unsafe-assignment": "off",
		"@typescript-eslint/no-unsafe-call": "off",
		"@typescript-eslint/no-unsafe-member-access": "off",
		"@typescript-eslint/no-unsafe-return": "off",
		"@typescript-eslint/no-unused-vars": "off",
		"@typescript-eslint/no-var-requires": "off",
		"@typescript-eslint/require-await": "off",
		"@typescript-eslint/restrict-plus-operands": "off",
		"@typescript-eslint/restrict-template-expressions": "off",
		"no-async-promise-executor": "off",
		"no-prototype-builtins": "off",
		"prefer-const": [
			"error",
			{
				destructuring: "all",
			},
		],
		"prettier/prettier": "error",
		"simple-import-sort/imports": "error",
		"unused-imports/no-unused-imports-ts": "error",
	},
};
