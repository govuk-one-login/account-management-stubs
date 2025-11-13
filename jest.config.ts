/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
  // Enable ESM in Jest so ESM-only deps like `jose@6` can be imported in tests
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          // Use ESM for test transpilation without changing the app tsconfig
          module: "esnext",
          target: "es2020",
        },
      },
    ],
    // Transform ESM in node_modules for specific packages like `jose`
    "^.+\\.(js|jsx|mjs)$": [
      "babel-jest",
      {
        presets: [
          [
            "@babel/preset-env",
            { targets: { node: "current" }, modules: "auto" },
          ],
        ],
      },
    ],
  },
  // Allow transforming ESM-only dependency `jose`
  transformIgnorePatterns: ["/node_modules/(?!(jose)/)"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "mjs"],
  testEnvironment: "node",
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "babel",
  testMatch: ["**/tests/*/*.test.ts", "**/tests/*.test.ts"],
};
