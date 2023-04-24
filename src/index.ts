import arg from "arg";
import { spawn } from "child_process";
import { isCI } from "ci-info";
import { get } from "dot-prop";
import { dirname, join, posix, relative, resolve } from "path";
import pkgConf from "pkg-conf";

import { eslintGlob, prettierGlob } from "./common";
import {
	configDir,
	configEslint,
	configLintStaged,
	configSchema,
	PATHS,
} from "./constants";
import { Config, Options, RunOptions } from "./contracts";

/**
 * Spawn a CLI command process.
 */
function run(path: string, args: string[] = [], { name, cwd }: RunOptions) {
	console.log(`> Running "${name}"...`);

	return new Promise<void>((resolve, reject) => {
		const process = spawn("node", [path, ...args], { stdio: "inherit", cwd });
		process.on("error", (err) => reject(err));
		process.on("close", (code, signal) => {
			if (code) return reject(new Error(`"${name}" exited with ${code}`));
			if (signal) return reject(new Error(`"${name}" exited with ${signal}`));
			return resolve();
		});
	});
}

/**
 * Build args from a set of possible values.
 */
function args(...values: Array<string | string[] | false | undefined>) {
	const result: string[] = [];
	for (const arg of values) {
		if (Array.isArray(arg)) {
			result.push(...arg);
		} else if (arg) {
			result.push(arg);
		}
	}
	return result;
}

/**
 * Build the project using `tsc`.
 */
export async function build(argv: string[], { dir, dist, project }: Config) {
	const { "--no-clean": noClean } = arg({ "--no-clean": Boolean }, { argv });

	if (!noClean) {
		await run(
			PATHS.rimraf,
			args(
				dist,
				project.map((x) => x.replace(/\.json$/, ".tsbuildinfo"))
			),
			{ cwd: dir, name: "rimraf" }
		);
	}

	// Build all project references using `--build`.
	await run(PATHS.typescript, ["-b", ...project], {
		name: "tsc",
		cwd: dir,
	});
}

/**
 * Run the pre-commit hook to lint/fix any code automatically.
 */
export async function preCommit(_argv: string[], { dir }: Config) {
	await run(PATHS.lintStaged, ["--config", configLintStaged], {
		name: "lint-staged",
		cwd: dir,
	});
}

/**
 * Resolve ESLint paths for linting.
 */
function getEslintPaths(
	paths: string[],
	filter: boolean,
	{ dir, src }: Config
) {
	if (!paths.length) {
		return src.map((x) => posix.join(x, `**/${eslintGlob}`));
	}

	if (filter) {
		const fullSrc = src.map((x) => resolve(dir, x));
		return paths.filter((path) =>
			fullSrc.some((src) => !relative(src, path).startsWith(".."))
		);
	}

	return paths;
}

/**
 * Lint the project using `eslint`.
 */
export async function lint(argv: string[], config: Config) {
	const {
		_,
		"--check": check,
		"--filter-paths": filterPaths = false,
	} = arg(
		{
			"--filter-paths": Boolean,
			"--check": Boolean,
		},
		{ argv }
	);

	const eslintPaths = getEslintPaths(_, filterPaths, config);
	await run(
		PATHS.eslint,
		args(!check && "--fix", ["--config", configEslint], eslintPaths),
		{
			cwd: config.dir,
			name: "eslint",
		}
	);
}

/**
 * Run checks intended for CI, basically linting/formatting without auto-fixing.
 */
export async function check(_argv: string[], config: Config) {
	await lint(["--check"], config);
	await format(["--check"], config);
}

/**
 * Run full test suite without automatic fixes.
 */
export async function test(argv: string[], config: Config) {
	const { "--force-exit": forceExit, "--pass-with-no-tests": passWithNoTests } =
		arg(
			{
				"--force-exit": Boolean,
				"--pass-with-no-tests": Boolean,
				"-f": "--force-exit",
			},
			{ argv }
		);

	await check([], config);
	await specs(
		args(
			"--ci",
			"--coverage",
			forceExit && "--force-exit",
			passWithNoTests && "--pass-with-no-tests"
		),
		config
	);
	await build(["--no-clean"], config);
}

/**
 * Run specs using `jest`.
 */
export async function specs(argv: string[], { src, dir }: Config) {
	const {
		_: paths,
		"--ci": ci = isCI,
		"--coverage": coverage,
		"--detect-open-handles": detectOpenHandles,
		"--force-exit": forceExit,
		"--only-changed": onlyChanged,
		"--pass-with-no-tests": passWithNoTests,
		"--test-pattern": testPattern,
		"--update-snapshot": updateSnapshot,
		"--watch-all": watchAll,
		"--watch": watch,
	} = arg(
		{
			"--ci": Boolean,
			"--coverage": Boolean,
			"--detect-open-handles": Boolean,
			"--force-exit": Boolean,
			"--only-changed": Boolean,
			"--pass-with-no-tests": Boolean,
			"--test-pattern": String,
			"--update-snapshot": Boolean,
			"--watch-all": Boolean,
			"--watch": Boolean,
			"-f": "--force-exit",
			"-o": "--only-changed",
			"-t": "--test-pattern",
			"-u": "--update-snapshot",
		},
		{ argv }
	);

	await run(
		PATHS.jest,
		args(
			["--config", join(configDir, "jest.config.js")],
			...src.map((x) => ["--roots", posix.join("<rootDir>", x)]),
			ci && "--ci",
			coverage && "--coverage",
			detectOpenHandles && "--detect-open-handles",
			forceExit && "--force-exit",
			onlyChanged && "--only-changed",
			passWithNoTests && "--pass-with-no-tests",
			testPattern && ["--test-name-pattern", testPattern],
			updateSnapshot && "--update-snapshot",
			watch && "--watch",
			watchAll && "--watch-all",
			paths
		),
		{ cwd: dir, name: "jest" }
	);
}

/**
 * Format code using `prettier`.
 */
export async function format(argv: string[], { dir, src }: Config) {
	const { _: paths, "--check": check } = arg(
		{
			"--check": Boolean,
		},
		{ argv }
	);

	if (!paths.length) {
		paths.push(prettierGlob);
		for (const dir of src) paths.push(posix.join(dir, `**/${prettierGlob}`));
	}

	await run(
		PATHS.prettier,
		args(
			["--plugin", PATHS.prettierPluginPackage],
			!check && "--write",
			check && "--check",
			paths
		),
		{
			cwd: dir,
			name: "prettier",
		}
	);
}

/**
 * Install any configuration needed for `tease` to work.
 */
export async function install(_argv: string[], { dir }: Config) {
	if (isCI) return;

	await run(PATHS.husky, ["install", join(configDir, "husky")], {
		cwd: dir,
		name: "husky",
	});
}

/**
 * Supported scripts.
 */
export const scripts = {
	build: build,
	"pre-commit": preCommit,
	format: format,
	specs: specs,
	test: test,
	lint: lint,
	check: check,
	install: install,
} as const;

/**
/**
 * Load `tease` configuration.
 */
export async function getConfig(cwd: string): Promise<Config> {
	const config = await pkgConf("tease", { cwd });
	const dir = dirname(pkgConf.filepath(config) || cwd);
	const {
		src = ["src"],
		dist = ["dist"],
		project = ["tsconfig.json"],
	} = configSchema.parse(config);
	return { dir, src, dist, project };
}

/**
 * Main script runtime.
 */
export async function main(args: string[], { cwd = process.cwd() }: Options) {
	const [command, ...flags] = args;
	const script: Function | undefined = get(scripts, command as string);

	if (!script) {
		throw new TypeError(`Script does not exist: ${command as string}`);
	}

	const config = await getConfig(cwd);
	return script(flags, config);
}
