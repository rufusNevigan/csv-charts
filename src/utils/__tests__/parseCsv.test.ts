import { describe, it, expect } from 'vitest';
import { parseCsv, CsvTooBigError } from '../parseCsv';

describe('parseCsv', () => {
  const createMockFile = (content: string, name = 'test.csv') => new File([content], name, { type: 'text/csv' });

  it('parses valid CSV with headers', async () => {
    const file = createMockFile('name,age\nJohn,30\nJane,25');
    const result = await parseCsv(file);

    expect(result.headers).toEqual(['name', 'age']);
    expect(result.rows).toEqual([
      { name: 'John', age: '30' },
      { name: 'Jane', age: '25' },
    ]);
  });

  it('throws CsvTooBigError when exceeding row cap', async () => {
    const rowCount = 50001;
    const content = `name,age\n${Array(rowCount).fill('John,30').join('\n')}`;
    const file = createMockFile(content);

    await expect(parseCsv(file, 50000)).rejects.toThrow(CsvTooBigError);
    await expect(parseCsv(file, 50000)).rejects.toThrow(
      'This file contains more than 50,000 rows',
    );
    await expect(parseCsv(file, 50000)).rejects.toThrow(
      'For performance reasons',
    );
  });

  it('returns performance warning when exceeding performance cap', async () => {
    const rowCount = 10001;
    const content = `name,age\n${Array(rowCount).fill('John,30').join('\n')}`;
    const file = createMockFile(content);

    const result = await parseCsv(file, 50000, 10000);

    expect(result.performanceWarning).toBeDefined();
    expect(result.performanceWarning).toContain('10,001 rows');
    expect(result.performanceWarning).toContain('more than 10,000 rows');
    expect(result.performanceWarning).toContain('may affect performance');
    expect(result.headers).toEqual(['name', 'age']);
    expect(result.rows).toHaveLength(rowCount);
  });

  it('does not return performance warning when under performance cap', async () => {
    const rowCount = 5000;
    const content = `name,age\n${Array(rowCount).fill('John,30').join('\n')}`;
    const file = createMockFile(content);

    const result = await parseCsv(file, 50000, 10000);

    expect(result.performanceWarning).toBeUndefined();
    expect(result.headers).toEqual(['name', 'age']);
    expect(result.rows).toHaveLength(rowCount);
  });

  it('preserves header names exactly', async () => {
    const file = createMockFile('First Name,Last Name\nJohn,Doe');
    const result = await parseCsv(file);

    expect(result.headers).toEqual(['First Name', 'Last Name']);
    expect(result.rows[0]).toEqual({
      'First Name': 'John',
      'Last Name': 'Doe',
    });
  });

  it('handles empty CSV', async () => {
    const file = createMockFile('');
    const result = await parseCsv(file);

    expect(result.headers).toEqual([]);
    expect(result.rows).toEqual([]);
  });

  it('skips empty lines', async () => {
    const file = createMockFile('name,age\n\nJohn,30\n\nJane,25\n');
    const result = await parseCsv(file);

    expect(result.rows).toEqual([
      { name: 'John', age: '30' },
      { name: 'Jane', age: '25' },
    ]);
  });
});
