// Global test setup
beforeAll(() => {
  // Mock environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_HOST = 'localhost';
  process.env.DATABASE_PORT = '5432';
  process.env.DATABASE_USER = 'test';
  process.env.DATABASE_PASSWORD = 'test';
  process.env.DATABASE_NAME = 'test_db';
});

afterAll(() => {
  // Cleanup
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
