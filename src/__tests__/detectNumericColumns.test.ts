import { describe, it, expect } from 'vitest';
import detectNumericColumns from '../utils/detectNumericColumns';

describe('detectNumericColumns', () => {
  it('detects numeric columns in a dataset', () => {
    const headers = ['name', 'age', 'score'];
    const rows = [
      { name: 'Alice', age: '25', score: '85' },
      { name: 'Bob', age: '30', score: '92' },
      { name: 'Charlie', age: '28', score: '78' },
    ];

    const result = detectNumericColumns(headers, rows);
    expect(result).toEqual({
      xKey: 'age',
      yKey: 'score',
    });
  });

  it('handles empty headers', () => {
    const headers = ['', 'age', 'score'];
    const rows = [
      { '': 'Alice', age: '25', score: '85' },
      { '': 'Bob', age: '30', score: '92' },
    ];

    const result = detectNumericColumns(headers, rows);
    expect(result).toEqual({
      xKey: 'age',
      yKey: 'score',
    });
  });

  it('returns undefined for non-numeric columns', () => {
    const headers = ['name', 'email'];
    const rows = [
      { name: 'Alice', email: 'alice@example.com' },
      { name: 'Bob', email: 'bob@example.com' },
    ];

    const result = detectNumericColumns(headers, rows);
    expect(result).toEqual({
      xKey: undefined,
      yKey: undefined,
    });
  });

  it('handles mixed numeric and non-numeric values', () => {
    const headers = ['id', 'value'];
    const rows = [
      { id: '1', value: '100' },
      { id: '2', value: 'invalid' },
      { id: '3', value: '200' },
    ];

    const result = detectNumericColumns(headers, rows);
    expect(result).toEqual({
      xKey: 'id',
      yKey: undefined,
    });
  });
});
