// Jest setup file for additional configuration
require('@testing-library/jest-dom');

// Mock localStorage for tests
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock fetch for tests
global.fetch = jest.fn();

// Mock window.confirm for tests
global.confirm = jest.fn(() => true);

// Mock window.alert for tests
global.alert = jest.fn();

// Suppress console output during tests (optional)
// Uncomment if you want cleaner test output
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };
