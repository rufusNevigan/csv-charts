import '@testing-library/jest-dom';

/* eslint-disable class-methods-use-this */
class ResizeObserverMock {
  observe() {}

  unobserve() {}

  disconnect() {}
}
/* eslint-enable class-methods-use-this */

// Mock ResizeObserver
global.ResizeObserver = ResizeObserverMock;
