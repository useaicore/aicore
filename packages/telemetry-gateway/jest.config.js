/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
  },
  moduleNameMapper: {
    '^@aicore/types$': '<rootDir>/../types/src/index.ts',
    '^@aicore/logger$': '<rootDir>/../logger/src/index.ts',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
