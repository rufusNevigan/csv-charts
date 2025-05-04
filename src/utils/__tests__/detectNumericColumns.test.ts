import { describe, it, expect } from 'vitest';
import { detectNumericColumns } from '../detectNumericColumns';

describe('detectNumericColumns', () => {
  it('returns empty object for empty dataset', () => {
    const result = detectNumericColumns([], []);
    expect(result).toEqual({});
  });

  it('returns empty object when no numeric columns found', () => {
    const headers = ['name', 'category'];
    const rows = [
      { name: 'Item 1', category: 'A' },
      { name: 'Item 2', category: 'B' },
    ];
    const result = detectNumericColumns(headers, rows);
    expect(result).toEqual({});
  });

  it('detects numeric columns correctly', () => {
    const headers = ['name', 'value', 'count'];
    const rows = [
      { name: 'Item 1', value: '10', count: '5' },
      { name: 'Item 2', value: '20', count: '10' },
    ];
    const result = detectNumericColumns(headers, rows);
    expect(result).toEqual({
      xKey: 'value',
      yKey: 'count',
    });
  });

  it('handles mixed numeric and non-numeric values', () => {
    const headers = ['name', 'value', 'count'];
    const rows = [
      { name: 'Item 1', value: '10', count: '5' },
      { name: 'Item 2', value: '20', count: 'invalid' },
    ];
    const result = detectNumericColumns(headers, rows);
    expect(result).toEqual({
      xKey: 'value',
      yKey: undefined,
    });
  });
}); 