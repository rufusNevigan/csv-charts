import {
  describe, it, expect, vi, beforeEach,
} from 'vitest';
import { info, error } from '../logger';

describe('logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log');
    vi.spyOn(console, 'error');
  });

  it('info logs with timestamp and level', () => {
    const message = 'Test info message';
    const arg = { foo: 'bar' };

    info(message, arg);

    expect(console.log).toHaveBeenCalledWith(
      expect.stringMatching(
        /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[INFO\]/,
      ),
      message,
      arg,
    );
  });

  it('error logs with timestamp and level', () => {
    const message = 'Test error message';
    const arg = { error: 'details' };

    error(message, arg);

    expect(console.error).toHaveBeenCalledWith(
      expect.stringMatching(
        /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[ERROR\]/,
      ),
      message,
      arg,
    );
  });
});
