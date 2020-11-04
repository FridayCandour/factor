module.exports = {
  transform: {
    ".ts": "ts-jest",
  },

  globals: {
    "ts-jest": {
      diagnostics: true,
      isolatedModules: true,
    },
  },

  moduleFileExtensions: ["ts", "js"],

  testMatch: ["<rootDir>/@packages/**/**.spec.ts", "<rootDir>/test/**/*.spec.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/cdk.out/", "/docker/"],
  coveragePathIgnorePatterns: ["node_modules"],

  collectCoverage: Boolean(process.env.COVERAGE),
  collectCoverageFrom: ["<rootDir>/@packages/**/*.ts"],

  setupFilesAfterEnv: ["./test/jest-setup.ts"],
  moduleNameMapper: {
    // map lodash-es to lodash in test since jest does not support esm yet
    "^lodash-es$": "lodash",
  },

  setupFiles: [
    // mock native browser els
    "jest-canvas-mock",
    "jest-localstorage-mock",
  ],
}
