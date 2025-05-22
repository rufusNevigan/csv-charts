import { describe, it, expect } from 'vitest';
import detectNumericColumns from '../utils/detectNumericColumns';

describe('detectNumericColumns', () => {
  it('identifies numeric columns correctly', () => {
    const headers = ['name', 'age', 'score', 'city'];
    const rows = [
      {
        name: 'John',
        age: '30',
        score: '95',
        city: 'NY',
      },
      {
        name: 'Jane',
        age: '25',
        score: '88',
        city: 'LA',
      },
    ];

    const numericColumns = detectNumericColumns(rows, headers);
    expect(numericColumns).toEqual(['age', 'score']);
  });

  it('handles empty values', () => {
    const headers = ['name', 'age', 'score'];
    const rows = [
      {
        name: 'John',
        age: '30',
        score: '',
      },
      {
        name: 'Jane',
        age: '25',
        score: '88',
      },
    ];

    const numericColumns = detectNumericColumns(rows, headers);
    expect(numericColumns).toEqual(['age']);
  });

  it('handles non-numeric strings', () => {
    const headers = ['name', 'age', 'score'];
    const rows = [
      {
        name: 'John',
        age: '30',
        score: 'A+',
      },
      {
        name: 'Jane',
        age: '25',
        score: 'B-',
      },
    ];

    const numericColumns = detectNumericColumns(rows, headers);
    expect(numericColumns).toEqual(['age']);
  });

  it('returns empty array when no numeric columns found', () => {
    const headers = ['name', 'city', 'grade'];
    const rows = [
      {
        name: 'John',
        city: 'NY',
        grade: 'A',
      },
      {
        name: 'Jane',
        city: 'LA',
        grade: 'B',
      },
    ];

    const numericColumns = detectNumericColumns(rows, headers);
    expect(numericColumns).toEqual([]);
  });
});
