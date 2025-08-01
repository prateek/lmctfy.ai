module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.js', '**/*.test.js'],
  collectCoverageFrom: [
    '**/*.js',
    '!jest.config.js',
    '!coverage/**'
  ]
};