// jest.config.js

module.exports = {
    rootDir: '../',
    testEnvironment: 'jsdom',
    transform: {
      '^.+\\.[tj]sx?$': 'babel-jest',
    },
    moduleNameMapper: {
        "\\.(css|scss|sass)$": "identity-obj-proxy", // Mock CSS modules
    },
    transformIgnorePatterns: [
      'node_modules/(?!(axios|msw|@bundled-es-modules/statuses)/)',
    ],
    setupFilesAfterEnv: ['<rootDir>/config/jest.setup.js'],
    moduleDirectories: ['node_modules', 'src'] // Ensures Jest looks here for modules
};

  