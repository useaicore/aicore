/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true,
      // Point ts-jest at the test tsconfig so CF types don't bleed in.
      tsconfig: '<rootDir>/tsconfig.test.json',
    }],
  },
  moduleNameMapper: {
    // Resolve workspace package from source (no build needed).
    '^@aicore/types$': '<rootDir>/../types/src/index.ts',
    // Strip .js extensions that TypeScript adds for NodeNext resolution.
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
