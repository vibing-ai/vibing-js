/**
 * Mock implementation of the logger utility for testing
 */

// Create Jest mock functions for all logger methods
const logMock = jest.fn();
const warnMock = jest.fn();
const errorMock = jest.fn();
const debugMock = jest.fn();

// Mock implementation of the logger utility
export const logger = {
  log: logMock,
  warn: warnMock,
  error: errorMock,
  debug: debugMock,
  createLogger: jest.fn().mockReturnValue({
    log: logMock,
    warn: warnMock,
    error: errorMock,
    debug: debugMock,
  }),
};

// Reset all mocks before each test
beforeEach(() => {
  logMock.mockClear();
  warnMock.mockClear();
  errorMock.mockClear();
  debugMock.mockClear();
}); 