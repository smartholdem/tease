import { join, resolve } from "path";
import { array, object, string } from "zod";

/**
 * Configuration files.
 */
export const configDir = resolve(__dirname, "../config");
export const configLintStaged = join(configDir, "lint-staged.js");
export const configEslint = join(configDir, ".eslintrc.js");

/**
 * Paths to node.js CLIs in use.
 */
export const PATHS = {
	get prettier() {
		return require.resolve("prettier/bin-prettier.js");
	},
	get prettierPluginPackage() {
		return require.resolve("prettier-plugin-package");
	},
	get eslint() {
		return require.resolve("eslint/bin/eslint.js");
	},
	get rimraf() {
		return require.resolve("rimraf/bin.js");
	},
	get typescript() {
		return require.resolve("typescript/bin/tsc");
	},
	get lintStaged() {
		return require.resolve("lint-staged/bin/lint-staged.js");
	},
	get jest() {
		return require.resolve("jest/bin/jest.js");
	},
	get husky() {
		return require.resolve("husky/lib/bin.js");
	},
} as const;

/**
 * Configuration schema object for validation.
 */
export const configSchema = object({
	src: array(string()).optional(),
	dist: array(string()).optional(),
	project: array(string()).optional(),
});
