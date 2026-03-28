module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { useESM: true }]
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  extensionsToTreatAsEsm: [".ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  testMatch: ["**/__tests__/**/*.test.ts"],
};
