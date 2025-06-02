import {
  describe, it, expect,
} from 'vitest';
import { parseFilter, applyFilter, FilterParseError } from '../rowFilter';
import { DatasetRow } from '../../contexts/DatasetContextDefinition';

describe('parseFilter', () => {
  it('parses simple numeric greater than filter', () => {
    const result = parseFilter('age > 25');
    expect(result).toEqual({
      column: 'age',
      operator: '>',
      value: 25,
    });
  });

  it('parses numeric less than filter', () => {
    const result = parseFilter('score < 80');
    expect(result).toEqual({
      column: 'score',
      operator: '<',
      value: 80,
    });
  });

  it('parses greater than or equal filter', () => {
    const result = parseFilter('grade >= 90');
    expect(result).toEqual({
      column: 'grade',
      operator: '>=',
      value: 90,
    });
  });

  it('parses less than or equal filter', () => {
    const result = parseFilter('price <= 100');
    expect(result).toEqual({
      column: 'price',
      operator: '<=',
      value: 100,
    });
  });

  it('parses string equality filter with double quotes', () => {
    const result = parseFilter('name == "John"');
    expect(result).toEqual({
      column: 'name',
      operator: '==',
      value: 'John',
    });
  });

  it('parses string equality filter with single quotes', () => {
    const result = parseFilter("status == 'active'");
    expect(result).toEqual({
      column: 'status',
      operator: '==',
      value: 'active',
    });
  });

  it('parses string inequality filter', () => {
    const result = parseFilter('category != "test"');
    expect(result).toEqual({
      column: 'category',
      operator: '!=',
      value: 'test',
    });
  });

  it('handles whitespace around operators', () => {
    const result = parseFilter('  age   >   25  ');
    expect(result).toEqual({
      column: 'age',
      operator: '>',
      value: 25,
    });
  });

  it('parses unquoted string values', () => {
    const result = parseFilter('type == active');
    expect(result).toEqual({
      column: 'type',
      operator: '==',
      value: 'active',
    });
  });

  it('throws error for empty expression', () => {
    expect(() => parseFilter('')).toThrow(FilterParseError);
    expect(() => parseFilter('   ')).toThrow(FilterParseError);
  });

  it('throws error for invalid expression', () => {
    expect(() => parseFilter('invalid')).toThrow(FilterParseError);
    expect(() => parseFilter('age ++ 25')).toThrow(FilterParseError);
  });

  it('throws error for null or undefined input', () => {
    expect(() => parseFilter(null as unknown as string)).toThrow(FilterParseError);
    expect(() => parseFilter(undefined as unknown as string)).toThrow(FilterParseError);
  });
});

describe('applyFilter', () => {
  const sampleRows: DatasetRow[] = [
    {
      name: 'Alice', age: '25', score: '85', active: 'true',
    },
    {
      name: 'Bob', age: '30', score: '75', active: 'false',
    },
    {
      name: 'Charlie', age: '22', score: '95', active: 'true',
    },
    {
      name: 'David', age: '35', score: '65', active: 'false',
    },
    {
      name: 'Eve', age: '28', score: '88', active: 'true',
    },
  ];

  it('filters rows with numeric greater than', () => {
    const result = applyFilter(sampleRows, 'age > 25');
    expect(result).toHaveLength(3);
    expect(result.map((r) => r.name)).toEqual(['Bob', 'David', 'Eve']);
  });

  it('filters rows with numeric less than', () => {
    const result = applyFilter(sampleRows, 'score < 80');
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.name)).toEqual(['Bob', 'David']);
  });

  it('filters rows with greater than or equal', () => {
    const result = applyFilter(sampleRows, 'score >= 85');
    expect(result).toHaveLength(3);
    expect(result.map((r) => r.name)).toEqual(['Alice', 'Charlie', 'Eve']);
  });

  it('filters rows with less than or equal', () => {
    const result = applyFilter(sampleRows, 'age <= 25');
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.name)).toEqual(['Alice', 'Charlie']);
  });

  it('filters rows with string equality', () => {
    const result = applyFilter(sampleRows, 'active == "true"');
    expect(result).toHaveLength(3);
    expect(result.map((r) => r.name)).toEqual(['Alice', 'Charlie', 'Eve']);
  });

  it('filters rows with string inequality', () => {
    const result = applyFilter(sampleRows, 'active != "true"');
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.name)).toEqual(['Bob', 'David']);
  });

  it('filters rows with unquoted string values', () => {
    const result = applyFilter(sampleRows, 'name == Alice');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Alice');
  });

  it('returns empty array when no rows match', () => {
    const result = applyFilter(sampleRows, 'age > 100');
    expect(result).toHaveLength(0);
  });

  it('returns all rows when filter is empty', () => {
    const result = applyFilter(sampleRows, '');
    expect(result).toHaveLength(5);
    expect(result).toEqual(sampleRows);
  });

  it('returns all rows when filter is whitespace only', () => {
    const result = applyFilter(sampleRows, '   ');
    expect(result).toHaveLength(5);
    expect(result).toEqual(sampleRows);
  });

  it('skips rows with missing column values', () => {
    const rowsWithMissing: DatasetRow[] = [
      { name: 'Alice', age: '25', score: '85' },
      { name: 'Bob', score: '75' }, // missing age
      { name: 'Charlie', age: '22', score: '95' },
    ];

    const result = applyFilter(rowsWithMissing, 'age > 20');
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.name)).toEqual(['Alice', 'Charlie']);
  });

  it('handles non-numeric values in numeric comparisons', () => {
    const rowsWithText: DatasetRow[] = [
      { name: 'Alice', value: '25' },
      { name: 'Bob', value: 'not-a-number' },
      { name: 'Charlie', value: '30' },
    ];

    const result = applyFilter(rowsWithText, 'value > 20');
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.name)).toEqual(['Alice', 'Charlie']);
  });

  it('throws FilterParseError for invalid filter expressions', () => {
    expect(() => applyFilter(sampleRows, 'invalid filter')).toThrow(FilterParseError);
  });
});
