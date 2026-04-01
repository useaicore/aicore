/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true,
      tsconfig: '<rootDir>/tsconfig.test.json',
    }],
  },
  moduleNameMapper: {
    // Resolve workspace packages from source for tests
    '^@aicore/types$': '<rootDir>/../types/src/index.ts',
    '^@aicore/logger$': '<rootDir>/../logger/src/index.ts',
    // Strip .js extensions that TypeScript adds for NodeNext resolution
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
