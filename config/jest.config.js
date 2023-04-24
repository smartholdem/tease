module.exports = {
	rootDir: process.cwd(),
	bail: false,
	collectCoverage: true,
	collectCoverageFrom: ["src/**/*.ts", "!**/node_modules/**"],
	coverageDirectory: "<rootDir>/.coverage",
	coverageReporters: ["json", "lcov", "text", "clover", "html"],
	moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
	setupFilesAfterEnv: ["jest-extended"],
	testEnvironment: "node",
	testMatch: ["**/*.test.ts"],
	transform: {
		"^.+\\.tsx?$": require.resolve("ts-jest"),
	},
	verbose: true,
};
